// Lifestyle page functionality
let currentLifestyleData = {};
let scrollY = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    displayCurrentDate();
    wrapWordsInTitle();
    initializeCategoryFilters();
    initializeSorting();
    initializeLoadMore();
    initializeNewsletter();
    initializeMobileMenu();
    initializeLifestyleModal();
    initializeTrendingItems();
    animateLifestyleCards();
});

function displayCurrentDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const dateString = now.toLocaleDateString('en-US', options);
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        currentDateElement.textContent = dateString;
    }
}

function wrapWordsInTitle() {
    const lifestyleTitle = document.querySelector('.lifestyle-title');
    if (lifestyleTitle && !lifestyleTitle.querySelector('.word')) {
        const text = lifestyleTitle.textContent.trim();
        const words = text.split(' ');
        lifestyleTitle.innerHTML = words
            .map(word => `<span class="word">${word}</span>`)
            .join(' ');
    }
}

function initializeCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const lifestyleCards = document.querySelectorAll('.lifestyle-card');
    const featuredArticle = document.querySelector('.featured-article');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards and featured article
            filterLifestyle(category, lifestyleCards, featuredArticle);
        });
    });
}

function filterLifestyle(category, cards, featuredArticle) {
    // Handle featured article
    const featuredCategory = featuredArticle.dataset.category;
    if (category === 'all' || featuredCategory === category) {
        featuredArticle.style.display = 'block';
    } else {
        featuredArticle.style.display = 'none';
    }

    // Handle lifestyle cards
    cards.forEach((card, index) => {
        const cardCategory = card.dataset.category;
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
        } else {
            card.style.display = 'none';
        }
    });
}

function initializeSorting() {
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortLifestyle(sortBy);
        });
    }
}

function sortLifestyle(sortBy) {
    const lifestyleGrid = document.getElementById('lifestyleGrid');
    const cards = Array.from(lifestyleGrid.querySelectorAll('.lifestyle-card'));
    
    cards.sort((a, b) => {
        switch(sortBy) {
            case 'latest':
                return getTimeValue(a) - getTimeValue(b);
            case 'popular':
                return getPopularityScore(b) - getPopularityScore(a);
            case 'trending':
                return getTrendingScore(b) - getTrendingScore(a);
            default:
                return 0;
        }
    });
    
    cards.forEach(card => lifestyleGrid.appendChild(card));
    animateLifestyleCards();
}

function getTimeValue(card) {
    const timeText = card.querySelector('.card-time').textContent;
    if (timeText.includes('hour')) {
        return parseInt(timeText.match(/\d+/)[0]);
    } else if (timeText.includes('day')) {
        return parseInt(timeText.match(/\d+/)[0]) * 24;
    }
    return 0;
}

function getPopularityScore(card) {
    const stats = card.querySelectorAll('.stat');
    let score = 0;
    stats.forEach(stat => {
        const text = stat.textContent;
        if (text.includes('likes')) {
            score += parseInt(text.match(/\d+/)[0]) * 2;
        } else if (text.includes('comments')) {
            score += parseInt(text.match(/\d+/)[0]) * 1;
        }
    });
    return score;
}

function getTrendingScore(card) {
    // Simulate trending score based on category popularity and engagement
    const category = card.dataset.category;
    const popularity = getPopularityScore(card);
    const trendingMultipliers = {
        'wellness': 1.5,
        'travel': 1.3,
        'food': 1.2,
        'fashion': 1.1,
        'culture': 1.0,
        'home': 0.9
    };
    
    return popularity * (trendingMultipliers[category] || 1.0);
}

function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreLifestyle();
        });
    }
}

function loadMoreLifestyle() {
    const lifestyleGrid = document.getElementById('lifestyleGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    loadMoreBtn.textContent = 'Loading Stories...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        const newLifestyle = [
            {
                category: 'wellness',
                author: 'Dr. Amanda Walsh',
                title: 'The Science of Happiness: Daily Habits That Transform Your Mind',
                excerpt: 'Research-backed strategies for building lasting happiness through simple daily practices that anyone can implement.',
                time: '16 hours ago',
                likes: '356',
                comments: '87'
            },
            {
                category: 'travel',
                author: 'Michael Chen',
                title: 'Sustainable Travel: Exploring the World Responsibly',
                excerpt: 'How to minimize your environmental impact while still experiencing the joy and wonder of global exploration.',
                time: '18 hours ago',
                likes: '298',
                comments: '64'
            },
            {
                category: 'food',
                author: 'Chef Rosa Delgado',
                title: 'Plant-Based Comfort Foods That Actually Satisfy',
                excerpt: 'Discover hearty, satisfying plant-based versions of your favorite comfort foods that don\'t compromise on flavor.',
                time: '20 hours ago',
                likes: '412',
                comments: '92'
            }
        ];
        
        newLifestyle.forEach((lifestyle, index) => {
            const lifestyleElement = createLifestyleElement(lifestyle, index + 7);
            lifestyleGrid.appendChild(lifestyleElement);
        });
        
        loadMoreBtn.textContent = 'Discover More Stories';
        loadMoreBtn.disabled = false;
        
        const newCards = lifestyleGrid.querySelectorAll('.lifestyle-card:nth-last-child(-n+3)');
        newCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 1500);
}

function createLifestyleElement(lifestyle, index) {
    const lifestyleDiv = document.createElement('article');
    lifestyleDiv.className = 'lifestyle-card';
    lifestyleDiv.dataset.category = lifestyle.category;
    lifestyleDiv.style.opacity = '0';
    lifestyleDiv.style.transform = 'translateY(20px)';
    lifestyleDiv.style.transition = 'all 0.6s ease';
    
    lifestyleDiv.innerHTML = `
        <div class="card-image">
            <div class="image-placeholder">${lifestyle.category.charAt(0).toUpperCase() + lifestyle.category.slice(1)} Content</div>
            <div class="card-category-badge">${lifestyle.category.charAt(0).toUpperCase() + lifestyle.category.slice(1)}</div>
        </div>
        <div class="card-content">
            <div class="card-meta">
                <span class="card-author">${lifestyle.author}</span>
                <span class="card-time">${lifestyle.time}</span>
            </div>
            <h3 class="card-title">${lifestyle.title}</h3>
            <p class="card-excerpt">${lifestyle.excerpt}</p>
            <div class="card-stats">
                <span class="stat">🕓 5 min read</span>
                <span class="stat">❤️ ${lifestyle.likes} likes</span>
                <span class="stat">💬 ${lifestyle.comments} comments</span>
            </div>
            <a href="#" class="card-link">Read More →</a>
        </div>
    `;
    
    return lifestyleDiv;
}

function initializeNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('.newsletter-input').value;
            const btn = this.querySelector('.newsletter-btn');
            
            btn.textContent = 'Subscribing...';
            btn.disabled = true;
            
            setTimeout(() => {
                alert(`Welcome to our lifestyle community, ${email}! Check your inbox for a welcome message.`);
                this.reset();
                btn.textContent = 'Subscribe';
                btn.disabled = false;
            }, 1500);
        });
    }
}

function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }
}

function initializeTrendingItems() {
    const trendingItems = document.querySelectorAll('.trending-item');
    trendingItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('.trending-title').textContent;
            const category = this.dataset.category;
            
            // Create a mock article object for the trending item
            const trendingData = {
                title: title,
                category: category,
                author: 'Chronicle Staff',
                time: '2 hours ago',
                excerpt: 'This trending story has captured readers\' attention with its insightful perspective and practical advice.',
                content: generateLifestyleContent(title, 'trending story'),
                tags: ['Trending', category.charAt(0).toUpperCase() + category.slice(1), 'Popular']
            };
            
            // Open modal with trending content
            openLifestyleModal(null, trendingData);
        });
    });
}

// Lifestyle Modal Functionality
function initializeLifestyleModal() {
    const modal = document.getElementById('lifestyleModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    
    // Prevent modal content clicks from closing modal
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Add click handlers to all lifestyle elements
    document.addEventListener('click', function(e) {
        if (e.target.matches('.read-feature-btn, .card-link') || 
            e.target.closest('.lifestyle-card') || 
            e.target.closest('.featured-article')) {
            
            e.preventDefault();
            e.stopPropagation();
            
            let lifestyleElement;
            if (e.target.matches('.read-feature-btn')) {
                lifestyleElement = e.target.closest('.featured-article');
            } else if (e.target.matches('.card-link')) {
                lifestyleElement = e.target.closest('.lifestyle-card');
            } else {
                lifestyleElement = e.target.closest('.lifestyle-card, .featured-article');
            }
            
            if (lifestyleElement && !modal.classList.contains('active')) {
                openLifestyleModal(lifestyleElement);
            }
        }
    });
    
    // Close modal handlers
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeLifestyleModal();
        }
    });
    
    modalClose.addEventListener('click', function(e) {
        e.preventDefault();
        closeLifestyleModal();
    });
    
    // Enhanced keyboard handling
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeLifestyleModal();
            }
        }
    });
    
    // Initialize engagement buttons
    initializeLifestyleEngagement();
}

function openLifestyleModal(lifestyleElement, customData = null) {
    const modal = document.getElementById('lifestyleModal');
    
    // Store current scroll position
    scrollY = window.scrollY;
    document.body.style.setProperty('--scroll-y', `-${scrollY}px`);
    document.body.classList.add('modal-open');
    
    // Extract lifestyle data
    const lifestyleData = customData || extractLifestyleData(lifestyleElement);
    
    // Populate modal with lifestyle data
    populateLifestyleModal(lifestyleData);
    
    // Show modal
    modal.classList.add('active');
    
    // Focus management
    const closeButton = modal.querySelector('.modal-close');
    closeButton.focus();
}

function closeLifestyleModal() {
    const modal = document.getElementById('lifestyleModal');
    
    setTimeout(() => {
        modal.classList.remove('active');
        
        // Restore body scroll and position
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('--scroll-y');
        window.scrollTo(0, scrollY);
    }, 300);
}

function extractLifestyleData(lifestyleElement) {
    let title, category, time, author, excerpt, tags = [];
    
    if (lifestyleElement.classList.contains('featured-article')) {
        title = lifestyleElement.querySelector('.feature-title')?.textContent || 'Featured Article';
        category = lifestyleElement.querySelector('.feature-category')?.textContent || 'Lifestyle';
        time = lifestyleElement.querySelector('.feature-time')?.textContent || 'Today';
        author = lifestyleElement.querySelector('.feature-author')?.textContent || 'Author';
        excerpt = lifestyleElement.querySelector('.feature-excerpt')?.textContent || '';
        
        // Extract tags from featured article
        const tagElements = lifestyleElement.querySelectorAll('.tag');
        tags = Array.from(tagElements).map(tag => tag.textContent);
    } else {
        title = lifestyleElement.querySelector('.card-title')?.textContent || 'Lifestyle Article';
        category = lifestyleElement.querySelector('.card-category-badge')?.textContent || 'Lifestyle';
        time = lifestyleElement.querySelector('.card-time')?.textContent || '1 hour ago';
        author = lifestyleElement.querySelector('.card-author')?.textContent || 'Author';
        excerpt = lifestyleElement.querySelector('.card-excerpt')?.textContent || '';
        
        // Generate tags based on category
        tags = generateLifestyleTags(category);
    }
    
    return {
        title,
        category,
        time,
        author,
        excerpt,
        tags,
        content: generateLifestyleContent(title, excerpt)
    };
}

function populateLifestyleModal(data) {
    document.getElementById('modalCategory').textContent = data.category;
    document.getElementById('modalTime').textContent = data.time;
    document.getElementById('modalAuthor').textContent = data.author;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalLead').textContent = data.excerpt;
    document.getElementById('modalContent').innerHTML = data.content;
    document.getElementById('modalImage').textContent = `${data.category} Feature Image`;
    document.getElementById('modalCaption').textContent = `${data.title} - Visual story`;
    
    // Update tags
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = data.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    // Store current lifestyle data
    currentLifestyleData = data;
}

function generateLifestyleTags(category) {
    const tagSets = {
        'culture': ['Culture', 'Arts', 'Community'],
        'travel': ['Travel', 'Adventure', 'Destinations'],
        'food': ['Food', 'Recipes', 'Culinary'],
        'wellness': ['Wellness', 'Health', 'Mindfulness'],
        'fashion': ['Fashion', 'Style', 'Trends'],
        'home': ['Home', 'Design', 'Living'],
        'default': ['Lifestyle', 'Inspiration', 'Living Well']
    };
    
    return tagSets[category.toLowerCase()] || tagSets['default'];
}

function generateLifestyleContent(title, excerpt) {
    const lifestyleContent = [
        `In today's fast-paced world, finding moments of genuine fulfillment requires intentional choices and mindful practices. ${excerpt}`,
        
        `This exploration into lifestyle and culture reveals patterns that can transform how we approach our daily experiences, from the mundane to the extraordinary.`,
        
        `The intersection of personal well-being and cultural expression creates opportunities for authentic living that honors both individual needs and community connections.`,
        
        `Research and real-world experience converge to show us that small, consistent changes in our lifestyle choices can yield profound improvements in our overall quality of life.`,
        
        `Whether through travel, culinary adventures, wellness practices, or creative expression, the path to a more fulfilling lifestyle is uniquely personal yet universally understood.`,
        
        `The key lies in finding sustainable practices that align with our values while remaining open to new experiences that expand our horizons and deepen our understanding of what it means to live well.`,
        
        `As we navigate this journey of lifestyle enhancement, we discover that the most meaningful changes often come from embracing simplicity, authenticity, and genuine connections with others who share our aspirations for a richer, more purposeful existence.`
    ];
    
    return lifestyleContent.map(p => `<p>${p}</p>`).join('');
}

function initializeLifestyleEngagement() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action-btn')) {
            const action = e.target.dataset.action;
            handleLifestyleAction(action, e.target);
        }
        
        if (e.target.classList.contains('share-btn')) {
            const platform = e.target.dataset.platform;
            const title = currentLifestyleData.title || 'Lifestyle Story from The Daily Chronicle';
            const url = window.location.href;
            
            shareLifestyle(platform, title, url);
        }
    });
}

function handleLifestyleAction(action, button) {
    switch(action) {
        case 'like':
            const currentLikes = parseInt(button.textContent.match(/\d+/)[0]) || 247;
            button.textContent = `❤️ Liked (${currentLikes + 1})`;
            button.style.backgroundColor = '#ffe8e8';
            button.style.color = '#d63384';
            break;
        case 'bookmark':
            button.textContent = `🔖 Saved`;
            button.style.backgroundColor = '#e8f5e8';
            setTimeout(() => {
                button.textContent = '🔖 Save';
                button.style.backgroundColor = '';
            }, 2000);
            break;
        case 'share':
            button.textContent = `📤 Shared!`;
            setTimeout(() => {
                button.textContent = '📤 Share';
            }, 2000);
            break;
    }
}

function shareLifestyle(platform, title, url) {
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

function animateLifestyleCards() {
    const lifestyleCards = document.querySelectorAll('.lifestyle-card');
    lifestyleCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Smooth scrolling and navbar effects
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = '#ffffff';
            navbar.style.backdropFilter = 'none';
        }
    }
});
