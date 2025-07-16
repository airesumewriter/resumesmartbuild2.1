#!/usr/bin/env python3
"""
PDF Content Generator for ResumeSmartBuild
Creates the Resume Success Guide PDF for email attachments
"""

import base64
import io
from datetime import datetime

def generate_resume_guide_pdf():
    """
    Generate a basic PDF content for the Resume Success Guide
    In production, you'd use a proper PDF library like reportlab
    """
    
    # Simple PDF structure (placeholder - implement with reportlab for production)
    pdf_content = f"""
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 1500
>>
stream
BT
/F1 24 Tf
50 720 Td
(ResumeSmartBuild Success Guide) Tj
0 -40 Td
/F1 16 Tf
(Your Complete Guide to ATS-Friendly Resumes) Tj
0 -60 Td
/F1 12 Tf
(Table of Contents:) Tj
0 -30 Td
(1. Understanding ATS Systems) Tj
0 -20 Td
(2. Resume Formatting Best Practices) Tj
0 -20 Td
(3. Keyword Optimization Strategies) Tj
0 -20 Td
(4. Industry-Specific Examples) Tj
0 -20 Td
(5. Cover Letter Integration) Tj
0 -20 Td
(6. Interview Preparation) Tj
0 -40 Td
/F1 14 Tf
(Chapter 1: Understanding ATS Systems) Tj
0 -30 Td
/F1 10 Tf
(Applicant Tracking Systems \(ATS\) are software applications) Tj
0 -15 Td
(used by employers to filter and rank resumes before they) Tj
0 -15 Td
(reach human recruiters. Understanding how these systems) Tj
0 -15 Td
(work is crucial for modern job seekers.) Tj
0 -30 Td
(Key ATS Facts:) Tj
0 -20 Td
(• 98% of Fortune 500 companies use ATS) Tj
0 -15 Td
(• 75% of resumes are rejected by ATS before human review) Tj
0 -15 Td
(• Simple formatting increases ATS compatibility) Tj
0 -15 Td
(• Keywords matching job descriptions are essential) Tj
0 -30 Td
/F1 14 Tf
(Chapter 2: Formatting Best Practices) Tj
0 -30 Td
/F1 10 Tf
(• Use standard fonts \(Arial, Calibri, Times New Roman\)) Tj
0 -15 Td
(• Maintain consistent formatting throughout) Tj
0 -15 Td
(• Use clear section headers) Tj
0 -15 Td
(• Avoid complex tables and graphics) Tj
0 -15 Td
(• Save as .docx or .pdf format) Tj
0 -30 Td
(Generated: {datetime.now().strftime('%B %d, %Y')}) Tj
0 -20 Td
(© 2025 ResumeSmartBuild - www.resumesmartbuild.com) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000356 00000 n 
0000001909 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1978
%%EOF
"""
    
    return base64.b64encode(pdf_content.encode()).decode()

def get_promotional_content():
    """
    Get promotional content structure for future emails
    """
    return {
        'subjects': [
            'Exclusive: 50% Off Premium Resume Templates',
            'New ATS Scanner Update - Try It Free!',
            'Limited Time: Professional Review Service',
            'Career Boost: Interview Preparation Course'
        ],
        'affiliate_products': [
            {
                'name': 'LinkedIn Premium Career',
                'description': 'Enhance your job search with LinkedIn Premium insights',
                'affiliate_link': 'https://linkedin.com/premium/?ref=resumesmartbuild',
                'cta': 'Try LinkedIn Premium'
            },
            {
                'name': 'Coursera Career Certificates',
                'description': 'Boost your skills with industry-recognized certificates',
                'affiliate_link': 'https://coursera.org/certificates/?ref=resumesmartbuild',
                'cta': 'Browse Certificates'
            },
            {
                'name': 'Grammarly Premium',
                'description': 'Perfect your resume and cover letter writing',
                'affiliate_link': 'https://grammarly.com/premium/?ref=resumesmartbuild',
                'cta': 'Get Grammarly Premium'
            }
        ],
        'future_products': [
            {
                'name': 'AI Interview Coach',
                'description': 'Practice interviews with AI-powered feedback',
                'status': 'coming_soon',
                'notification': 'Be the first to know when it launches!'
            },
            {
                'name': 'Salary Negotiation Masterclass',
                'description': 'Learn to negotiate your worth confidently',
                'status': 'development',
                'notification': 'Join the waitlist for early access'
            }
        ]
    }

if __name__ == "__main__":
    # Test PDF generation
    pdf_data = generate_resume_guide_pdf()
    print(f"Generated PDF with {len(pdf_data)} characters")
    
    # Test promotional content
    promo = get_promotional_content()
    print(f"Available affiliate products: {len(promo['affiliate_products'])}")