// Autocomplete functionality for job titles, skills, and other fields
class AutoComplete {
    constructor(inputElement, dataSource, options = {}) {
        this.input = inputElement;
        this.dataSource = dataSource;
        this.options = {
            minLength: 1,
            maxResults: 10,
            placeholder: 'Start typing...',
            className: 'autocomplete-dropdown',
            ...options
        };
        
        this.dropdown = null;
        this.selectedIndex = -1;
        this.filteredData = [];
        
        this.init();
    }
    
    init() {
        this.input.setAttribute('autocomplete', 'off');
        this.input.placeholder = this.options.placeholder;
        
        // Create dropdown container
        this.createDropdown();
        
        // Add event listeners
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.input.addEventListener('keydown', this.handleKeydown.bind(this));
        this.input.addEventListener('blur', this.handleBlur.bind(this));
        this.input.addEventListener('focus', this.handleFocus.bind(this));
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }
    
    createDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = this.options.className;
        this.dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #E5E7EB;
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        // Position relative to input
        const inputContainer = this.input.parentElement;
        if (getComputedStyle(inputContainer).position === 'static') {
            inputContainer.style.position = 'relative';
        }
        inputContainer.appendChild(this.dropdown);
    }
    
    handleInput(e) {
        const value = e.target.value.trim();
        
        if (value.length >= this.options.minLength) {
            this.filteredData = this.filterData(value);
            this.showDropdown();
        } else {
            this.hideDropdown();
        }
    }
    
    handleKeydown(e) {
        if (!this.dropdown.style.display || this.dropdown.style.display === 'none') return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredData.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectItem(this.filteredData[this.selectedIndex]);
                }
                break;
            case 'Escape':
                this.hideDropdown();
                break;
        }
    }
    
    handleBlur(e) {
        // Delay hiding to allow click on dropdown items
        setTimeout(() => {
            if (document.activeElement !== this.input) {
                this.hideDropdown();
            }
        }, 150);
    }
    
    handleFocus(e) {
        if (this.input.value.length >= this.options.minLength) {
            this.filteredData = this.filterData(this.input.value);
            this.showDropdown();
        }
    }
    
    filterData(query) {
        const lowerQuery = query.toLowerCase();
        return this.dataSource
            .filter(item => item.toLowerCase().includes(lowerQuery))
            .slice(0, this.options.maxResults);
    }
    
    showDropdown() {
        if (this.filteredData.length === 0) {
            this.hideDropdown();
            return;
        }
        
        this.dropdown.innerHTML = '';
        this.selectedIndex = -1;
        
        this.filteredData.forEach((item, index) => {
            const div = document.createElement('div');
            div.textContent = item;
            div.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #F3F4F6;
                transition: background-color 0.2s;
            `;
            
            div.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });
            
            div.addEventListener('click', () => {
                this.selectItem(item);
            });
            
            this.dropdown.appendChild(div);
        });
        
        this.dropdown.style.display = 'block';
    }
    
    hideDropdown() {
        this.dropdown.style.display = 'none';
        this.selectedIndex = -1;
    }
    
    updateSelection() {
        const items = this.dropdown.children;
        Array.from(items).forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.style.backgroundColor = '#F3F4F6';
            } else {
                item.style.backgroundColor = 'white';
            }
        });
    }
    
    selectItem(item) {
        this.input.value = item;
        this.hideDropdown();
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        this.input.dispatchEvent(event);
        
        // Custom callback if provided
        if (this.options.onSelect) {
            this.options.onSelect(item);
        }
    }
}

// Data sources for different types of autocomplete
const JobTitles = [
    'Software Engineer', 'Senior Software Engineer', 'Software Developer', 'Full Stack Developer',
    'Frontend Developer', 'Backend Developer', 'Web Developer', 'Mobile Developer',
    'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Engineer',
    'DevOps Engineer', 'Cloud Engineer', 'Systems Administrator', 'Network Engineer',
    'Cybersecurity Analyst', 'Information Security Specialist', 'Penetration Tester',
    'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst',
    'UX Designer', 'UI Designer', 'Graphic Designer', 'Web Designer',
    'Marketing Manager', 'Digital Marketing Specialist', 'Content Marketing Manager',
    'Sales Manager', 'Account Manager', 'Customer Success Manager',
    'Financial Analyst', 'Accountant', 'Controller', 'CFO',
    'Human Resources Manager', 'Recruiter', 'Training Specialist',
    'Operations Manager', 'Supply Chain Manager', 'Quality Assurance Engineer',
    'Database Administrator', 'IT Support Specialist', 'Help Desk Technician',
    'Technical Writer', 'Documentation Specialist', 'Content Creator'
];

const TechnicalSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring',
    'HTML', 'CSS', 'SCSS', 'Bootstrap', 'Tailwind CSS', 'jQuery',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',
    'Linux', 'Windows', 'macOS', 'Unix', 'Shell Scripting',
    'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'Kanban',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Blockchain', 'Ethereum', 'Smart Contracts', 'Solidity',
    'Mobile Development', 'iOS', 'Android', 'React Native', 'Flutter',
    'Testing', 'Unit Testing', 'Integration Testing', 'Selenium', 'Jest',
    'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'Adobe XD'
];

const SoftSkills = [
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
    'Time Management', 'Project Management', 'Organization', 'Attention to Detail',
    'Adaptability', 'Flexibility', 'Creativity', 'Innovation', 'Initiative',
    'Customer Service', 'Interpersonal Skills', 'Negotiation', 'Presentation',
    'Public Speaking', 'Writing', 'Research', 'Analytical Thinking',
    'Decision Making', 'Conflict Resolution', 'Mentoring', 'Coaching',
    'Strategic Planning', 'Budget Management', 'Risk Management',
    'Cross-functional Collaboration', 'Stakeholder Management'
];

const Industries = [
    'Technology', 'Software', 'Information Technology', 'Telecommunications',
    'Healthcare', 'Biotechnology', 'Pharmaceuticals', 'Medical Devices',
    'Finance', 'Banking', 'Insurance', 'Investment', 'Real Estate',
    'Education', 'Higher Education', 'E-learning', 'Training',
    'Retail', 'E-commerce', 'Consumer Goods', 'Fashion',
    'Manufacturing', 'Automotive', 'Aerospace', 'Construction',
    'Energy', 'Oil & Gas', 'Renewable Energy', 'Utilities',
    'Media', 'Entertainment', 'Gaming', 'Publishing',
    'Consulting', 'Professional Services', 'Legal', 'Accounting',
    'Non-profit', 'Government', 'Public Sector', 'Defense',
    'Transportation', 'Logistics', 'Supply Chain', 'Shipping',
    'Hospitality', 'Travel', 'Tourism', 'Food & Beverage'
];

const Countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
    'Australia', 'New Zealand', 'Japan', 'South Korea', 'Singapore', 'Hong Kong',
    'China', 'India', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
    'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Morocco',
    'Russia', 'Poland', 'Czech Republic', 'Hungary', 'Romania',
    'Israel', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait'
];

// Initialize autocomplete for specific input types
function initializeAutocomplete() {
    // Job titles
    const jobTitleInputs = document.querySelectorAll('input[data-autocomplete="job-title"], input[name*="job"], input[id*="job"], input[placeholder*="job" i], input[placeholder*="title" i]');
    jobTitleInputs.forEach(input => {
        new AutoComplete(input, JobTitles, {
            placeholder: 'e.g., Software Engineer, Data Scientist...',
            onSelect: (value) => console.log('Job title selected:', value)
        });
    });

    // Technical skills
    const skillInputs = document.querySelectorAll('input[data-autocomplete="skill"], input[name*="skill"], input[id*="skill"], input[placeholder*="skill" i]');
    skillInputs.forEach(input => {
        new AutoComplete(input, TechnicalSkills, {
            placeholder: 'e.g., JavaScript, Python, React...',
            onSelect: (value) => console.log('Skill selected:', value)
        });
    });

    // Soft skills
    const softSkillInputs = document.querySelectorAll('input[data-autocomplete="soft-skill"], input[name*="soft"], input[placeholder*="soft" i]');
    softSkillInputs.forEach(input => {
        new AutoComplete(input, SoftSkills, {
            placeholder: 'e.g., Leadership, Communication...',
            onSelect: (value) => console.log('Soft skill selected:', value)
        });
    });

    // Industries
    const industryInputs = document.querySelectorAll('input[data-autocomplete="industry"], input[name*="industry"], input[id*="industry"], input[placeholder*="industry" i]');
    industryInputs.forEach(input => {
        new AutoComplete(input, Industries, {
            placeholder: 'e.g., Technology, Healthcare...',
            onSelect: (value) => console.log('Industry selected:', value)
        });
    });

    // Countries/Locations
    const locationInputs = document.querySelectorAll('input[data-autocomplete="location"], input[name*="location"], input[id*="location"], input[name*="country"], input[placeholder*="location" i], input[placeholder*="country" i]');
    locationInputs.forEach(input => {
        new AutoComplete(input, Countries, {
            placeholder: 'e.g., United States, Canada...',
            onSelect: (value) => console.log('Location selected:', value)
        });
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AutoComplete, initializeAutocomplete, JobTitles, TechnicalSkills, SoftSkills, Industries, Countries };
}