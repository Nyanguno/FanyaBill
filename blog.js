// Blog Articles Data
const blogArticles = [
    {
        id: 'free-invoice-templates',
        title: 'Free Invoice Templates: Create Professional Invoices in Minutes',
        excerpt: 'Discover how free invoice templates can transform your billing process and help you create professional invoices that get paid faster.',
        category: 'templates',
        author: 'FanyaBill Team',
        date: '2025-12-07',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['invoice templates', 'business', 'billing', 'free tools'],
        featured: true
    },
    {
        id: 'invoice-generator-guide',
        title: 'Invoice Generator: The Ultimate Guide to Streamlined Billing',
        excerpt: 'Learn how modern invoice generators can revolutionize your billing process with AI-powered features and automated workflows.',
        category: 'invoicing',
        author: 'FanyaBill Team',
        date: '2025-12-06',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['invoice generator', 'automation', 'business tools', 'efficiency']
    },
    {
        id: 'professional-invoice-design',
        title: 'Free Invoice Template: Make Your Business Look Professional',
        excerpt: 'Transform your business image with professionally designed invoice templates that build trust and encourage faster payments.',
        category: 'templates',
        author: 'FanyaBill Team',
        date: '2025-12-05',
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['professional design', 'branding', 'invoice templates', 'business image']
    },
    {
        id: 'invoice-customers-seconds',
        title: 'Invoice Your Customers in Seconds with Modern Technology',
        excerpt: 'Discover how AI-powered invoicing tools can help you create and send professional invoices in seconds, not hours.',
        category: 'ai-tools',
        author: 'FanyaBill Team',
        date: '2025-12-04',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['AI invoicing', 'speed', 'automation', 'modern business']
    },
    {
        id: 'small-business-invoicing-tips',
        title: '10 Essential Invoicing Tips for Small Business Success',
        excerpt: 'Master the art of invoicing with these proven strategies that will improve your cash flow and reduce payment delays.',
        category: 'business-tips',
        author: 'FanyaBill Team',
        date: '2025-12-03',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['small business', 'invoicing tips', 'cash flow', 'business success']
    },
    {
        id: 'ai-powered-business-tools',
        title: 'How AI is Revolutionizing Small Business Operations',
        excerpt: 'Explore how artificial intelligence is transforming small business operations, from invoicing to inventory management.',
        category: 'ai-tools',
        author: 'FanyaBill Team',
        date: '2025-12-02',
        readTime: '9 min read',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: ['artificial intelligence', 'business automation', 'small business', 'technology']
    }
];

// Global variables
let currentCategory = 'all';
let displayedArticles = 3;
const articlesPerLoad = 3;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBlog();
    setupEventListeners();
});

// Initialize blog functionality
function initializeBlog() {
    loadArticles();
    setupSearch();
    setupCategoryFilters();
}

// Setup event listeners
function setupEventListeners() {
    // Category filter buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterByCategory(category);
            
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreArticles);
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Search functionality
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// Load and display articles
function loadArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    if (!articlesGrid) return;

    const filteredArticles = getFilteredArticles();
    const articlesToShow = filteredArticles.slice(0, displayedArticles);
    
    articlesGrid.innerHTML = '';
    
    articlesToShow.forEach(article => {
        const articleCard = createArticleCard(article);
        articlesGrid.appendChild(articleCard);
    });

    // Update load more button visibility
    updateLoadMoreButton(filteredArticles.length);
}

// Create article card HTML
function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card fade-in';
    card.setAttribute('data-category', article.category);
    
    card.innerHTML = `
        <div class="article-card-image">
            <img src="${article.image}" alt="${article.title}" loading="lazy">
        </div>
        <div class="article-card-content">
            <span class="article-card-category">${getCategoryDisplayName(article.category)}</span>
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <div class="article-meta">
                <span class="author">${article.author}</span>
                <span class="date">${formatDate(article.date)}</span>
                <span class="read-time">${article.readTime}</span>
            </div>
            <a href="article.html?id=${article.id}" class="read-more-btn">
                Read More <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    return card;
}

// Get filtered articles based on current category and search
function getFilteredArticles() {
    let filtered = blogArticles;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(article => article.category === currentCategory);
    }
    
    // Filter by search term
    const searchTerm = document.getElementById('blogSearch')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(article => 
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    return filtered;
}

// Filter articles by category
function filterByCategory(category) {
    currentCategory = category;
    displayedArticles = articlesPerLoad;
    loadArticles();
    
    // Animate cards
    setTimeout(() => {
        const cards = document.querySelectorAll('.article-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
    }, 100);
}

// Load more articles
function loadMoreArticles() {
    const filteredArticles = getFilteredArticles();
    displayedArticles += articlesPerLoad;
    
    if (displayedArticles > filteredArticles.length) {
        displayedArticles = filteredArticles.length;
    }
    
    loadArticles();
    
    // Animate new cards
    setTimeout(() => {
        const cards = document.querySelectorAll('.article-card:not(.visible)');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
    }, 100);
}

// Update load more button visibility
function updateLoadMoreButton(totalArticles) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    if (displayedArticles >= totalArticles) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('blogSearch');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleSearch();
        }, 300);
    });
}

// Handle search input
function handleSearch() {
    displayedArticles = articlesPerLoad;
    loadArticles();
}

// Setup category filters
function setupCategoryFilters() {
    // Already handled in setupEventListeners
}

// Handle newsletter form submission
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('newsletterEmail').value;
    const statusDiv = document.getElementById('newsletterStatus');
    
    // Show loading state
    statusDiv.innerHTML = '<div class="loading">Subscribing...</div>';
    statusDiv.className = 'email-status';
    
    try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Successfully subscribed to our newsletter!';
        statusDiv.className = 'email-status success';
        document.getElementById('newsletterEmail').value = '';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            statusDiv.innerHTML = '';
            statusDiv.className = 'email-status';
        }, 5000);
        
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Something went wrong. Please try again.';
        statusDiv.className = 'email-status error';
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            statusDiv.innerHTML = '';
            statusDiv.className = 'email-status';
        }, 5000);
    }
}

// Utility functions
function getCategoryDisplayName(category) {
    const categoryMap = {
        'invoicing': 'Invoicing',
        'business-tips': 'Business Tips',
        'templates': 'Templates',
        'ai-tools': 'AI Tools'
    };
    return categoryMap[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Animation observer for fade-in effects
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements when they're added to the DOM
function observeElements() {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
        observer.observe(el);
    });
}

// Call observeElements after loading articles
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(observeElements, 100);
});

// Export functions for use in other scripts
window.blogFunctions = {
    loadArticles,
    filterByCategory,
    handleSearch,
    blogArticles
};

