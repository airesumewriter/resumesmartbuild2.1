const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (simplified)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Simplified user creation (in production, hash password and store in DB)
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      isPremium: false,
      scansRemaining: 3
    };

    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Simplified login (in production, verify against DB)
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      isPremium: false,
      scansRemaining: 3
    };

    const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Templates route
app.get('/api/templates', (req, res) => {
  const templates = [
    {
      id: '1',
      name: 'Modern Tech',
      category: 'tech',
      isFree: true,
      previewUrl: '/previews/modern-tech.jpg',
      templateData: { layout: 'modern', colors: ['#2563eb', '#1f2937'] }
    },
    {
      id: '2',
      name: 'Healthcare Professional',
      category: 'healthcare',
      isFree: true,
      previewUrl: '/previews/healthcare.jpg',
      templateData: { layout: 'professional', colors: ['#059669', '#374151'] }
    },
    {
      id: '3',
      name: 'Executive Premium',
      category: 'finance',
      isFree: false,
      previewUrl: '/previews/executive.jpg',
      templateData: { layout: 'executive', colors: ['#7c3aed', '#1f2937'] }
    }
  ];

  const { category, onlyFree } = req.query;
  let filtered = templates;

  if (category && category !== 'all') {
    filtered = filtered.filter(t => t.category === category);
  }

  if (onlyFree === 'true') {
    filtered = filtered.filter(t => t.isFree);
  }

  res.json(filtered);
});

// ATS Scan route
app.post('/api/scans/ats', (req, res) => {
  try {
    const { resumeContent, jobPosition } = req.body;
    
    if (!resumeContent) {
      return res.status(400).json({ message: 'Resume content is required' });
    }

    // Simulate ATS scan (in production, call Python service)
    const mockResult = {
      id: Math.random().toString(36).substr(2, 9),
      score: Math.floor(Math.random() * 30) + 70,
      suggestions: [
        'Add more relevant keywords for your target position',
        'Include specific metrics and achievements',
        'Use standard section headers (Experience, Education, Skills)',
        'Optimize for ATS readability with bullet points'
      ],
      keywords: {
        found: ['leadership', 'project management', 'python'],
        missing: ['agile', 'aws', 'docker', 'kubernetes']
      },
      structure: {
        present: ['experience', 'education'],
        missing: ['skills', 'summary']
      },
      readability: {
        score: 85,
        level: 'good'
      },
      scansRemaining: 2
    };

    res.json(mockResult);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Jobs route
app.get('/api/jobs', (req, res) => {
  const jobs = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc',
      location: 'San Francisco, CA',
      salaryMin: 120000,
      salaryMax: 180000,
      isRemote: true,
      description: 'We are looking for a Senior Software Engineer...',
      requirements: ['Python', 'React', 'AWS', 'Docker']
    },
    {
      id: '2',
      title: 'Data Scientist',
      company: 'DataFlow',
      location: 'New York, NY',
      salaryMin: 100000,
      salaryMax: 150000,
      isRemote: false,
      description: 'Join our data science team...',
      requirements: ['Python', 'Machine Learning', 'SQL']
    }
  ];

  const { location, remote } = req.query;
  let filtered = jobs;

  if (location) {
    filtered = filtered.filter(j => 
      j.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (remote === 'true') {
    filtered = filtered.filter(j => j.isRemote);
  }

  res.json(filtered);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});