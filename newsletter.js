// secure_server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000; // ✅ Fix: use Replit-assigned port

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Make sure this is set in Replit Secrets

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve index.html from /public

// ✅ Health check for Replit
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Newsletter signup endpoint
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const msg = {
      to: email,
      from: 'info@resumesmartbuild.com', // Your verified sender email
      subject: 'Welcome to ResumeSmartBuild!',
      html: `
        <h1>Thanks for Signing Up!</h1>
        <p>We’re excited to help you build a smarter resume with AI.</p>
        <p>You can get started here: <a href="https://resumesmartbuild.com">Visit ResumeSmartBuild</a></p>
      `,
    };

    await sgMail.send(msg);
    res.status(200).json({ success: true, message: 'Thank you! Check your inbox.' });
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Newsletter server running on port ${PORT}`);
});