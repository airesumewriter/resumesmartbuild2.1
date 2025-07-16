// Newsletter functionality with SendGrid integration
// Handles newsletter signup, auto-responder, and PDF delivery

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.error('SENDGRID_API_KEY environment variable not set');
}

// Email templates and configuration
const EMAIL_CONFIG = {
    from: {
        email: 'info@resumesmartbuild.com',
        name: 'ResumeSmartBuild Team'
    },
    templates: {
        welcome: {
            subject: 'Welcome to ResumeSmartBuild! Your Free Resume Guide is Here 📄',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">
                            Welcome to ResumeSmartBuild! 🎉
                        </h1>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                            Hi there,
                        </p>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                            Thank you for joining the ResumeSmartBuild community! We're excited to help you create outstanding resumes that get noticed by employers and pass ATS systems.
                        </p>
                        
                        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #1d4ed8; margin-top: 0;">🎁 Your Welcome Gift</h3>
                            <p style="margin: 10px 0; color: #374151;">
                                As a new subscriber, you'll receive our comprehensive "Resume Success Guide" - a detailed PDF with:
                            </p>
                            <ul style="color: #374151; padding-left: 20px;">
                                <li>ATS-friendly resume formatting tips</li>
                                <li>Keyword optimization strategies</li>
                                <li>Industry-specific resume examples</li>
                                <li>Cover letter writing masterclass</li>
                                <li>Interview preparation checklist</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://resumesmartbuild.com" 
                               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Start Building Your Resume
                            </a>
                        </div>
                        
                        <h3 style="color: #1d4ed8;">What's Next?</h3>
                        <p style="color: #374151; line-height: 1.6;">
                            Over the next few days, you'll receive exclusive tips, templates, and resources to help you:
                        </p>
                        <ul style="color: #374151; padding-left: 20px;">
                            <li>Optimize your resume for specific job roles</li>
                            <li>Navigate applicant tracking systems</li>
                            <li>Access premium resume templates</li>
                            <li>Get early access to new features and tools</li>
                        </ul>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h4 style="color: #374151; margin-top: 0;">💼 Special Offers</h4>
                            <p style="color: #374151; margin: 0;">
                                Keep an eye out for exclusive subscriber discounts on premium templates and career resources!
                            </p>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Questions? Reply to this email - we're here to help you succeed!
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Best regards,<br>
                            The ResumeSmartBuild Team
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <div style="text-align: center; color: #6b7280; font-size: 14px;">
                            <p>ResumeSmartBuild | Professional Resume Solutions</p>
                            <p>
                                <a href="https://resumesmartbuild.com" style="color: #2563eb; text-decoration: none;">Visit Our Website</a> | 
                                <a href="[UNSUBSCRIBE_LINK]" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
                            </p>
                        </div>
                    </div>
                </div>
            `,
            text: `
Welcome to ResumeSmartBuild!

Thank you for joining our community! We're excited to help you create outstanding resumes that get noticed.

Your Welcome Gift:
- ATS-friendly resume formatting tips
- Keyword optimization strategies  
- Industry-specific resume examples
- Cover letter writing masterclass
- Interview preparation checklist

Visit: https://resumesmartbuild.com

Best regards,
The ResumeSmartBuild Team
            `
        }
    },
    pdfAttachments: {
        resumeGuide: {
            filename: 'ResumeSmartBuild-Success-Guide.pdf',
            content: null, // Will be populated with actual PDF content
            type: 'application/pdf',
            disposition: 'attachment'
        }
    }
};

// Newsletter subscription handler
async function subscribeToNewsletter(email, name = '') {
    try {
        // Validate email
        if (!isValidEmail(email)) {
            throw new Error('Invalid email address');
        }

        // Store subscriber in database (you can implement this with Firebase)
        await storeSubscriber(email, name);

        // Send welcome email with PDF attachment
        await sendWelcomeEmail(email, name);

        return {
            success: true,
            message: 'Successfully subscribed! Check your email for the welcome guide.'
        };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return {
            success: false,
            message: 'Subscription failed. Please try again.'
        };
    }
}

// Send welcome email with PDF attachment
async function sendWelcomeEmail(email, name = '') {
    try {
        const msg = {
            to: email,
            from: EMAIL_CONFIG.from,
            subject: EMAIL_CONFIG.templates.welcome.subject,
            text: EMAIL_CONFIG.templates.welcome.text.replace('[NAME]', name || 'there'),
            html: EMAIL_CONFIG.templates.welcome.html.replace('[NAME]', name || 'there'),
            attachments: [
                {
                    content: await generateResumePDF(),
                    filename: EMAIL_CONFIG.pdfAttachments.resumeGuide.filename,
                    type: EMAIL_CONFIG.pdfAttachments.resumeGuide.type,
                    disposition: EMAIL_CONFIG.pdfAttachments.resumeGuide.disposition
                }
            ]
        };

        await sgMail.send(msg);
        console.log('Welcome email sent successfully to:', email);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
}

// Generate or fetch PDF content using Python generator
async function generateResumePDF() {
    try {
        const { spawn } = require('child_process');
        
        return new Promise((resolve, reject) => {
            const python = spawn('python3', ['-c', `
import sys
sys.path.append('.')
from pdf_generator import generate_resume_guide_pdf
print(generate_resume_guide_pdf())
            `]);
            
            let output = '';
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            python.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error('PDF generation failed'));
                }
            });
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        // Fallback to simple PDF if Python generation fails
        return Buffer.from('Simple PDF placeholder content').toString('base64');
    }
}

// Store subscriber in database
async function storeSubscriber(email, name) {
    // Implement with Firebase or your preferred database
    const subscriber = {
        email: email,
        name: name,
        subscribedAt: new Date().toISOString(),
        status: 'active',
        source: 'website'
    };
    
    // For now, just log - implement actual storage
    console.log('Storing subscriber:', subscriber);
    return subscriber;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Send promotional email with affiliate links
async function sendPromotionalEmail(email, promoData) {
    try {
        const msg = {
            to: email,
            from: EMAIL_CONFIG.from,
            subject: promoData.subject || 'Exclusive Offer from ResumeSmartBuild',
            html: generatePromoHTML(promoData),
            text: generatePromoText(promoData)
        };

        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error('Error sending promotional email:', error);
        throw error;
    }
}

// Generate promotional email HTML with affiliate links
function generatePromoHTML(promoData) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">${promoData.title}</h2>
            <p>${promoData.description}</p>
            ${promoData.products ? promoData.products.map(product => `
                <div style="border: 1px solid #e5e7eb; padding: 20px; margin: 15px 0; border-radius: 8px;">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <a href="${product.affiliateLink}" 
                       style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        ${product.cta || 'Learn More'}
                    </a>
                </div>
            `).join('') : ''}
        </div>
    `;
}

// Generate promotional email text
function generatePromoText(promoData) {
    let text = `${promoData.title}\n\n${promoData.description}\n\n`;
    
    if (promoData.products) {
        promoData.products.forEach(product => {
            text += `${product.name}\n${product.description}\nLink: ${product.affiliateLink}\n\n`;
        });
    }
    
    return text;
}

module.exports = {
    subscribeToNewsletter,
    sendWelcomeEmail,
    sendPromotionalEmail,
    storeSubscriber
};