// Resume Templates Management
// Handles dynamic template card generation and premium features

// Template data structure
const resumeTemplates = [
    {
        id: 'template-1',
        name: 'Professional Classic',
        description: 'Clean and professional design perfect for corporate roles',
        category: 'professional',
        isPremium: false,
        previewIcon: 'fas fa-file-text',
        features: ['ATS Friendly', 'Clean Layout', 'Professional Design'],
        downloadUrl: 'templates/template-1.pdf'
    },
    {
        id: 'template-2',
        name: 'Modern Creative',
        description: 'Contemporary design with creative elements for design roles',
        category: 'creative',
        isPremium: false,
        previewIcon: 'fas fa-palette',
        features: ['Modern Design', 'Creative Layout', 'Color Accents'],
        downloadUrl: 'templates/template-2.pdf'
    },
    {
        id: 'template-3',
        name: 'Executive Premium',
        description: 'Sophisticated template for senior leadership positions',
        category: 'executive',
        isPremium: true,
        previewIcon: 'fas fa-crown',
        features: ['Executive Style', 'Premium Design', 'Leadership Focus'],
        downloadUrl: 'templates/template-3.pdf'
    },
    {
        id: 'template-4',
        name: 'Tech Specialist',
        description: 'Technical resume template for IT and engineering roles',
        category: 'technical',
        isPremium: true,
        previewIcon: 'fas fa-code',
        features: ['Tech Focused', 'Skills Emphasis', 'Project Showcase'],
        downloadUrl: 'templates/template-4.pdf'
    }
];

// Template categories for filtering
const templateCategories = [
    { id: 'all', name: 'All Templates' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' },
    { id: 'executive', name: 'Executive' },
    { id: 'technical', name: 'Technical' }
];

// Initialize templates when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTemplates();
    setupTemplateFilters();
});

// Main initialization function
function initializeTemplates() {
    const templatesGrid = document.getElementById('templates-grid');
    if (!templatesGrid) {
        console.log('Templates grid not found on this page');
        return;
    }

    renderTemplates(resumeTemplates);
    console.log('Resume templates initialized');
}

// Render template cards
function renderTemplates(templates) {
    const templatesGrid = document.getElementById('templates-grid');
    if (!templatesGrid) return;

    templatesGrid.innerHTML = '';

    templates.forEach(template => {
        const templateCard = createTemplateCard(template);
        templatesGrid.appendChild(templateCard);
    });

    // Setup template interactions after rendering
    setupTemplateInteractions();
}

// Create individual template card
function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = `template-card ${template.isPremium ? 'premium' : 'free'}`;
    card.setAttribute('data-template-id', template.id);
    card.setAttribute('data-category', template.category);
    card.setAttribute('data-premium', template.isPremium);

    // Create template preview section
    const previewDiv = document.createElement('div');
    previewDiv.className = 'template-preview';
    
    const icon = document.createElement('i');
    icon.className = template.previewIcon;
    
    const badge = document.createElement('span');
    badge.className = `template-badge ${template.isPremium ? 'premium' : 'free'}`;
    badge.textContent = template.isPremium ? 'Premium' : 'Free';
    
    previewDiv.appendChild(icon);
    previewDiv.appendChild(badge);

    // Create template info section
    const infoDiv = document.createElement('div');
    infoDiv.className = 'template-info';
    
    const title = document.createElement('h3');
    title.textContent = template.name;
    
    const description = document.createElement('p');
    description.textContent = template.description;
    
    // Create features section
    const featuresDiv = document.createElement('div');
    featuresDiv.className = 'template-features';
    
    template.features.forEach(feature => {
        const featureTag = document.createElement('span');
        featureTag.className = 'feature-tag';
        featureTag.textContent = feature;
        featuresDiv.appendChild(featureTag);
    });
    
    // Create actions section
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'template-actions';
    
    // Preview button
    const previewBtn = document.createElement('button');
    previewBtn.className = 'btn-primary template-preview-btn';
    previewBtn.setAttribute('data-template-id', template.id);
    
    const previewIcon = document.createElement('i');
    previewIcon.className = 'fas fa-eye';
    previewBtn.appendChild(previewIcon);
    previewBtn.appendChild(document.createTextNode(' Preview'));
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn-secondary template-download-btn';
    downloadBtn.setAttribute('data-template-id', template.id);
    if (template.isPremium) {
        downloadBtn.setAttribute('data-premium', 'true');
    }
    
    const downloadIcon = document.createElement('i');
    downloadIcon.className = 'fas fa-download';
    downloadBtn.appendChild(downloadIcon);
    downloadBtn.appendChild(document.createTextNode(template.isPremium ? ' 🔒 Download' : ' Download'));
    
    actionsDiv.appendChild(previewBtn);
    actionsDiv.appendChild(downloadBtn);
    
    // Assemble the card
    infoDiv.appendChild(title);
    infoDiv.appendChild(description);
    infoDiv.appendChild(featuresDiv);
    infoDiv.appendChild(actionsDiv);
    
    card.appendChild(previewDiv);
    card.appendChild(infoDiv);

    return card;
}

// Setup template interactions
function setupTemplateInteractions() {
    // Preview buttons
    const previewButtons = document.querySelectorAll('.template-preview-btn');
    previewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const templateId = this.getAttribute('data-template-id');
            handleTemplatePreview(templateId);
        });
    });

    // Download buttons
    const downloadButtons = document.querySelectorAll('.template-download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const templateId = this.getAttribute('data-template-id');
            const isPremium = this.getAttribute('data-premium') === 'true';
            handleTemplateDownload(templateId, isPremium);
        });
    });

    // Template card hover effects
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Handle template preview
function handleTemplatePreview(templateId) {
    const template = resumeTemplates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }

    console.log('Previewing template:', template.name);
    
    // Create preview modal
    const previewModal = createPreviewModal(template);
    document.body.appendChild(previewModal);
    
    // Show modal
    setTimeout(() => {
        previewModal.classList.add('active');
    }, 100);
}

// Create preview modal
function createPreviewModal(template) {
    const modal = document.createElement('div');
    modal.className = 'modal template-preview-modal';
    
    // Create modal structure using DOM methods (XSS-safe)
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content template-preview-content';
    
    // Close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    
    // Header section
    const previewHeader = document.createElement('div');
    previewHeader.className = 'preview-header';
    
    const title = document.createElement('h2');
    title.textContent = template.name; // XSS-safe text assignment
    
    const badge = document.createElement('span');
    badge.className = `template-badge ${template.isPremium ? 'premium' : 'free'}`;
    badge.textContent = template.isPremium ? 'Premium' : 'Free'; // XSS-safe text assignment
    
    previewHeader.appendChild(title);
    previewHeader.appendChild(badge);
    
    // Body section
    const previewBody = document.createElement('div');
    previewBody.className = 'preview-body';
    
    // Preview image section
    const previewImage = document.createElement('div');
    previewImage.className = 'preview-image';
    
    const icon = document.createElement('i');
    icon.className = template.previewIcon; // Note: FontAwesome class names are controlled, low XSS risk
    icon.style.cssText = 'font-size: 4rem; color: #6B7280;';
    
    const previewText = document.createElement('p');
    previewText.style.cssText = 'margin-top: 20px; color: #6B7280;';
    previewText.textContent = 'Template Preview';
    
    const previewSubtext = document.createElement('p');
    previewSubtext.style.cssText = 'font-size: 0.875rem; color: #9CA3AF;';
    previewSubtext.textContent = 'Full preview available after download';
    
    previewImage.appendChild(icon);
    previewImage.appendChild(previewText);
    previewImage.appendChild(previewSubtext);
    
    // Details section
    const previewDetails = document.createElement('div');
    previewDetails.className = 'preview-details';
    
    const featuresTitle = document.createElement('h3');
    featuresTitle.textContent = 'Template Features';
    
    const featuresList = document.createElement('ul');
    featuresList.className = 'features-list';
    
    template.features.forEach(feature => {
        const listItem = document.createElement('li');
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fas fa-check';
        listItem.appendChild(checkIcon);
        listItem.appendChild(document.createTextNode(' ' + feature)); // XSS-safe text node
        featuresList.appendChild(listItem);
    });
    
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'preview-description';
    
    const descTitle = document.createElement('h4');
    descTitle.textContent = 'Description';
    
    const descText = document.createElement('p');
    descText.textContent = template.description; // XSS-safe text assignment
    
    descriptionDiv.appendChild(descTitle);
    descriptionDiv.appendChild(descText);
    
    previewDetails.appendChild(featuresTitle);
    previewDetails.appendChild(featuresList);
    previewDetails.appendChild(descriptionDiv);
    
    previewBody.appendChild(previewImage);
    previewBody.appendChild(previewDetails);
    
    // Actions section
    const previewActions = document.createElement('div');
    previewActions.className = 'preview-actions';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'btn-secondary';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => modal.remove());
    
    const downloadButton = document.createElement('button');
    downloadButton.className = 'btn-primary';
    downloadButton.addEventListener('click', () => handleTemplateDownload(template.id, template.isPremium));
    
    const downloadIcon = document.createElement('i');
    downloadIcon.className = 'fas fa-download';
    
    downloadButton.appendChild(downloadIcon);
    downloadButton.appendChild(document.createTextNode(' ' + (template.isPremium ? '🔒 Download Premium' : 'Download Free')));
    
    previewActions.appendChild(closeButton);
    previewActions.appendChild(downloadButton);
    
    // Assemble modal
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(previewHeader);
    modalContent.appendChild(previewBody);
    modalContent.appendChild(previewActions);
    
    modal.appendChild(modalContent);

    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const content = modal.querySelector('.template-preview-content');
    content.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 0;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    `;

    // Close modal functionality (already configured above)
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Add custom styles for preview modal
    const style = document.createElement('style');
    style.textContent = `
        .template-preview-modal.active {
            opacity: 1 !important;
        }
        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30px 30px 0;
            border-bottom: 1px solid #E5E7EB;
            margin-bottom: 30px;
        }
        .preview-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 0 30px;
        }
        .preview-image {
            background: #F9FAFB;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            border: 2px dashed #E5E7EB;
        }
        .preview-details h3, .preview-details h4 {
            margin-bottom: 15px;
            color: #1F2937;
        }
        .features-list {
            list-style: none;
            padding: 0;
            margin-bottom: 25px;
        }
        .features-list li {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
            color: #374151;
        }
        .features-list i {
            color: #10B981;
            font-size: 0.875rem;
        }
        .preview-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            padding: 30px;
            border-top: 1px solid #E5E7EB;
            margin-top: 30px;
        }
        @media (max-width: 768px) {
            .preview-body {
                grid-template-columns: 1fr;
            }
            .preview-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);

    return modal;
}

// Handle template download
function handleTemplateDownload(templateId, isPremium) {
    const template = resumeTemplates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }

    // Check if premium template and user authentication
    if (isPremium) {
        const isAuthenticated = window.ResumeSmartBuild?.isAuthenticated?.() || false;
        
        if (!isAuthenticated) {
            if (window.ResumeSmartBuild?.showNotification) {
                window.ResumeSmartBuild.showNotification(
                    'Please sign in to download premium templates.', 
                    'warning'
                );
            }
            
            // Open login modal if available
            const loginModal = document.getElementById('login-modal');
            if (loginModal && window.ResumeSmartBuild?.openModal) {
                window.ResumeSmartBuild.openModal(loginModal);
            }
            return;
        }
    }

    console.log('Downloading template:', template.name);
    
    // Show download notification
    if (window.ResumeSmartBuild?.showNotification) {
        window.ResumeSmartBuild.showNotification(
            `Downloading ${template.name}...`, 
            'info'
        );
    }

    // Initiate download
    downloadTemplate(template);
    
    // Track download analytics (in real app)
    trackTemplateDownload(template);
}

// Download template file
function downloadTemplate(template) {
    try {
        // Create download link
        const link = document.createElement('a');
        link.href = template.downloadUrl;
        link.download = `${template.name.replace(/\s+/g, '_')}.pdf`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success notification
        setTimeout(() => {
            if (window.ResumeSmartBuild?.showNotification) {
                window.ResumeSmartBuild.showNotification(
                    `${template.name} downloaded successfully!`, 
                    'success'
                );
            }
        }, 1000);
        
    } catch (error) {
        console.error('Download error:', error);
        if (window.ResumeSmartBuild?.showNotification) {
            window.ResumeSmartBuild.showNotification(
                'Download failed. Please try again.', 
                'error'
            );
        }
    }
}

// Track template download for analytics
function trackTemplateDownload(template) {
    try {
        const analyticsData = {
            event: 'template_download',
            template_id: template.id,
            template_name: template.name,
            template_category: template.category,
            is_premium: template.isPremium,
            timestamp: new Date().toISOString()
        };
        
        console.log('Template download tracked:', analyticsData);
        
        // In a real application, this would send data to analytics service
        // Example: analytics.track('template_download', analyticsData);
        
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
}

// Setup template filters (if filter UI exists)
function setupTemplateFilters() {
    const filterContainer = document.querySelector('.template-filters');
    if (!filterContainer) return;

    // Create filter buttons
    const filtersHTML = templateCategories.map(category => `
        <button class="filter-btn ${category.id === 'all' ? 'active' : ''}" 
                data-category="${category.id}">
            ${category.name}
        </button>
    `).join('');

    filterContainer.innerHTML = `
        <h3>Filter Templates</h3>
        <div class="filter-buttons">
            ${filtersHTML}
        </div>
    `;

    // Add filter functionality
    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterTemplates(category);
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Filter templates by category
function filterTemplates(category) {
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`Filtered templates by category: ${category}`);
}

// Get template by ID (utility function)
function getTemplateById(templateId) {
    return resumeTemplates.find(template => template.id === templateId);
}

// Get templates by category (utility function)
function getTemplatesByCategory(category) {
    if (category === 'all') {
        return resumeTemplates;
    }
    return resumeTemplates.filter(template => template.category === category);
}

// Get free templates
function getFreeTemplates() {
    return resumeTemplates.filter(template => !template.isPremium);
}

// Get premium templates
function getPremiumTemplates() {
    return resumeTemplates.filter(template => template.isPremium);
}

// Export functions for external use
window.ResumeTemplates = {
    templates: resumeTemplates,
    categories: templateCategories,
    getTemplateById,
    getTemplatesByCategory,
    getFreeTemplates,
    getPremiumTemplates,
    downloadTemplate: handleTemplateDownload,
    previewTemplate: handleTemplatePreview
};

console.log('Resume Templates module loaded successfully');
