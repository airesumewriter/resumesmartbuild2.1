import express from 'express';
import { db, coverLetters, resumes } from '../storage';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateToken, requirePremium } from '../middleware/auth';

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    isPremium: boolean;
  };
}

const router = express.Router();

// Get user's cover letters
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userCoverLetters = await db.select().from(coverLetters)
      .where(eq(coverLetters.userId, req.user!.id))
      .orderBy(desc(coverLetters.createdAt));
    
    res.json(userCoverLetters);
  } catch (error) {
    console.error('Error fetching cover letters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific cover letter
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const coverLetter = await db.select().from(coverLetters)
      .where(and(eq(coverLetters.id, id), eq(coverLetters.userId, req.user!.id)))
      .limit(1);
    
    if (!coverLetter.length) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }
    
    res.json(coverLetter[0]);
  } catch (error) {
    console.error('Error fetching cover letter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate AI cover letter
router.post('/generate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { resumeId, jobId, jobTitle, companyName } = req.body;
    
    if (!resumeId || !jobTitle || !companyName) {
      return res.status(400).json({ 
        message: 'Resume ID, job title, and company name are required' 
      });
    }
    
    // Check if user has premium for unlimited or if they have free generation left
    // This is a simplified check - in production, you'd track usage more precisely
    
    // Verify user owns the resume
    const resume = await db.select().from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, req.user!.id)))
      .limit(1);
    
    if (!resume.length) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Generate cover letter content (simplified AI generation)
    const generatedContent = generateCoverLetterContent(resume[0], jobTitle, companyName);
    
    const newCoverLetter = await db.insert(coverLetters).values({
      userId: req.user!.id,
      resumeId,
      jobId,
      title: `Cover Letter for ${jobTitle} at ${companyName}`,
      content: generatedContent
    }).returning();
    
    res.status(201).json(newCoverLetter[0]);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update cover letter
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    // Verify ownership
    const existingCoverLetter = await db.select().from(coverLetters)
      .where(and(eq(coverLetters.id, id), eq(coverLetters.userId, req.user!.id)))
      .limit(1);
    
    if (!existingCoverLetter.length) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }
    
    const updatedCoverLetter = await db.update(coverLetters)
      .set({
        title: title || existingCoverLetter[0].title,
        content: content || existingCoverLetter[0].content,
        updatedAt: new Date()
      })
      .where(eq(coverLetters.id, id))
      .returning();
    
    res.json(updatedCoverLetter[0]);
  } catch (error) {
    console.error('Error updating cover letter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete cover letter
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const existingCoverLetter = await db.select().from(coverLetters)
      .where(and(eq(coverLetters.id, id), eq(coverLetters.userId, req.user!.id)))
      .limit(1);
    
    if (!existingCoverLetter.length) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }
    
    await db.delete(coverLetters).where(eq(coverLetters.id, id));
    
    res.json({ message: 'Cover letter deleted successfully' });
  } catch (error) {
    console.error('Error deleting cover letter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to generate cover letter content
function generateCoverLetterContent(resume: any, jobTitle: string, companyName: string): string {
  // This is a simplified version - in production, this would use proper AI/NLP
  const content = resume.content;
  const name = content.personalInfo?.name || 'Job Applicant';
  
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background and experience outlined in my attached resume, I am confident I would be a valuable addition to your team.

${content.summary || 'I bring a unique combination of skills and experience that align well with your requirements.'}

My key qualifications include:
${content.experience ? content.experience.slice(0, 2).map((exp: any) => `• ${exp.title} experience at ${exp.company}`).join('\n') : '• Relevant professional experience'}

I am excited about the opportunity to contribute to ${companyName} and would welcome the chance to discuss how my skills and enthusiasm can benefit your organization.

Thank you for your consideration.

Sincerely,
${name}`;
}

export { router as coverLetterRoutes };