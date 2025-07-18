// Articles Management
// Handles article card generation and display

// Articles data structure
const articlesData = [
    {
        id: 'ats-guide-2024',
        title: 'The Ultimate Guide to ATS-Friendly Resumes in 2024',
        description: 'Master the art of creating resumes that pass through Applicant Tracking Systems and land in the hands of human recruiters.',
        category: 'resume',
        readTime: '8 min read',
        publishDate: '2024-12-15',
        author: 'Sarah Johnson',
        featured: true,
        url: 'articles/article-1.html',
        icon: 'fas fa-file-text'
    },
    {
        id: 'interview-questions-2024',
        title: 'Top 50 Interview Questions and How to Answer Them',
        description: 'Prepare for your next interview with our comprehensive guide to common questions and winning answers.',
        category: 'interview',
        readTime: '12 min read',
        publishDate: '2024-12-10',
        author: 'Michael Chen',
        featured: false,
        url: '#',
        icon: 'fas fa-comments'
    },
    {
        id: 'hidden-job-market',
        title: 'Hidden Job Market: Finding Opportunities Others Miss',
        description: 'Discover strategies to tap into the hidden job market where 80% of positions are filled without public posting.',
        category: 'job-search',
        readTime: '6 min read',
        publishDate: '2024-12-05',
        author: 'Emily Rodriguez',
        featured: false,
        url: '#',
        icon: 'fas fa-search'
    },
    {
        id: 'salary-negotiation',
        title: 'Salary Negotiation: Getting What You\'re Worth',
        description: 'Learn proven techniques to negotiate your salary and advance your career with confidence.',
        category: 'career',
        readTime: '10 min read',
        publishDate: '2024-11-28',
        author: 'David Park',
        featured: false,
        url: '#',
        icon: 'fas fa-chart-line'
    },
    {
        id: 'cover-letter-writing',
        title: 'Writing Compelling Cover Letters That Get Results',
        description: 'Stand out from the competition with cover letters that grab attention and open doors.',
        category: 'resume',
        readTime: '7 min read',
        publishDate: '2024-11-20',
        author: 'Lisa Thompson',
        featured: false,
        url: '#',
        icon: 'fas fa-pen'
    },
    {
        id: 'virtual-interviews',
        title: 'Virtual Interview Success: Tips for Remote Hiring',
        description: 'Master video interviews and make a great impression from home with these essential tips.',
        category: 'interview',
        readTime: '5 min read',
        publishDate: '2024-11-15',
        author: 'James Wilson',
        featured: false,
        url: '#',
        icon: 'fas fa-video'
    },
    {
        id: 'career-change-guide',
        title: 'Career Change at 40: A Complete Guide',
        description: 'Navigate a successful career transition with strategies for professionals over 40.',
        category: 'career',
        readTime: '15 min read',
        publishDate: '2024-11-08',
        author: 'Rachel Green',
        featured: false,
        url: '#',
        icon: 'fas fa-route'
    },
    {
        id: 'linkedin-optimization',
        title: 'LinkedIn Profile Optimization for Job Seekers',
        description: 'Transform your LinkedIn profile into a powerful job search tool that attracts recruiters.',
        category: 'job-search',
        readTime: '9 min read',
        publishDate: '2024-11-01',
        author: 'Mark Anderson',
        featured: false,
        url: '#',
        icon: 'fab fa-linkedin'
    }
];

// Article categories
const articleCategories = [
    { id: 'all', name: 'All Articles' },
    { id: 'resume', name: 'Resume Tips' },
    { id: 'interview', name: 'Interview Prep' },
    { id: 'career', name: 'Career Growth' },
    { id: 'job-search', name: 'Job Search' }
];

// Initialize articles when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeArticles();
    setupArticleFilters();
});

// Main initialization function
function initializeArticles() {
    // Check if we're on homepage (show preview) or articles page (show all)
    const isHomepage = document.querySelector('.hero') !== null;
    const isArticlesPage = document.querySelector('.articles-listing') !== null;
    
    if (isHomepage) {
        renderArticlePreview();
    } else if (isArticlesPage) {
        renderAllArticles();
    }
    
    console.log('Articles module initialized');
}

// Render article preview for homepage
function renderArticlePreview() {
    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) return;

    // Show first 4 articles on homepage
    const previewArticles = articlesData.slice(0, 4);
    renderArticleCards(previewArticles, articlesGrid);
}

// Render all articles for articles page
function renderAllArticles() {
    const articlesGrid = document.getElementById('all-articles');
    if (!articlesGrid) return;

    renderArticleCards(articlesData, articlesGrid);
}

// Render article cards
function renderArticleCards(articles, container) {
    if (!container) return;

    container.innerHTML = '';

    articles.forEach(article => {
        const articleCard = createArticleCard(article);
        container.appendChild(articleCard);
    });

    // Setup article interactions
    setupArticleInteractions();
}

// Create individual article card
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.setAttribute('data-category', article.category);
    card.setAttribute('data-article-id', article.id);

    const formattedDate = formatDate(article.publishDate);
    const categoryName = getCategoryName(article.category);

    // Create elements safely without innerHTML
    const articleImage = document.createElement('div');
    articleImage.className = 'article-image';
    const icon = document.createElement('i');
    icon.className = article.icon;
    articleImage.appendChild(icon);

    const articleContent = document.createElement('div');
    articleContent.className = 'article-content';

    const categorySpan = document.createElement('span');
    categorySpan.className = 'article-category';
    categorySpan.textContent = categoryName;

    const title = document.createElement('h3');
    title.textContent = article.title;

    const description = document.createElement('p');
    description.textContent = article.description;

    const articleMeta = document.createElement('div');
    articleMeta.className = 'article-meta';

    const timeSpan = document.createElement('span');
    timeSpan.innerHTML = `<i class="fas fa-clock"></i> ${article.readTime}`;

    const dateSpan = document.createElement('span');
    dateSpan.innerHTML = `<i class="fas fa-calendar"></i> ${formattedDate}`;

    articleMeta.appendChild(timeSpan);
    articleMeta.appendChild(dateSpan);

    if (article.author) {
        const authorSpan = document.createElement('span');
        authorSpan.innerHTML = `<i class="fas fa-user"></i> ${article.author}`;
        articleMeta.appendChild(authorSpan);
    }

    const link = document.createElement('a');
    link.href = article.url;
    link.className = 'article-link';
    link.textContent = 'Read More';

    articleContent.appendChild(categorySpan);
    articleContent.appendChild(title);
    articleContent.appendChild(description);
    articleContent.appendChild(articleMeta);
    articleContent.appendChild(link);

    card.appendChild(articleImage);
    card.appendChild(articleContent);

    // Add hover effects
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
    });

    return card;
}

// Setup article interactions
function setupArticleInteractions() {
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        // Click to read article
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on the link directly
            if (e.target.tagName.toLowerCase() !== 'a') {
                const link = this.querySelector('.article-link');
                if (link) {
                    window.location.href = link.href;
                }
            }
        });

        // Track article views
        const link = card.querySelector('.article-link');
        if (link) {
            link.addEventListener('click', function(e) {
                const articleId = card.getAttribute('data-article-id');
                trackArticleView(articleId);
            });
        }
    });
}

// Setup article filters (for articles listing page)
function setupArticleFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterArticles(category);
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Filter articles by category
function filterArticles(category) {
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            // Add fade-in animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`Filtered articles by category: ${category}`);
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// Get category display name
function getCategoryName(categoryId) {
    const category = articleCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
}

// Track article views for analytics
function trackArticleView(articleId) {
    try {
        const article = articlesData.find(a => a.id === articleId);
        if (!article) return;

        const analyticsData = {
            event: 'article_view',
            article_id: articleId,
            article_title: article.title,
            article_category: article.category,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct'
        };
        
        console.log('Article view tracked:', analyticsData);
        
        // In a real application, this would send data to analytics service
        // Example: analytics.track('article_view', analyticsData);
        
    } catch (error) {
        console.error('Article tracking error:', error);
    }
}

// Search articles functionality
function searchArticles(query) {
    if (!query || query.trim() === '') {
        // Show all articles if search is empty
        filterArticles('all');
        return;
    }

    const articleCards = document.querySelectorAll('.article-card');
    const searchTerm = query.toLowerCase().trim();
    
    articleCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const category = card.getAttribute('data-category').toLowerCase();
        
        const isMatch = title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       category.includes(searchTerm);
        
        if (isMatch) {
            card.style.display = 'block';
            highlightSearchTerm(card, searchTerm);
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`Searched articles for: ${query}`);
}

// Highlight search terms in results
function highlightSearchTerm(card, term) {
    const title = card.querySelector('h3');
    const description = card.querySelector('p');
    
    // Safe highlighting without innerHTML
    [title, description].forEach(element => {
        const text = element.textContent;
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        
        // Create a document fragment to safely build highlighted content
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            
            // Add highlighted match
            const mark = document.createElement('mark');
            mark.textContent = match[1];
            fragment.appendChild(mark);
            
            lastIndex = match.index + match[1].length;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        
        // Replace element content with fragment
        element.textContent = '';
        element.appendChild(fragment);
    });
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get related articles based on category
function getRelatedArticles(currentArticleId, limit = 3) {
    const currentArticle = articlesData.find(a => a.id === currentArticleId);
    if (!currentArticle) return [];

    return articlesData
        .filter(article => 
            article.id !== currentArticleId && 
            article.category === currentArticle.category
        )
        .slice(0, limit);
}

// Get featured articles
function getFeaturedArticles() {
    return articlesData.filter(article => article.featured);
}

// Get articles by category
function getArticlesByCategory(category) {
    if (category === 'all') {
        return articlesData;
    }
    return articlesData.filter(article => article.category === category);
}

// Get recent articles
function getRecentArticles(limit = 5) {
    return articlesData
        .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
        .slice(0, limit);
}

// Create article search functionality
function setupArticleSearch() {
    const searchInput = document.querySelector('.article-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value;
        searchArticles(query);
    });

    // Clear search
    const clearBtn = document.querySelector('.search-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            filterArticles('all');
        });
    }
}

// Load more articles (for pagination)
function loadMoreArticles() {
    // This would be implemented for pagination in a real application
    console.log('Load more articles requested');
    
    if (window.ResumeSmartBuild?.showNotification) {
        window.ResumeSmartBuild.showNotification(
            'More articles coming soon!', 
            'info'
        );
    }
}

// Setup load more functionality
function setupLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more button');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreArticles);
    }
}

// Newsletter signup from articles page
function setupNewsletterCTA() {
    const newsletterCTA = document.getElementById('newsletter-cta');
    if (newsletterCTA) {
        newsletterCTA.addEventListener('click', function() {
            const newsletterModal = document.getElementById('newsletter-modal');
            if (newsletterModal && window.ResumeSmartBuild?.openModal) {
                window.ResumeSmartBuild.openModal(newsletterModal);
            } else {
                // Fallback if modal not available
                if (window.ResumeSmartBuild?.showNotification) {
                    window.ResumeSmartBuild.showNotification(
                        'Newsletter signup feature will be available soon!', 
                        'info'
                    );
                }
            }
        });
    }
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    setupArticleSearch();
    setupLoadMore();
    setupNewsletterCTA();
});

// Export functions for external use
window.ArticlesManager = {
    articles: articlesData,
    categories: articleCategories,
    getRelatedArticles,
    getFeaturedArticles,
    getArticlesByCategory,
    getRecentArticles,
    searchArticles,
    filterArticles,
    trackArticleView
};

console.log('Articles module loaded successfully');
