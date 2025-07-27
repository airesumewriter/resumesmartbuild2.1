#!/usr/bin/env python3
"""
ResumeSmartBuild - Comprehensive AI-Powered Resume Builder Server
"""
import json
import time
import random
import re
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)

# Mock databases (in production, use PostgreSQL)
users_db = {}
templates_db = [
    {
        'id': '1',
        'name': 'Modern Tech',
        'category': 'tech',
        'isFree': True,
        'previewUrl': '/previews/modern-tech.jpg',
        'templateData': {'layout': 'modern', 'colors': ['#2563eb', '#1f2937']}
    },
    {
        'id': '2',
        'name': 'Healthcare Professional',
        'category': 'healthcare',
        'isFree': True,
        'previewUrl': '/previews/healthcare.jpg',
        'templateData': {'layout': 'professional', 'colors': ['#059669', '#374151']}
    },
    {
        'id': '3',
        'name': 'Executive Premium',
        'category': 'finance',
        'isFree': False,
        'previewUrl': '/previews/executive.jpg',
        'templateData': {'layout': 'executive', 'colors': ['#7c3aed', '#1f2937']}
    }
]

# Sample articles database
articles_db = [
    {
        'id': '1',
        'title': '10 ATS Resume Tips That Actually Work in 2024',
        'slug': 'ats-resume-tips-2024',
        'excerpt': 'Master the art of beating ATS systems with these proven strategies that helped 50,000+ job seekers land interviews.',
        'content': '''# 10 ATS Resume Tips That Actually Work in 2024

## Understanding ATS Systems

Over 75% of resumes never reach human eyes because they fail to pass Applicant Tracking System (ATS) filters. ATS software scans your resume for specific keywords, formats, and qualifications before a human ever sees it.

## Tip 1: Use the Right Keywords

The most critical factor in ATS optimization is keyword matching:
- Extract keywords from job descriptions
- Use industry-specific terminology  
- Include both acronyms and full terms
- Natural integration into experience descriptions

## Tip 2: Choose the Right File Format

Best formats: .docx (Microsoft Word), .pdf (if supported)
Avoid: .jpg, image files, .txt files, complex PDFs with graphics

## Tip 3: Optimize Your Resume Structure

1. Contact Information (at the top)
2. Professional Summary or Objective  
3. Work Experience (with dates and job titles)
4. Education
5. Skills
6. Additional sections (certifications, languages)

## Tip 4: Use Standard Section Headings

- "Work Experience" or "Professional Experience"
- "Education"
- "Skills" or "Core Competencies"
- "Certifications"

## Tip 5: Format Dates Consistently

Use consistent date formats: "January 2020 - March 2022" or "01/2020 - 03/2022"

## The Bottom Line

ATS optimization is about clearly communicating your qualifications in a format that both machines and humans can understand. Focus on creating a document that showcases your achievements and demonstrates your value.''',
        'author': 'Sarah Chen',
        'created_at': '2024-01-15',
        'cover_image_url': '/images/ats-tips-cover.jpg',
        'is_featured': True,
        'category': 'ATS Optimization'
    },
    {
        'id': '2',
        'title': 'The Ultimate Guide to Resume Templates in 2024',
        'slug': 'resume-templates-guide-2024',
        'excerpt': 'Discover which resume template formats get the most interviews and how to choose the perfect design for your industry.',
        'content': '''# The Ultimate Guide to Resume Templates in 2024

## Why Resume Templates Matter

Your resume template can make or break your job application. The right template not only showcases your information clearly but also demonstrates your attention to detail and professionalism.

## Types of Resume Templates

### 1. Traditional Templates
- Clean, professional layouts
- Black and white color schemes
- Perfect for conservative industries

### 2. Modern Templates  
- Contemporary designs
- Strategic use of color
- Ideal for creative and tech roles

### 3. Creative Templates
- Unique layouts and graphics
- Bold design elements
- Best for design and marketing positions

## Choosing the Right Template

Consider your industry, experience level, and the specific role you're applying for. A finance professional needs a different approach than a graphic designer.

## Template Best Practices

- Keep it simple and readable
- Use consistent formatting
- Ensure ATS compatibility
- Focus on content over design

Remember: the best template is one that highlights your qualifications while remaining professional and easy to read.''',
        'author': 'Michael Rodriguez',
        'created_at': '2024-01-10',
        'cover_image_url': '/images/templates-guide-cover.jpg',
        'is_featured': False,
        'category': 'Templates'
    }
]

# Helper functions
def extract_keywords(text):
    """Extract keywords from text for SEO"""
    common_words = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    keywords = [word for word in words if word not in common_words]
    return ', '.join(list(set(keywords))[:10])

def markdown_to_html(markdown_text):
    """Simple markdown to HTML conversion"""
    html = markdown_text
    html = re.sub(r'^# (.*)', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*)', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*)', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    html = html.replace('\n\n', '</p><p>')
    html = f'<p>{html}</p>'
    return html

# Main routes
@app.route('/')
def serve_homepage():
    return send_from_directory('.', 'index.html')

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'ok', 'timestamp': time.time()})

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not email or not password or not name:
        return jsonify({'message': 'Missing required fields'}), 400
    
    if email in users_db:
        return jsonify({'message': 'User already exists'}), 400
    
    users_db[email] = {
        'email': email,
        'password': password,  # In production: hash this!
        'name': name,
        'created_at': time.time()
    }
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {'email': email, 'name': name}
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400
    
    user = users_db.get(email)
    if not user or user['password'] != password:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    return jsonify({
        'message': 'Login successful',
        'user': {'email': user['email'], 'name': user['name']}
    }), 200

# ATS Scanning endpoint
@app.route('/api/ats-scan', methods=['POST'])
def ats_scan():
    try:
        data = request.get_json()
        resume_text = data.get('resume', '')
        job_description = data.get('jobDescription', '')
        
        if not resume_text or not job_description:
            return jsonify({'message': 'Resume and job description are required'}), 400
        
        # Mock ATS analysis
        keywords_found = []
        missing_keywords = []
        
        job_keywords = ['python', 'javascript', 'react', 'node.js', 'sql', 'git', 'aws', 'leadership', 'management']
        resume_lower = resume_text.lower()
        
        for keyword in job_keywords:
            if keyword.lower() in resume_lower:
                keywords_found.append(keyword)
            else:
                missing_keywords.append(keyword)
        
        match_score = min(95, max(60, len(keywords_found) * 10 + random.randint(-5, 15)))
        
        suggestions = [
            f"Add missing keywords: {', '.join(missing_keywords[:3])}" if missing_keywords else "Great keyword coverage!",
            "Use bullet points for better readability",
            "Quantify your achievements with numbers",
            "Include relevant certifications",
            "Optimize section headings for ATS parsing"
        ]
        
        result = {
            'matchScore': match_score,
            'keywordsFound': keywords_found,
            'missingKeywords': missing_keywords,
            'suggestions': suggestions[:4],
            'overallFeedback': f'Your resume scored {match_score}%. Focus on adding missing keywords and quantifiable achievements.',
            'analysisDate': time.time()
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': 'Analysis failed', 'error': str(e)}), 500

# Templates endpoints
@app.route('/api/templates')
def get_templates():
    return jsonify(templates_db)

@app.route('/api/templates/<template_id>')
def get_template(template_id):
    template = next((t for t in templates_db if t['id'] == template_id), None)
    if not template:
        return jsonify({'message': 'Template not found'}), 404
    return jsonify(template)

# Articles endpoints
@app.route('/api/articles')
def get_articles():
    articles_list = []
    for article in articles_db:
        articles_list.append({
            'id': article['id'],
            'title': article['title'],
            'slug': article['slug'],
            'excerpt': article['excerpt'],
            'author': article['author'],
            'created_at': article['created_at'],
            'cover_image_url': article.get('cover_image_url'),
            'is_featured': article.get('is_featured', False),
            'category': article.get('category', 'Career Tips')
        })
    
    return jsonify(articles_list)

@app.route('/api/articles/<slug>')
def get_article(slug):
    article = next((a for a in articles_db if a['slug'] == slug), None)
    if not article:
        return jsonify({'message': 'Article not found'}), 404
    return jsonify(article)

# Featured articles for homepage
@app.route('/api/featured')
def get_featured_articles():
    featured = [a for a in articles_db if a.get('is_featured', False)]
    return jsonify(featured[:4])

# Job matching endpoint
@app.route('/api/jobs/match', methods=['POST'])
def match_jobs():
    try:
        data = request.get_json()
        resume = data.get('resume', '')
        skills = data.get('skills', [])
        
        # Mock job matching
        mock_jobs = [
            {
                'id': '1',
                'title': 'Senior Software Engineer',
                'company': 'TechCorp Inc.',
                'location': 'San Francisco, CA',
                'match_score': 92,
                'salary_range': '$120k - $160k',
                'requirements': ['Python', 'React', 'AWS'],
                'description': 'Join our growing team building scalable web applications.'
            },
            {
                'id': '2',
                'title': 'Full Stack Developer',
                'company': 'StartupXYZ',
                'location': 'Remote',
                'match_score': 88,
                'salary_range': '$90k - $130k',
                'requirements': ['JavaScript', 'Node.js', 'SQL'],
                'description': 'Help build the next generation of productivity tools.'
            }
        ]
        
        return jsonify({
            'matches': mock_jobs,
            'total_matches': len(mock_jobs),
            'search_criteria': {
                'skills': skills,
                'resume_analyzed': bool(resume)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Job matching failed', 'error': str(e)}), 500

# Cover letter generation
@app.route('/api/cover-letter/generate', methods=['POST'])
def generate_cover_letter():
    try:
        data = request.get_json()
        job_title = data.get('jobTitle', '')
        company_name = data.get('companyName', '')
        user_name = data.get('userName', 'Job Applicant')
        
        if not job_title or not company_name:
            return jsonify({'message': 'Job title and company name are required'}), 400
        
        # Mock cover letter generation
        content = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company_name}. With my background in software development and passion for creating innovative solutions, I believe I would be a valuable addition to your team.

In my previous roles, I have successfully:
• Developed and maintained scalable web applications
• Collaborated with cross-functional teams to deliver high-quality products  
• Implemented best practices for code quality and testing
• Contributed to improving system performance and user experience

I am particularly drawn to {company_name} because of your commitment to innovation and excellence in the industry. I would welcome the opportunity to discuss how my skills and experience can contribute to your team's continued success.

Thank you for considering my application. I look forward to hearing from you.

Sincerely,
{user_name}"""
        
        result = {
            'title': f'Cover Letter for {job_title} at {company_name}',
            'content': content,
            'createdAt': time.time()
        }
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'message': 'Cover letter generation failed', 'error': str(e)}), 500

# Admin routes
@app.route('/admin/<path:filename>')
def serve_admin(filename):
    return send_from_directory('admin', filename)

# Admin API endpoints
@app.route('/api/admin/articles', methods=['POST'])
def create_article():
    try:
        data = request.get_json()
        
        # Generate slug from title
        slug = re.sub(r'[^a-zA-Z0-9\s]', '', data['title']).lower()
        slug = re.sub(r'\s+', '-', slug.strip())
        
        # Check if slug exists
        if any(a['slug'] == slug for a in articles_db):
            return jsonify({'message': 'Slug already exists'}), 400
        
        # Create new article
        new_article = {
            'id': str(len(articles_db) + 1),
            'title': data['title'],
            'slug': slug,
            'content': data.get('content', ''),
            'excerpt': data.get('excerpt', ''),
            'author': data.get('author', 'Admin'),
            'created_at': time.strftime('%Y-%m-%d'),
            'cover_image_url': data.get('cover_image_url'),
            'is_featured': data.get('is_featured', False),
            'category': data.get('category', 'Career Tips')
        }
        
        articles_db.append(new_article)
        
        return jsonify({
            'message': 'Article created successfully',
            'article': new_article
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Failed to create article: {str(e)}'}), 500

@app.route('/api/admin/articles', methods=['GET'])
def get_admin_articles():
    return jsonify(articles_db)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV', 'development') == 'development'
    print(f"🚀 ResumeSmartBuild Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
