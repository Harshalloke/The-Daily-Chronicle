// Content Management System
class CMSManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.articles = [];
        this.users = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.editor = null;
        
        this.initialize();
    }

    initialize() {
        // Check admin authentication
        if (!this.checkAdminAuth()) {
            window.location.href = '../login.html?returnUrl=admin/index.html';
            return;
        }

        // Setup navigation
        this.setupNavigation();
        
        // Setup sections
        this.setupDashboard();
        this.setupArticleManagement();
        this.setupEditor();
        this.setupMediaLibrary();
        
        // Load initial data
        this.loadDashboardData();
    }

    checkAdminAuth() {
        if (!auth.isAuthenticated()) {
            return false;
        }
        
        // Check if user has admin role
        if (auth.user.role !== 'admin' && auth.user.role !== 'editor') {
            return false;
        }
        
        return true;
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.admin-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                
                // Update active states
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                link.classList.add('active');
                document.getElementById(sectionId + '-section').classList.add('active');
                
                this.currentSection = sectionId;
                this.loadSectionData(sectionId);
            });
        });

        // Setup logout
        document.getElementById('adminLogout').addEventListener('click', () => {
            auth.logout();
        });
    }

    async loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'articles':
                await this.loadArticles();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.updateDashboardStats(data);
                this.loadRecentActivity();
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    updateDashboardStats(data) {
        document.getElementById('totalArticles').textContent = data.totalArticles || 0;
        document.getElementById('totalUsers').textContent = data.totalUsers || 0;
        document.getElementById('totalComments').textContent = data.totalComments || 0;
        document.getElementById('totalViews').textContent = data.totalViews || 0;
    }

    async loadRecentActivity() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/activity`, {
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                const activities = await response.json();
                this.renderRecentActivity(activities);
            }
        } catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    }

    renderRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.description}</div>
                    <div class="activity-time">${this.formatTime(activity.createdAt)}</div>
                </div>
            </div>
        `).join('');
    }

    setupArticleManagement() {
        // Setup filters
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterArticles();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterArticles();
        });

        document.getElementById('articleSearch').addEventListener('input', () => {
            this.filterArticles();
        });

        // Setup create article button
        document.getElementById('createArticleBtn').addEventListener('click', () => {
            this.showEditor();
        });
    }

    async loadArticles() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/articles?page=${this.currentPage}&limit=${this.itemsPerPage}`, {
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.articles = data.articles;
                this.renderArticlesTable();
                this.renderPagination(data.totalPages, data.currentPage);
            }
        } catch (error) {
            console.error('Failed to load articles:', error);
        }
    }

    renderArticlesTable() {
        const tbody = document.getElementById('articlesTableBody');
        tbody.innerHTML = this.articles.map(article => `
            <tr>
                <td>
                    <div class="article-title">
                        <strong>${article.title}</strong>
                        ${article.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                </td>
                <td>${article.author}</td>
                <td>
                    <span class="category-tag ${article.category}">${article.category}</span>
                </td>
                <td>
                    <span class="status-badge ${article.status}">${article.status}</span>
                </td>
                <td>${this.formatDate(article.createdAt)}</td>
                <td>${article.views || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm" onclick="cms.editArticle('${article._id}')">Edit</button>
                        <button class="btn-sm danger" onclick="cms.deleteArticle('${article._id}')">Delete</button>
                        ${article.status === 'draft' ? 
                            `<button class="btn-sm" onclick="cms.publishArticle('${article._id}')">Publish</button>` : 
                            `<button class="btn-sm" onclick="cms.unpublishArticle('${article._id}')">Unpublish</button>`
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupEditor() {
        const editor = document.getElementById('contentEditor');
        const toolbar = document.querySelectorAll('.editor-btn');

        // Setup toolbar buttons
        toolbar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                
                if (command === 'createLink') {
                    const url = prompt('Enter URL:');
                    if (url) {
                        document.execCommand(command, false, url);
                    }
                } else {
                    document.execCommand(command, false, null);
                }
                
                editor.focus();
            });
        });

        // Setup custom quote button
        document.getElementById('insertQuote').addEventListener('click', (e) => {
            e.preventDefault();
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            
            const quote = document.createElement('blockquote');
            quote.className = 'article-quote';
            quote.textContent = selection.toString() || 'Quote text here';
            
            range.deleteContents();
            range.insertNode(quote);
            
            editor.focus();
        });

        // Setup image upload
        const imageUpload = document.getElementById('featuredImage');
        const imagePreview = document.getElementById('imagePreview');
        
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Setup form submission
        document.getElementById('saveDraftBtn').addEventListener('click', () => {
            this.saveArticle('draft');
        });

        document.getElementById('publishBtn').addEventListener('click', () => {
            this.saveArticle('published');
        });
    }

    showEditor(articleId = null) {
        // Switch to create section
        document.querySelector('.nav-link[data-section="create"]').click();
        
        if (articleId) {
            this.loadArticleForEdit(articleId);
            document.getElementById('editorTitle').textContent = 'Edit Article';
        } else {
            this.resetEditor();
            document.getElementById('editorTitle').textContent = 'Create New Article';
        }
    }

    async loadArticleForEdit(articleId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}`, {
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                const article = await response.json();
                this.populateEditor(article);
            }
        } catch (error) {
            console.error('Failed to load article:', error);
        }
    }

    populateEditor(article) {
        document.getElementById('articleId').value = article._id;
        document.getElementById('articleTitle').value = article.title;
        document.getElementById('articleCategory').value = article.category;
        document.getElementById('articleAuthor').value = article.author;
        document.getElementById('articleExcerpt').value = article.excerpt;
        document.getElementById('articleTags').value = article.tags.join(', ');
        document.getElementById('contentEditor').innerHTML = article.content;
        document.getElementById('featuredArticle').checked = article.featured;
        document.getElementById('allowComments').checked = article.allowComments;
        
        if (article.featuredImage) {
            document.getElementById('imagePreview').innerHTML = 
                `<img src="${article.featuredImage}" alt="Featured Image">`;
        }
    }

    resetEditor() {
        document.getElementById('articleForm').reset();
        document.getElementById('articleId').value = '';
        document.getElementById('contentEditor').innerHTML = '<p>Start writing your article here...</p>';
        document.getElementById('imagePreview').innerHTML = '<span>Click to upload image or drag and drop</span>';
    }

    async saveArticle(status) {
        const form = document.getElementById('articleForm');
        const formData = new FormData();
        
        // Get content from editor
        const content = document.getElementById('contentEditor').innerHTML;
        document.getElementById('articleContent').value = content;
        
        // Append form data
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData.append(input.name, input.checked);
            } else if (input.type === 'file') {
                if (input.files[0]) {
                    formData.append(input.name, input.files[0]);
                }
            } else {
                formData.append(input.name, input.value);
            }
        });
        
        formData.append('status', status);
        formData.append('content', content);
        
        try {
            const articleId = document.getElementById('articleId').value;
            const url = articleId ? 
                `${API_BASE_URL}/admin/articles/${articleId}` : 
                `${API_BASE_URL}/admin/articles`;
            const method = articleId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(`Article ${status === 'published' ? 'published' : 'saved'} successfully!`, 'success');
                
                // Refresh articles list if we're viewing it
                if (this.currentSection === 'articles') {
                    this.loadArticles();
                }
                
                // Clear form if creating new
                if (!articleId) {
                    this.resetEditor();
                }
            } else {
                throw new Error('Failed to save article');
            }
        } catch (error) {
            console.error('Save article error:', error);
            this.showNotification('Failed to save article. Please try again.', 'error');
        }
    }

    async editArticle(articleId) {
        this.showEditor(articleId);
    }

    async deleteArticle(articleId) {
        if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}`, {
                method: 'DELETE',
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                this.showNotification('Article deleted successfully!', 'success');
                this.loadArticles();
            } else {
                throw new Error('Failed to delete article');
            }
        } catch (error) {
            console.error('Delete article error:', error);
            this.showNotification('Failed to delete article. Please try again.', 'error');
        }
    }

    async publishArticle(articleId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}/publish`, {
                method: 'PATCH',
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                this.showNotification('Article published successfully!', 'success');
                this.loadArticles();
            }
        } catch (error) {
            console.error('Publish article error:', error);
            this.showNotification('Failed to publish article.', 'error');
        }
    }

    async unpublishArticle(articleId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}/unpublish`, {
                method: 'PATCH',
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                this.showNotification('Article unpublished successfully!', 'success');
                this.loadArticles();
            }
        } catch (error) {
            console.error('Unpublish article error:', error);
            this.showNotification('Failed to unpublish article.', 'error');
        }
    }

    filterArticles() {
        const status = document.getElementById('statusFilter').value;
        const category = document.getElementById('categoryFilter').value;
        const search = document.getElementById('articleSearch').value.toLowerCase();
        
        let filtered = this.articles;
        
        if (status !== 'all') {
            filtered = filtered.filter(article => article.status === status);
        }
        
        if (category !== 'all') {
            filtered = filtered.filter(article => article.category === category);
        }
        
        if (search) {
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(search) ||
                article.author.toLowerCase().includes(search)
            );
        }
        
        this.renderFilteredArticles(filtered);
    }

    renderFilteredArticles(articles) {
        const tbody = document.getElementById('articlesTableBody');
        tbody.innerHTML = articles.map(article => `
            <tr>
                <td>
                    <div class="article-title">
                        <strong>${article.title}</strong>
                        ${article.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                </td>
                <td>${article.author}</td>
                <td>
                    <span class="category-tag ${article.category}">${article.category}</span>
                </td>
                <td>
                    <span class="status-badge ${article.status}">${article.status}</span>
                </td>
                <td>${this.formatDate(article.createdAt)}</td>
                <td>${article.views || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm" onclick="cms.editArticle('${article._id}')">Edit</button>
                        <button class="btn-sm danger" onclick="cms.deleteArticle('${article._id}')">Delete</button>
                        ${article.status === 'draft' ? 
                            `<button class="btn-sm" onclick="cms.publishArticle('${article._id}')">Publish</button>` : 
                            `<button class="btn-sm" onclick="cms.unpublishArticle('${article._id}')">Unpublish</button>`
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination(totalPages, currentPage) {
        const container = document.getElementById('articlesPagination');
        let html = '';
        
        if (currentPage > 1) {
            html += `<button class="page-btn" onclick="cms.changePage(${currentPage - 1})">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            const active = i === currentPage ? 'active' : '';
            html += `<button class="page-btn ${active}" onclick="cms.changePage(${i})">${i}</button>`;
        }
        
        if (currentPage < totalPages) {
            html += `<button class="page-btn" onclick="cms.changePage(${currentPage + 1})">Next</button>`;
        }
        
        container.innerHTML = html;
    }

    changePage(page) {
        this.currentPage = page;
        this.loadArticles();
    }

    setupMediaLibrary() {
        // Media library functionality would go here
        // Including image upload, management, etc.
    }

    // Utility methods
    getActivityIcon(type) {
        const icons = {
            'article_created': '📝',
            'article_published': '📰',
            'user_registered': '👤',
            'comment_posted': '💬'
        };
        return icons[type] || '📊';
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize CMS
const cms = new CMSManager();

// Make CMS available globally
window.cms = cms;
