import express from 'express';
import { db, resumes, users } from '../storage';
import { eq, and } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    isPremium: boolean;
  };
}

const router = express.Router();

// Get user's resumes
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userResumes = await db.select().from(resumes).where(eq(resumes.userId, req.user!.id));
    res.json(userResumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific resume
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const resume = await db.select().from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, req.user!.id)))
      .limit(1);
    
    if (!resume.length) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    res.json(resume[0]);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new resume
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, templateId, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const newResume = await db.insert(resumes).values({
      userId: req.user!.id,
      templateId,
      title,
      content
    }).returning();
    
    res.status(201).json(newResume[0]);
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update resume
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    // Verify ownership
    const existingResume = await db.select().from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, req.user!.id)))
      .limit(1);
    
    if (!existingResume.length) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const updatedResume = await db.update(resumes)
      .set({
        title: title || existingResume[0].title,
        content: content || existingResume[0].content,
        updatedAt: new Date()
      })
      .where(eq(resumes.id, id))
      .returning();
    
    res.json(updatedResume[0]);
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete resume
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const existingResume = await db.select().from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, req.user!.id)))
      .limit(1);
    
    if (!existingResume.length) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    await db.delete(resumes).where(eq(resumes.id, id));
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as resumeRoutes };