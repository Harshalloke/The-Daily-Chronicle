// Contact page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    displayCurrentDate();
    wrapWordsInTitle();
    initializeFormAnimations();
    initializeContactForm();
    initializeMobileMenu();
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
    const contactTitle = document.querySelector('.contact-title');
    if (contactTitle && !contactTitle.querySelector('.word')) {
        const text = contactTitle.textContent.trim();
        const words = text.split(' ');
        contactTitle.innerHTML = words
            .map(word => `<span class="word">${word}</span>`)
            .join(' ');
    }
}

function initializeFormAnimations() {
    // Add stagger animation delays to form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${2.4 + (index * 0.1)}s`;
        group.style.animation = 'fadeInUp 0.6s ease-out both';
    });

    // Input focus animations
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
}

function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
}

function handleContactSubmission(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        newsletter: document.getElementById('newsletter').checked
    };
    
    // Validate form
    if (!validateForm(formData)) {
        return;
    }
    
    // Add loading state
    const submitBtn = e.target.querySelector('.contact-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending Message...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Here you would normally send data to your backend
        console.log('Contact form submitted:', formData);
        
        // Reset form
        e.target.reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showSuccessMessage();
    }, 2000);
}

function validateForm(data) {
    if (!data.firstName || !data.lastName) {
        alert('Please fill in your full name.');
        return false;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    if (!data.subject) {
        alert('Please select a subject.');
        return false;
    }
    
    if (!data.message || data.message.length < 10) {
        alert('Please enter a message with at least 10 characters.');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSuccessMessage() {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border: 2px solid #000;
        padding: 30px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;
    
    successDiv.innerHTML = `
        <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 15px; color: #000;">Message Sent!</h3>
        <p style="color: #666; margin-bottom: 20px;">Thank you for contacting The Daily Chronicle. We'll get back to you soon.</p>
        <button onclick="this.parentElement.remove()" style="padding: 10px 20px; border: 1px solid #000; background: #000; color: #fff; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 5000);
}

function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a nav link
        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }
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

// Department item hover effects
document.querySelectorAll('.department-item').forEach(item => {
    item.addEventListener('click', function() {
        const email = this.querySelector('.dept-contact').textContent;
        window.location.href = `mailto:${email}`;
    });
});
