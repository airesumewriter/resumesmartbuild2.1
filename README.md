# ResumeSmartBuild - AI-Powered Resume Builder

A comprehensive AI-powered resume building web application that helps users create professional resumes with cutting-edge tools and seamless user experience.

## Features

- **ATS Resume Scanning**: Advanced resume analysis to optimize for Applicant Tracking Systems
- **Smart Templates**: Professional resume templates optimized for different industries
- **Job Matching**: AI-powered job recommendation system
- **Cover Letter Generator**: Automated cover letter creation
- **Article Management**: SEO-optimized content management system
- **User Authentication**: Secure user registration and login
- **Admin Panel**: Comprehensive admin interface for content management
- **Mobile Responsive**: Fully responsive design for all devices

## Tech Stack

- **Backend**: Python Flask
- **Frontend**: Vanilla JavaScript with React via CDN
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (production) / In-memory (development)
- **Deployment**: Google Cloud Run, Replit Deployments

## Quick Start

### Prerequisites

- Python 3.11+
- Flask
- Flask-CORS

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/resumesmartbuild.git
cd resumesmartbuild
```

2. Install dependencies:
```bash
pip install flask flask-cors gunicorn
```

3. Run the development server:
```bash
python server.py
```

4. Open your browser and navigate to `http://localhost:5000`

## Deployment

### Replit Deployment
1. Import the project to Replit
2. Click the "Deploy" button
3. Your app will be live on a `.replit.app` domain

### Google Cloud Run
1. Build and deploy using the provided configuration:
```bash
gcloud builds submit --config cloudbuild.yaml
```

### Other Platforms
Use the provided `Dockerfile` and `Procfile` for deployment on platforms like Heroku, Railway, or other container services.

## API Endpoints

### Core Features
- `GET /api/health` - Health check
- `POST /api/ats-scan` - ATS resume analysis
- `GET /api/templates` - Resume templates
- `POST /api/jobs/match` - Job matching
- `POST /api/cover-letter/generate` - Cover letter generation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Content Management
- `GET /api/articles` - Get articles
- `GET /api/featured` - Get featured articles
- `POST /api/admin/articles` - Create article (admin)

## Project Structure

```
resumesmartbuild/
├── server.py              # Main Flask application
├── index.html            # Frontend homepage
├── admin/               # Admin panel files
│   ├── articles.html
│   ├── templates.html
│   └── ...
├── deployment/          # Deployment configurations
│   ├── Dockerfile
│   ├── app.yaml
│   ├── cloudbuild.yaml
│   └── deployment.yaml
└── static/             # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@resumesmartbuild.com or create an issue in this repository.

## Changelog

- **v1.0.0** - Initial release with full ATS scanning, templates, and admin panel
- **v1.1.0** - Added article management system and SEO optimization
- **v1.2.0** - Enhanced deployment configuration and cloud compatibility