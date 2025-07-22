// Opinion page functionality
let currentOpinionData = {};
let scrollY = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    displayCurrentDate();
    wrapWordsInTitle();
    initializeCategoryFilters();
    initializeSorting();
    initializeLoadMore();
    initializeMobileMenu();
    initializeOpinionModal();
    animateOpinionCards();
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
    const opinionTitle = document.querySelector('.opinion-title');
    if (opinionTitle && !opinionTitle.querySelector('.word')) {
        const text = opinionTitle.textContent.trim();
        const words = text.split(' ');
        opinionTitle.innerHTML = words
            .map(word => `<span class="word">${word}</span>`)
            .join(' ');
    }
}

function initializeCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const opinionCards = document.querySelectorAll('.opinion-card');
    const featuredEditorial = document.querySelector('.featured-editorial');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards and featured article
            filterOpinions(category, opinionCards, featuredEditorial);
        });
    });
}

function filterOpinions(category, cards, featuredEditorial) {
    // Handle featured editorial
    const featuredCategory = featuredEditorial.dataset.category;
    if (category === 'all' || featuredCategory === category) {
        featuredEditorial.style.display = 'block';
    } else {
        featuredEditorial.style.display = 'none';
    }

    // Handle opinion cards
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
            sortOpinions(sortBy);
        });
    }
}

function sortOpinions(sortBy) {
    const opinionsGrid = document.getElementById('opinionsGrid');
    const cards = Array.from(opinionsGrid.querySelectorAll('.opinion-card'));
    
    cards.sort((a, b) => {
        switch(sortBy) {
            case 'latest':
                return getTimeValue(a) - getTimeValue(b);
            case 'popular':
                return getPopularityScore(b) - getPopularityScore(a);
            case 'controversial':
                return getControversyScore(b) - getControversyScore(a);
            default:
                return 0;
        }
    });
    
    cards.forEach(card => opinionsGrid.appendChild(card));
    animateOpinionCards();
}

function getTimeValue(card) {
    const timeText = card.querySelector('.opinion-time').textContent;
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
        if (text.includes('Comments')) {
            score += parseInt(text.match(/\d+/)[0]) * 1;
        } else if (text.includes('Shares')) {
            score += parseInt(text.match(/\d+/)[0]) * 2;
        }
    });
    return score;
}

function getControversyScore(card) {
    // Simulate controversy score based on comments and category
    const comments = parseInt(card.querySelector('.stat').textContent.match(/\d+/)[0]);
    const category = card.dataset.category;
    let multiplier = 1;
    
    if (category === 'debate') multiplier = 2;
    if (category === 'editorial') multiplier = 1.5;
    
    return comments * multiplier;
}

function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreOpinions();
        });
    }
}

function loadMoreOpinions() {
    const opinionsGrid = document.getElementById('opinionsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        const newOpinions = [
            {
                category: 'columns',
                author: 'Dr. Lisa Wang',
                title: 'The Economics of Remote Work: A New Paradigm',
                excerpt: 'Remote work has fundamentally changed not just how we work, but the entire economic landscape of cities and rural areas.',
                time: '12 hours ago',
                avatar: 'LW',
                authorTitle: 'Economics Professor',
                comments: '78',
                shares: '92'
            },
            {
                category: 'guest',
                author: 'Mark Stevens',
                title: 'Healthcare Innovation: Lessons from the Pandemic',
                excerpt: 'The rapid development of vaccines showed what\'s possible when we prioritize public health innovation over traditional bureaucracy.',
                time: '14 hours ago',
                avatar: 'MS',
                authorTitle: 'Public Health Expert',
                comments: '134',
                shares: '201'
            },
            {
                category: 'letters',
                author: 'Letters to Editor',
                title: '"Why Local Journalism Matters More Than Ever"',
                excerpt: 'Readers respond to our recent series on media consolidation with passionate defenses of community reporting.',
                time: '16 hours ago',
                avatar: 'LE',
                authorTitle: 'Reader Letters',
                comments: '56',
                shares: '89'
            }
        ];
        
        newOpinions.forEach((opinion, index) => {
            const opinionElement = createOpinionElement(opinion, index + 7);
            opinionsGrid.appendChild(opinionElement);
        });
        
        loadMoreBtn.textContent = 'Load More Opinions';
        loadMoreBtn.disabled = false;
        
        const newCards = opinionsGrid.querySelectorAll('.opinion-card:nth-last-child(-n+3)');
        newCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 1500);
}

function createOpinionElement(opinion, index) {
    const opinionDiv = document.createElement('article');
    opinionDiv.className = 'opinion-card';
    opinionDiv.dataset.category = opinion.category;
    opinionDiv.style.opacity = '0';
    opinionDiv.style.transform = 'translateY(20px)';
    opinionDiv.style.transition = 'all 0.6s ease';
    
    let headerContent;
    if (opinion.category === 'letters') {
        headerContent = `
            <div class="letter-header">LETTERS TO THE EDITOR</div>
            <div class="opinion-meta">
                <span class="opinion-category">Reader Letter</span>
                <span class="opinion-time">${opinion.time}</span>
            </div>
        `;
    } else {
        headerContent = `
            <div class="author-info">
                <div class="author-avatar">${opinion.avatar}</div>
                <div class="author-details">
                    <h4 class="author-name">${opinion.author}</h4>
                    <p class="author-title">${opinion.authorTitle}</p>
                </div>
            </div>
            <div class="opinion-meta">
                <span class="opinion-category">${opinion.category.charAt(0).toUpperCase() + opinion.category.slice(1)}</span>
                <span class="opinion-time">${opinion.time}</span>
            </div>
        `;
    }
    
    opinionDiv.innerHTML = `
        <div class="card-header">
            ${headerContent}
        </div>
        <div class="card-content">
            <h3 class="card-title">${opinion.title}</h3>
            <p class="card-excerpt">${opinion.excerpt}</p>
            <div class="engagement-stats">
                <span class="stat">${opinion.comments} Comments</span>
                <span class="stat">${opinion.shares} Shares</span>
                <span class="stat">5 min read</span>
            </div>
            <a href="#" class="card-link">Read Opinion →</a>
        </div>
    `;
    
    return opinionDiv;
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

// Opinion Modal Functionality
function initializeOpinionModal() {
    const modal = document.getElementById('opinionModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    
    // Prevent modal content clicks from closing modal
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Add click handlers to all opinion elements
    document.addEventListener('click', function(e) {
        if (e.target.matches('.read-editorial-btn, .card-link') || 
            e.target.closest('.opinion-card') || 
            e.target.closest('.featured-editorial')) {
            
            e.preventDefault();
            e.stopPropagation();
            
            let opinionElement;
            if (e.target.matches('.read-editorial-btn')) {
                opinionElement = e.target.closest('.featured-editorial');
            } else if (e.target.matches('.card-link')) {
                opinionElement = e.target.closest('.opinion-card');
            } else {
                opinionElement = e.target.closest('.opinion-card, .featured-editorial');
            }
            
            if (opinionElement && !modal.classList.contains('active')) {
                openOpinionModal(opinionElement);
            }
        }
    });
    
    // Close modal handlers
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeOpinionModal();
        }
    });
    
    modalClose.addEventListener('click', function(e) {
        e.preventDefault();
        closeOpinionModal();
    });
    
    // Enhanced keyboard handling
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeOpinionModal();
            }
        }
    });
    
    // Initialize share buttons and engagement
    initializeOpinionEngagement();
}

function openOpinionModal(opinionElement) {
    const modal = document.getElementById('opinionModal');
    
    // Store current scroll position
    scrollY = window.scrollY;
    document.body.style.setProperty('--scroll-y', `-${scrollY}px`);
    document.body.classList.add('modal-open');
    
    // Extract opinion data
    const opinionData = extractOpinionData(opinionElement);
    
    // Populate modal with opinion data
    populateOpinionModal(opinionData);
    
    // Show modal
    modal.classList.add('active');
    
    // Focus management
    const closeButton = modal.querySelector('.modal-close');
    closeButton.focus();
}

function closeOpinionModal() {
    const modal = document.getElementById('opinionModal');
    
    setTimeout(() => {
        modal.classList.remove('active');
        
        // Restore body scroll and position
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('--scroll-y');
        window.scrollTo(0, scrollY);
    }, 300);
}

function extractOpinionData(opinionElement) {
    let title, category, time, author, excerpt, avatar;
    
    if (opinionElement.classList.contains('featured-editorial')) {
        title = opinionElement.querySelector('.editorial-title')?.textContent || 'Editorial';
        category = opinionElement.querySelector('.editorial-category')?.textContent || 'Editorial';
        time = opinionElement.querySelector('.editorial-date')?.textContent || 'Today';
        author = opinionElement.querySelector('.editorial-author')?.textContent || 'Editorial Board';
        excerpt = opinionElement.querySelector('.editorial-excerpt')?.textContent || '';
        avatar = 'EB';
    } else {
        title = opinionElement.querySelector('.card-title')?.textContent || 'Opinion';
        category = opinionElement.querySelector('.opinion-category')?.textContent || 'Opinion';
        time = opinionElement.querySelector('.opinion-time')?.textContent || '1 hour ago';
        author = opinionElement.querySelector('.author-name')?.textContent || 'Author';
        excerpt = opinionElement.querySelector('.card-excerpt')?.textContent || '';
        avatar = opinionElement.querySelector('.author-avatar')?.textContent || 'AU';
    }
    
    return {
        title,
        category,
        time,
        author,
        excerpt,
        avatar,
        content: generateOpinionContent(title, excerpt),
        authorBio: generateAuthorBio(author, category)
    };
}

function populateOpinionModal(data) {
    document.getElementById('modalCategory').textContent = data.category;
    document.getElementById('modalTime').textContent = data.time;
    document.getElementById('modalAuthor').textContent = data.author;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalLead').textContent = data.excerpt;
    document.getElementById('modalContent').innerHTML = data.content;
    
    // Update author bio
    document.getElementById('bioAvatar').textContent = data.avatar;
    document.getElementById('bioName').textContent = data.author;
    document.getElementById('bioDescription').textContent = data.authorBio;
    
    // Store current opinion data
    currentOpinionData = data;
}

function generateOpinionContent(title, excerpt) {
    const paragraphs = [
        `In examining this critical issue, we must consider the broader implications that extend far beyond the immediate circumstances. ${excerpt}`,
        
        `The evidence suggests a pattern that has been developing over recent months, with key stakeholders taking increasingly divergent positions on the fundamental questions at stake.`,
        
        `This perspective challenges conventional wisdom and asks us to reconsider assumptions that have long guided policy and public discourse. The time has come for a more nuanced understanding of these complex dynamics.`,
        
        `Critics argue that this approach oversimplifies a multifaceted issue, while supporters contend that bold action is necessary to address systemic problems that have persisted for too long.`,
        
        `The path forward requires careful consideration of competing interests and values, balancing immediate needs with long-term consequences. We must move beyond partisan rhetoric to find common ground.`,
        
        `Ultimately, this issue reflects broader tensions in our society about how we balance individual rights with collective responsibilities, innovation with stability, and progress with tradition.`,
        
        `The decisions we make today will shape the landscape for future generations. It is incumbent upon us to approach these challenges with both urgency and wisdom, ensuring that our actions reflect our highest aspirations and most deeply held values.`
    ];
    
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}

function generateAuthorBio(author, category) {
    const bios = {
        'Editorial Board': 'The Editorial Board represents the collective voice of The Daily Chronicle\'s editorial team, bringing together diverse perspectives and expertise.',
        'Dr. Jane Doe': 'Dr. Jane Doe is a political analyst and professor of public policy, specializing in economic policy and democratic institutions.',
        'Prof. Michael Smith': 'Professor Michael Smith is an environmental scientist and climate policy expert at the University Research Institute.',
        'Robert Johnson': 'Robert Johnson is The Daily Chronicle\'s technology columnist, covering the intersection of technology, privacy, and society.',
        'default': `${author} is a regular contributor to The Daily Chronicle, offering expert analysis and thoughtful commentary on current affairs.`
    };
    
    return bios[author] || bios['default'];
}

function initializeOpinionEngagement() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action-btn')) {
            const action = e.target.dataset.action;
            handleEngagementAction(action, e.target);
        }
        
        if (e.target.classList.contains('share-btn')) {
            const platform = e.target.dataset.platform;
            const title = currentOpinionData.title || 'Opinion from The Daily Chronicle';
            const url = window.location.href;
            
            shareOpinion(platform, title, url);
        }
    });
}

function handleEngagementAction(action, button) {
    const currentCount = parseInt(button.textContent.match(/\d+/)[0]) || 0;
    
    switch(action) {
        case 'like':
            button.textContent = `👍 Agree (${currentCount + 1})`;
            button.style.backgroundColor = '#e8f5e8';
            break;
        case 'disagree':
            button.textContent = `👎 Disagree (${currentCount + 1})`;
            button.style.backgroundColor = '#ffe8e8';
            break;
        case 'share':
            button.textContent = `📤 Shared!`;
            setTimeout(() => {
                button.textContent = '📤 Share';
            }, 2000);
            break;
    }
}

function shareOpinion(platform, title, url) {
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

function animateOpinionCards() {
    const opinionCards = document.querySelectorAll('.opinion-card');
    opinionCards.forEach((card, index) => {
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
