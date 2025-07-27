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

@app.route('/api/admin/templates/<template_id>', methods=['DELETE'])
def delete_template(template_id):
    try:
        # In real implementation, delete from database and file storage
        return jsonify({'message': 'Template deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete template'}), 500

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

if __name__ == '__main__':
    print("🚀 ResumeSmartBuild Server starting on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)