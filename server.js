const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
mongoose.connect('mongodb://localhost:27017/daily-chronicle', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'user' },
    preferences: {
        categories: [String],
        notifications: [String]
    },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    readingHistory: [{
        article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
        readAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Article Schema
const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    excerpt: String,
    author: String,
    category: String,
    tags: [String],
    featuredImage: String,
    status: { type: String, default: 'draft' },
    featured: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    publishedAt: Date
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Article routes
app.get('/api/articles', async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const query = { status: 'published' };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const articles = await Article.find(query)
            .sort({ publishedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Article.countDocuments(query);
        
        res.json({
            articles,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin routes
app.get('/api/admin/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalArticles = await Article.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalViews = await Article.aggregate([
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);
        
        res.json({
            totalArticles,
            totalUsers,
            totalViews: totalViews[0]?.totalViews || 0,
            totalComments: 0 // Implement when comment system is added
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/admin/articles', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category } = req.query;
        const query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const articles = await Article.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Article.countDocuments(query);
        
        res.json({
            articles,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/api/admin/articles', authMiddleware, adminMiddleware, upload.single('featuredImage'), async (req, res) => {
    try {
        const articleData = {
            ...req.body,
            tags: req.body.tags.split(',').map(tag => tag.trim()),
            publishedAt: req.body.status === 'published' ? new Date() : null
        };
        
        if (req.file) {
            articleData.featuredImage = `/uploads/${req.file.filename}`;
        }
        
        const article = new Article(articleData);
        await article.save();
        
        res.status(201).json(article);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
