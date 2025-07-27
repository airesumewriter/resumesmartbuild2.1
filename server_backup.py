#!/usr/bin/env python3
"""
Simple Python server for ResumeSmartBuild
"""
import json
import time
import random
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)

# Mock data
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

# Articles database
articles_db = [
    {
        'id': '1',
        'title': '10 ATS Resume Tips That Actually Work in 2024',
        'slug': 'ats-resume-tips-2024',
        'excerpt': 'Master the art of beating ATS systems with these proven strategies that helped 50,000+ job seekers land interviews.',
        'content': '''# 10 ATS Resume Tips That Actually Work in 2024

Are you tired of your resume disappearing into the black hole of online applications? You're not alone. Over 75% of resumes never reach human eyes because they fail to pass Applicant Tracking System (ATS) filters. But here's the good news: with the right strategies, you can dramatically increase your chances of getting noticed.

## Understanding ATS Systems

Before diving into the tips, let's understand what we're dealing with. ATS software scans your resume for specific keywords, formats, and qualifications before a human ever sees it. Think of it as a gatekeeper that determines whether your application moves forward or gets automatically rejected.

## Tip 1: Use the Right Keywords

The most critical factor in ATS optimization is keyword matching. Here's how to do it right:

- **Extract keywords from job descriptions**: Look for repeated terms, required skills, and qualifications
- **Use industry-specific terminology**: Don't say "managed people" when the job requires "team leadership"
- **Include both acronyms and full terms**: Write "Search Engine Optimization (SEO)" instead of just "SEO"
- **Natural integration**: Weave keywords naturally into your experience descriptions

## Tip 2: Choose the Right File Format

Not all file formats are created equal in the eyes of ATS systems:

**Best formats:**
- .docx (Microsoft Word)
- .pdf (if the system supports it)

**Avoid:**
- .jpg or image files
- .txt files (lose formatting)
- Complex .pdf files with graphics

## Tip 3: Optimize Your Resume Structure

ATS systems expect certain sections in a logical order:

1. **Contact Information** (at the top)
2. **Professional Summary** or Objective
3. **Work Experience** (with dates and job titles)
4. **Education**
5. **Skills**
6. **Additional sections** (certifications, languages, etc.)

## Tip 4: Use Standard Section Headings

Stick to conventional headings that ATS systems recognize:
- "Work Experience" or "Professional Experience"
- "Education"
- "Skills" or "Core Competencies"
- "Certifications"

Avoid creative headings like "My Journey" or "What I Bring to the Table."

## Tip 5: Format Dates Consistently

Use a consistent date format throughout your resume:
- **Good**: "January 2020 - March 2022" or "01/2020 - 03/2022"
- **Avoid**: "Jan '20 - Mar '22" or inconsistent formatting

## Tip 6: Optimize for Both ATS and Humans

Remember, if your resume passes the ATS, a human will read it. Balance optimization with readability:
- Use bullet points for easy scanning
- Keep descriptions concise but impactful
- Include quantifiable achievements
- Maintain visual appeal without complex graphics

## Tip 7: Avoid Resume "Black Holes"

Common ATS killers include:
- Headers and footers with important information
- Tables and text boxes
- Images and graphics
- Unusual fonts
- Dense paragraphs without white space

## Tip 8: Test Your Resume

Before submitting, test your resume:
- Copy and paste it into a plain text editor - can you read everything?
- Use online ATS checkers
- Ask friends in your industry to review it
- Submit to a few less-important positions first as tests

## Tip 9: Customize for Each Application

This is crucial but often overlooked:
- Tailor your professional summary to the specific role
- Adjust your skills section to match job requirements
- Reorder your experience to highlight relevant roles
- Use the same job titles mentioned in the posting when accurate

## Tip 10: Keep Learning and Adapting

ATS technology evolves constantly:
- Stay updated on industry trends
- Network with recruiters to understand their systems
- Join professional groups discussing ATS strategies
- Regularly update your resume with new skills and experiences

## The Bottom Line

Beating ATS systems isn't about gaming the system - it's about clearly communicating your qualifications in a format that both machines and humans can understand. The goal is to get your resume in front of the right people, and these strategies will significantly increase your chances.

Remember, ATS optimization is just the first step. Once you pass the initial screening, your resume needs to impress human recruiters and hiring managers. Focus on creating a document that showcases your achievements, demonstrates your value, and tells your professional story effectively.

Start implementing these tips today, and you'll see a noticeable improvement in your application response rates. Your dream job is out there - make sure your resume can actually reach the people who matter.''',
        'author': 'Sarah Chen',
        'created_at': '2024-01-15',
        'cover_image_url': '/images/ats-tips-cover.jpg',
        'is_featured': True,
        'category': 'ATS Optimization'
    }
]

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
    
    # Simple user storage (in production, hash passwords!)
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
        
        # Mock ATS analysis (in production, use actual ATS analysis)
        keywords_found = []
        missing_keywords = []
        
        # Simple keyword matching simulation
        job_keywords = ['python', 'javascript', 'react', 'node.js', 'sql', 'git', 'aws']
        resume_lower = resume_text.lower()
        
        for keyword in job_keywords:
            if keyword.lower() in resume_lower:
                keywords_found.append(keyword)
            else:
                missing_keywords.append(keyword)
        
        match_score = min(95, max(60, len(keywords_found) * 12 + random.randint(-10, 10)))
        
        suggestions = [
            f"Add missing keywords: {', '.join(missing_keywords[:3])}" if missing_keywords else "Great keyword coverage!",
            "Use bullet points for better readability",
            "Quantify your achievements with numbers",
            "Include relevant certifications",
            "Optimize for both ATS and human readers"
        ]
        
        result = {
            'matchScore': match_score,
            'keywordsFound': keywords_found,
            'missingKeywords': missing_keywords,
            'suggestions': suggestions[:4],
            'overallFeedback': 'Your resume shows good potential. Focus on the missing keywords and quantifiable achievements to improve your ATS score.',
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
    # Return articles with basic info for listing
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

# Admin routes
@app.route('/admin/<path:filename>')
def serve_admin(filename):
    return send_from_directory('admin', filename)

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV', 'development') == 'development'
    print(f"🚀 ResumeSmartBuild Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)