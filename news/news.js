// News page functionality
let currentArticleData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    displayCurrentDate();
    wrapWordsInTitle();
    initializeCategoryFilters();
    initializeSorting();
    initializeLoadMore();
    initializeNewsletter();
    initializeMobileMenu();
    initializeArticleModal();
    animateNewsCards();
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
    const newsTitle = document.querySelector('.news-title');
    if (newsTitle && !newsTitle.querySelector('.word')) {
        const text = newsTitle.textContent.trim();
        const words = text.split(' ');
        newsTitle.innerHTML = words
            .map(word => `<span class="word">${word}</span>`)
            .join(' ');
    }
}

function initializeCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const newsCards = document.querySelectorAll('.news-card');
    const featuredArticle = document.querySelector('.featured-article');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards and featured article
            filterCards(category, newsCards, featuredArticle);
        });
    });
}

function filterCards(category, cards, featuredArticle) {
    // Handle featured article
    const featuredCategory = featuredArticle.dataset.category;
    if (category === 'all' || featuredCategory === category) {
        featuredArticle.style.display = 'block';
    } else {
        featuredArticle.style.display = 'none';
    }

    // Handle news cards
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
            sortArticles(sortBy);
        });
    }
}

function sortArticles(sortBy) {
    const articlesGrid = document.getElementById('articlesGrid');
    const cards = Array.from(articlesGrid.querySelectorAll('.news-card'));
    
    cards.sort((a, b) => {
        switch(sortBy) {
            case 'latest':
                return getTimeValue(a) - getTimeValue(b);
            case 'oldest':
                return getTimeValue(b) - getTimeValue(a);
            case 'popular':
                return Math.random() - 0.5;
            default:
                return 0;
        }
    });
    
    cards.forEach(card => articlesGrid.appendChild(card));
    animateNewsCards();
}

function getTimeValue(card) {
    const timeText = card.querySelector('.card-time').textContent;
    const hours = parseInt(timeText.match(/\d+/)[0]);
    return hours;
}

function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreArticles();
        });
    }
}

function loadMoreArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        const newArticles = [
            {
                category: 'business',
                time: '9 hours ago',
                title: 'Market Analysis: Weekly Economic Trends',
                excerpt: 'Comprehensive analysis of this week\'s economic indicators and market performance across various sectors.',
                image: 'Business Image'
            },
            {
                category: 'world',
                time: '10 hours ago',
                title: 'International Cooperation Summit Concludes',
                excerpt: 'World leaders finalize agreements on multiple global initiatives during historic diplomatic meeting.',
                image: 'World Image'
            },
            {
                category: 'technology',
                time: '11 hours ago',
                title: 'Breakthrough in Quantum Computing Research',
                excerpt: 'Scientists achieve major milestone in quantum computing development, promising faster processing capabilities.',
                image: 'Tech Image'
            }
        ];
        
        newArticles.forEach((article, index) => {
            const articleElement = createArticleElement(article, index + 7);
            articlesGrid.appendChild(articleElement);
        });
        
        loadMoreBtn.textContent = 'Load More Stories';
        loadMoreBtn.disabled = false;
        
        const newCards = articlesGrid.querySelectorAll('.news-card:nth-last-child(-n+3)');
        newCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 1500);
}

function createArticleElement(article, index) {
    const articleDiv = document.createElement('article');
    articleDiv.className = 'news-card';
    articleDiv.dataset.category = article.category;
    articleDiv.style.opacity = '0';
    articleDiv.style.transform = 'translateY(20px)';
    articleDiv.style.transition = 'all 0.6s ease';
    
    articleDiv.innerHTML = `
        <div class="card-image">
            <div class="image-placeholder">${article.image}</div>
        </div>
        <div class="card-content">
            <div class="card-meta">
                <span class="card-category">${article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
                <span class="card-time">${article.time}</span>
            </div>
            <h3 class="card-title">${article.title}</h3>
            <p class="card-excerpt">${article.excerpt}</p>
            <a href="#" class="card-link">Read More →</a>
        </div>
    `;
    
    return articleDiv;
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
                alert(`Thank you for subscribing with ${email}!`);
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

// Article Modal Functionality
function initializeArticleModal() {
    const modal = document.getElementById('articleModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    
    // Add click handlers to all article links
    document.addEventListener('click', function(e) {
        if (e.target.matches('.read-more-btn, .card-link') || 
            e.target.closest('.news-card') || 
            e.target.closest('.featured-article')) {
            
            e.preventDefault();
            
            let articleElement;
            if (e.target.matches('.read-more-btn')) {
                articleElement = e.target.closest('.featured-article');
            } else if (e.target.matches('.card-link')) {
                articleElement = e.target.closest('.news-card');
            } else {
                articleElement = e.target.closest('.news-card, .featured-article');
            }
            
            if (articleElement) {
                openArticleModal(articleElement);
            }
        }
    });
    
    // Close modal handlers
    modalOverlay.addEventListener('click', closeArticleModal);
    modalClose.addEventListener('click', closeArticleModal);
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeArticleModal();
        }
    });
    
    // Initialize share buttons
    initializeShareButtons();
}

function openArticleModal(articleElement) {
    const modal = document.getElementById('articleModal');
    
    // Extract article data
    const articleData = extractArticleData(articleElement);
    
    // Populate modal with article data
    populateModalContent(articleData);
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Animate modal appearance
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.transform = 'translateY(50px) scale(0.95)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modalContent.style.transform = 'translateY(0) scale(1)';
        modalContent.style.opacity = '1';
    }, 50);
}

function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Animate modal disappearance
    modalContent.style.transform = 'translateY(30px) scale(0.95)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }, 300);
}

function extractArticleData(articleElement) {
    let title, category, time, excerpt, image;
    
    if (articleElement.classList.contains('featured-article')) {
        title = articleElement.querySelector('.article-title')?.textContent || 'Featured Article';
        category = articleElement.querySelector('.article-category')?.textContent || 'News';
        time = articleElement.querySelector('.article-time')?.textContent || '1 hour ago';
        excerpt = articleElement.querySelector('.article-excerpt')?.textContent || '';
        image = 'Featured Article Image';
    } else {
        title = articleElement.querySelector('.card-title')?.textContent || 'News Article';
        category = articleElement.querySelector('.card-category')?.textContent || 'News';
        time = articleElement.querySelector('.card-time')?.textContent || '1 hour ago';
        excerpt = articleElement.querySelector('.card-excerpt')?.textContent || '';
        image = articleElement.querySelector('.image-placeholder')?.textContent || 'Article Image';
    }
    
    return {
        title,
        category,
        time,
        excerpt,
        image,
        content: generateArticleContent(title, excerpt),
        tags: generateTags(category)
    };
}

function populateModalContent(data) {
    document.getElementById('modalCategory').textContent = data.category;
    document.getElementById('modalTime').textContent = data.time;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalImage').textContent = data.image;
    document.getElementById('modalCaption').textContent = `${data.title} - Photo illustration`;
    document.getElementById('modalLead').textContent = data.excerpt;
    document.getElementById('modalContent').innerHTML = data.content;
    
    // Update tags
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = data.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    // Store current article data
    currentArticleData = data;
}

function generateArticleContent(title, excerpt) {
    const paragraphs = [
        `In a developing story that has captured international attention, this ${title.toLowerCase()} represents a significant shift in current affairs. The implications of these developments are far-reaching and continue to unfold as experts analyze the situation.`,
        
        `According to sources close to the matter, the situation has evolved rapidly over the past 24 hours. Key stakeholders have been in continuous communication to address the various aspects of this complex issue.`,
        
        `<blockquote class="article-quote">
            "This development marks a crucial turning point that will likely influence future decisions and policy directions for months to come."
            <cite>— Senior Analyst, Chronicle Research Team</cite>
        </blockquote>`,
        
        `The broader context of this story reveals several interconnected factors that have contributed to the current state of affairs. Understanding these relationships is essential for grasping the full scope of the situation.`,
        
        `<h3 class="article-subheading">Key Developments</h3>`,
        
        `Recent updates have provided additional clarity on several fronts. The timeline of events shows a pattern that experts suggest was both predictable and surprising in its rapid progression.`,
        
        `<ul class="article-list">
            <li>Initial reports emerged early this morning from reliable sources</li>
            <li>Confirmation came through official channels within hours</li>
            <li>Public response has been swift and varied across different sectors</li>
            <li>Future implications are being carefully assessed by experts</li>
        </ul>`,
        
        `As this story continues to develop, The Daily Chronicle will provide ongoing coverage and analysis. Our newsroom remains committed to delivering accurate, timely information as new details emerge.`,
        
        `The long-term effects of these developments will likely become clearer in the coming days and weeks. For now, stakeholders are focusing on immediate responses and necessary adjustments to their strategies and operations.`
    ];
    
    return paragraphs.join('</p><p>').replace(/<p><blockquote|<p><h3|<p><ul/g, match => match.substring(3));
}

function generateTags(category) {
    const tagSets = {
        'World': ['International', 'Global Affairs', 'Politics'],
        'Business': ['Economy', 'Markets', 'Finance'],
        'Technology': ['Innovation', 'Digital', 'Tech Industry'],
        'Sports': ['Athletics', 'Competition', 'Sports News'],
        'Health': ['Medical', 'Wellness', 'Healthcare'],
        'default': ['Breaking News', 'Current Events', 'News']
    };
    
    return tagSets[category] || tagSets['default'];
}

function initializeShareButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('share-btn')) {
            const platform = e.target.dataset.platform;
            const title = currentArticleData.title || 'Article from The Daily Chronicle';
            const url = window.location.href;
            
            shareArticle(platform, title, url);
        }
    });
}

function shareArticle(platform, title, url) {
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

function animateNewsCards() {
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Smooth scrolling for anchor links
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

// Add scroll effect to navbar
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

// Interactive article hover effects
document.querySelectorAll('.news-card, .featured-article').forEach(article => {
    article.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    article.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});
// Enhanced modal functionality
let scrollY = 0;

function openArticleModal(articleElement) {
    const modal = document.getElementById('articleModal');
    
    // Store current scroll position
    scrollY = window.scrollY;
    
    // Prevent body scroll and maintain position
    document.body.style.setProperty('--scroll-y', `-${scrollY}px`);
    document.body.classList.add('modal-open');
    
    // Extract article data
    const articleData = extractArticleData(articleElement);
    
    // Add loading state
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.add('loading');
    
    // Show modal immediately
    modal.classList.add('active');
    
    // Simulate loading and populate content
    setTimeout(() => {
        populateModalContent(articleData);
        modalContent.classList.remove('loading');
        
        // Focus management for accessibility
        const closeButton = modal.querySelector('.modal-close');
        closeButton.focus();
    }, 200);
}

function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    const modalContent = modal.querySelector('.modal-content');
    const modalOverlay = modal.querySelector('.modal-overlay');
    
    // Add closing animation classes
    modalContent.classList.add('closing');
    modalOverlay.classList.add('closing');
    
    // Wait for animation to complete
    setTimeout(() => {
        modal.classList.remove('active');
        modalContent.classList.remove('closing');
        modalOverlay.classList.remove('closing');
        
        // Restore body scroll and position
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('--scroll-y');
        window.scrollTo(0, scrollY);
        
        // Clear any loading states
        modalContent.classList.remove('loading');
    }, 300);
}

// Enhanced modal initialization
function initializeArticleModal() {
    const modal = document.getElementById('articleModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    
    // Prevent modal content clicks from closing modal
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Add click handlers to all article elements
    document.addEventListener('click', function(e) {
        // Check if click is on article card, read more button, or card link
        if (e.target.matches('.read-more-btn, .card-link') || 
            e.target.closest('.news-card') || 
            e.target.closest('.featured-article')) {
            
            e.preventDefault();
            e.stopPropagation();
            
            let articleElement;
            if (e.target.matches('.read-more-btn')) {
                articleElement = e.target.closest('.featured-article');
            } else if (e.target.matches('.card-link')) {
                articleElement = e.target.closest('.news-card');
            } else {
                articleElement = e.target.closest('.news-card, .featured-article');
            }
            
            if (articleElement && !modal.classList.contains('active')) {
                openArticleModal(articleElement);
            }
        }
    });
    
    // Close modal handlers with improved event handling
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeArticleModal();
        }
    });
    
    modalClose.addEventListener('click', function(e) {
        e.preventDefault();
        closeArticleModal();
    });
    
    // Enhanced keyboard handling
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('active')) {
            switch(e.key) {
                case 'Escape':
                    e.preventDefault();
                    closeArticleModal();
                    break;
                case 'Tab':
                    // Trap focus within modal
                    trapFocus(modal, e);
                    break;
            }
        }
    });
    
    // Prevent scroll restoration on modal close
    modal.addEventListener('scroll', function(e) {
        e.stopPropagation();
    });
    
    // Initialize share buttons
    initializeShareButtons();
}

// Focus trap for accessibility
function trapFocus(modal, e) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}

// Enhanced window resize handling
window.addEventListener('resize', function() {
    const modal = document.getElementById('articleModal');
    if (modal.classList.contains('active')) {
        // Recalculate modal positioning on resize
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.maxHeight = `calc(100vh - 40px)`;
    }
});

// Prevent zoom issues on mobile
document.addEventListener('touchstart', function(e) {
    const modal = document.getElementById('articleModal');
    if (modal.classList.contains('active')) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }
});
