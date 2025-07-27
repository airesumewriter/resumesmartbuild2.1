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

jobs_db = [
    {
        'id': '1',
        'title': 'Senior Software Engineer',
        'company': 'TechCorp Inc',
        'location': 'San Francisco, CA',
        'salaryMin': 120000,
        'salaryMax': 180000,
        'isRemote': True,
        'description': 'We are looking for a Senior Software Engineer...',
        'requirements': ['Python', 'React', 'AWS', 'Docker']
    },
    {
        'id': '2',
        'title': 'Data Scientist',
        'company': 'DataFlow',
        'location': 'New York, NY',
        'salaryMin': 100000,
        'salaryMax': 150000,
        'isRemote': False,
        'description': 'Join our data science team...',
        'requirements': ['Python', 'Machine Learning', 'SQL']
    }
]

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/articles/')
def articles_index():
    return send_from_directory('articles', 'index.html')

@app.route('/articles/<path:filename>')
def articles_content(filename):
    return send_from_directory('articles', filename)

@app.route('/admin/<path:filename>')
def admin_content(filename):
    return send_from_directory('admin', filename)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'timestamp': time.time()})

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        if email in users_db:
            return jsonify({'message': 'User already exists'}), 400
        
        # Create user
        user_id = str(random.randint(100000, 999999))
        user = {
            'id': user_id,
            'email': email,
            'isPremium': False,
            'scansRemaining': 3
        }
        
        users_db[email] = user
        token = f"token_{user_id}"
        
        return jsonify({
            'message': 'User created successfully',
            'user': user,
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Simplified authentication
        if email in users_db:
            user = users_db[email]
        else:
            # Create demo user for testing
            user_id = str(random.randint(100000, 999999))
            user = {
                'id': user_id,
                'email': email,
                'isPremium': False,
                'scansRemaining': 3
            }
            users_db[email] = user
        
        token = f"token_{user['id']}"
        
        return jsonify({
            'message': 'Login successful',
            'user': user,
            'token': token
        })
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    category = request.args.get('category')
    only_free = request.args.get('onlyFree')
    
    filtered = templates_db[:]
    
    if category and category != 'all':
        filtered = [t for t in filtered if t['category'] == category]
    
    if only_free == 'true':
        filtered = [t for t in filtered if t['isFree']]
    
    return jsonify(filtered)

@app.route('/api/scans/ats', methods=['POST'])
def ats_scan():
    try:
        data = request.get_json()
        resume_content = data.get('resumeContent') or data.get('content')
        
        if not resume_content:
            return jsonify({'message': 'Resume content is required'}), 400
        
        # Simulate processing time
        time.sleep(2)
        
        # Generate mock ATS scan result
        score = random.randint(70, 95)
        suggestions = [
            'Add more relevant keywords for your target position',
            'Include specific metrics and achievements',
            'Use standard section headers (Experience, Education, Skills)',
            'Optimize for ATS readability with bullet points'
        ]
        
        if score < 80:
            suggestions.extend([
                'Consider adding a professional summary',
                'Include relevant certifications'
            ])
        
        result = {
            'id': str(random.randint(100000, 999999)),
            'score': score,
            'suggestions': suggestions[:5],
            'keywords': {
                'found': ['leadership', 'project management', 'python', 'communication'],
                'missing': ['agile', 'aws', 'docker', 'kubernetes', 'machine learning']
            },
            'structure': {
                'present': ['experience', 'education', 'contact'],
                'missing': ['skills', 'summary'] if score < 85 else ['certifications']
            },
            'readability': {
                'score': random.randint(75, 95),
                'level': 'good' if score > 80 else 'fair'
            },
            'scansRemaining': 2
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Scan error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    location = request.args.get('location')
    remote = request.args.get('remote')
    
    filtered = jobs_db[:]
    
    if location:
        filtered = [j for j in filtered if location.lower() in j['location'].lower()]
    
    if remote == 'true':
        filtered = [j for j in filtered if j['isRemote']]
    
    return jsonify(filtered)

@app.route('/api/admin/templates', methods=['POST'])
def upload_template():
    try:
        # Get form data
        template_name = request.form.get('templateName')
        category = request.form.get('category')
        industries = request.form.get('industries', '').split(',')
        pricing = request.form.get('pricing')
        description = request.form.get('description', '')
        
        # Handle file upload (in real implementation, save to cloud storage)
        template_file = request.files.get('templateFile')
        thumbnail_file = request.files.get('thumbnailFile')
        
        if not template_file:
            return jsonify({'message': 'Template file is required'}), 400
        
        # Simulate saving to database
        template_data = {
            'id': str(random.randint(100000, 999999)),
            'name': template_name,
            'category': category,
            'industries': [industry.strip() for industry in industries if industry.strip()],
            'pricing': pricing,
            'description': description,
            'filename': template_file.filename,
            'fileSize': len(template_file.read()),
            'thumbnailUrl': thumbnail_file.filename if thumbnail_file else None,
            'downloads': 0,
            'createdAt': time.time(),
            'isActive': True
        }
        
        return jsonify({
            'message': 'Template uploaded successfully',
            'template': template_data
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Upload failed: ' + str(e)}), 500

@app.route('/api/admin/templates', methods=['GET'])
def get_admin_templates():
    try:
        # Mock admin template data with more details
        templates = [
            {
                'id': '1',
                'name': 'Modern Tech Professional',
                'category': 'tech',
                'industries': ['Software Development', 'Data Science'],
                'pricing': 'free',
                'downloads': 1234,
                'isActive': True,
                'createdAt': time.time() - 86400 * 30
            },
            {
                'id': '2', 
                'name': 'Healthcare Professional',
                'category': 'healthcare',
                'industries': ['Nursing', 'Medical Practice'],
                'pricing': 'free',
                'downloads': 987,
                'isActive': True,
                'createdAt': time.time() - 86400 * 20
            },
            {
                'id': '3',
                'name': 'Executive Premium',
                'category': 'finance',
                'industries': ['Investment Banking', 'Corporate Finance'],
                'pricing': 'premium',
                'downloads': 756,
                'isActive': True,
                'createdAt': time.time() - 86400 * 10
            }
        ]
        
        return jsonify(templates)
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch templates'}), 500

# Article Management API Endpoints
@app.route('/api/admin/articles', methods=['POST'])
def create_article():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('content'):
            return jsonify({'message': 'Title and content are required'}), 400
        
        # Generate slug if not provided
        slug = data.get('slug')
        if not slug:
            slug = data['title'].lower().replace(' ', '-').replace('--', '-')
        
        # Insert article into database
        import psycopg2
        import os
        
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Check if slug already exists
        cur.execute("SELECT id FROM articles WHERE slug = %s", (slug,))
        if cur.fetchone():
            return jsonify({'message': 'Slug already exists'}), 400
        
        # Insert new article
        cur.execute("""
            INSERT INTO articles (title, slug, content, author, excerpt, cover_image_url, is_published, is_featured)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            data['title'],
            slug,
            data['content'],
            data.get('author', 'ResumeSmartBot'),
            data.get('excerpt', ''),
            data.get('cover_image_url'),
            data.get('is_published', True),
            data.get('is_featured', False)
        ))
        
        article_id, created_at = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Article created successfully',
            'article': {
                'id': str(article_id),
                'title': data['title'],
                'slug': slug,
                'created_at': created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Failed to create article: {str(e)}'}), 500

@app.route('/api/admin/articles', methods=['GET'])
def get_admin_articles():
    try:
        import psycopg2
        import os
        
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, title, slug, author, excerpt, created_at, updated_at, 
                   cover_image_url, is_published, is_featured
            FROM articles 
            ORDER BY created_at DESC
        """)
        
        articles = []
        for row in cur.fetchall():
            articles.append({
                'id': str(row[0]),
                'title': row[1],
                'slug': row[2],
                'author': row[3],
                'excerpt': row[4],
                'created_at': row[5].isoformat() if row[5] else None,
                'updated_at': row[6].isoformat() if row[6] else None,
                'cover_image_url': row[7],
                'is_published': row[8],
                'is_featured': row[9]
            })
        
        cur.close()
        conn.close()
        
        return jsonify(articles)
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch articles: {str(e)}'}), 500

@app.route('/api/articles', methods=['GET'])
def get_published_articles():
    try:
        import psycopg2
        import os
        
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Get published articles for homepage
        cur.execute("""
            SELECT id, title, slug, author, excerpt, created_at, 
                   cover_image_url, is_featured
            FROM articles 
            WHERE is_published = TRUE
            ORDER BY is_featured DESC, created_at DESC
            LIMIT 10
        """)
        
        articles = []
        for row in cur.fetchall():
            articles.append({
                'id': str(row[0]),
                'title': row[1],
                'slug': row[2],
                'author': row[3],
                'excerpt': row[4],
                'created_at': row[5].isoformat() if row[5] else None,
                'cover_image_url': row[6],
                'is_featured': row[7]
            })
        
        cur.close()
        conn.close()
        
        return jsonify(articles)
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch articles: {str(e)}'}), 500

@app.route('/articles/<slug>')
def view_article(slug):
    try:
        import psycopg2
        import os
        
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, title, slug, content, author, excerpt, created_at, 
                   cover_image_url, is_featured
            FROM articles 
            WHERE slug = %s AND is_published = TRUE
        """, (slug,))
        
        article = cur.fetchone()
        cur.close()
        conn.close()
        
        if not article:
            return "Article not found", 404
        
        # Simple markdown-like processing
        content = article[3]
        content = content.replace('\\n', '\n')
        content = content.replace('**', '<strong>').replace('**', '</strong>')
        content = content.replace('## ', '<h2>').replace('\n', '</h2>\n<p>')
        content = f'<p>{content}</p>'
        
        # Create article page HTML
        article_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{article[1]} - ResumeSmartBuild</title>
    <meta name="description" content="{article[5]}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-50 font-['Inter']">
    <nav class="bg-white shadow-sm">
        <div class="max-w-4xl mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">RS</span>
                    </div>
                    <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ResumeSmartBuild
                    </h1>
                </a>
                <div class="flex items-center space-x-6">
                    <a href="/" class="text-gray-600 hover:text-blue-600 font-medium">Home</a>
                    <a href="/" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Get Started
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <header class="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div class="max-w-4xl mx-auto px-4">
            <div class="flex items-center space-x-2 mb-4">
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Career Advice</span>
                <span class="text-gray-500">•</span>
                <time class="text-gray-500">{article[6].strftime('%B %d, %Y') if article[6] else ''}</time>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {article[1]}
            </h1>
            <p class="text-xl text-gray-600 leading-relaxed">
                {article[5]}
            </p>
        </div>
    </header>

    <article class="py-16">
        <div class="max-w-4xl mx-auto px-4">
            <div class="prose prose-lg max-w-none text-gray-700">
                {content}
            </div>

            <div class="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
                <h2 class="text-3xl font-bold text-white mb-4">Ready to Build Your Perfect Resume?</h2>
                <p class="text-blue-100 mb-6">
                    Put these tips into action with ResumeSmartBuild's AI-powered resume builder
                </p>
                <a href="/" class="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    Get Started Free
                </a>
            </div>
        </div>
    </article>

    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <div class="flex items-center justify-center space-x-2 mb-4">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-sm">RS</span>
                </div>
                <span class="text-xl font-bold">ResumeSmartBuild</span>
            </div>
            <p class="text-gray-400">AI-powered resume builder for career success</p>
        </div>
    </footer>
</body>
</html>"""
        
        return article_html
        
    except Exception as e:
        return f"Error loading article: {str(e)}", 500

@app.route('/api/cover-letters/generate', methods=['POST'])
def generate_cover_letter():
    try:
        data = request.get_json()
        job_title = data.get('jobTitle', 'Position')
        company_name = data.get('companyName', 'Company')
        
        # Generate basic cover letter
        content = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company_name}. 

With my background and experience, I am confident I would be a valuable addition to your team. My qualifications include relevant professional experience and skills that align well with your requirements.

I am excited about the opportunity to contribute to {company_name} and would welcome the chance to discuss how my skills can benefit your organization.

Thank you for your consideration.

Sincerely,
[Your Name]"""

        result = {
            'id': str(random.randint(100000, 999999)),
            'title': f'Cover Letter for {job_title} at {company_name}',
            'content': content,
            'createdAt': time.time()
        }
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# Admin routes
@app.route('/admin/<path:filename>')
def serve_admin(filename):
    return send_from_directory('admin', filename)

if __name__ == '__main__':
    print("🚀 ResumeSmartBuild Server starting on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)