import express from 'express';
import { db, jobs, jobMatches, resumes } from '../storage';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticateToken, requirePremium } from '../middleware/auth';

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    isPremium: boolean;
  };
}

const router = express.Router();

// Get job listings
router.get('/', async (req, res) => {
  try {
    const { location, remote, salaryMin, limit = 50 } = req.query;
    
    let query = db.select().from(jobs);
    
    // Apply filters
    const conditions = [];
    
    if (location) {
      conditions.push(sql`${jobs.location} ILIKE ${'%' + location + '%'}`);
    }
    
    if (remote === 'true') {
      conditions.push(eq(jobs.isRemote, true));
    }
    
    if (salaryMin) {
      conditions.push(sql`${jobs.salaryMin} >= ${Number(salaryMin)}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const jobListings = await query
      .orderBy(desc(jobs.createdAt))
      .limit(Number(limit));
    
    res.json(jobListings);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get job matches for a resume
router.get('/matches/:resumeId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { resumeId } = req.params;
    const { location, remote } = req.query;
    
    // Verify user owns the resume
    const resume = await db.select().from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, req.user!.id)))
      .limit(1);
    
    if (!resume.length) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Get job matches
    let matchQuery = db.select({
      job: jobs,
      matchScore: jobMatches.matchScore
    })
    .from(jobMatches)
    .innerJoin(jobs, eq(jobs.id, jobMatches.jobId))
    .where(eq(jobMatches.resumeId, resumeId));
    
    // Apply filters for premium users
    if (req.user?.isPremium) {
      const conditions = [];
      
      if (location) {
        conditions.push(sql`${jobs.location} ILIKE ${'%' + location + '%'}`);
      }
      
      if (remote === 'true') {
        conditions.push(eq(jobs.isRemote, true));
      }
      
      if (conditions.length > 0) {
        matchQuery = matchQuery.where(and(...conditions));
      }
    }
    
    const matches = await matchQuery
      .orderBy(desc(jobMatches.matchScore))
      .limit(req.user?.isPremium ? 100 : 10);
    
    res.json(matches);
  } catch (error) {
    console.error('Error fetching job matches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate job matches (calls Python job matcher)
router.post('/generate-matches', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { resumeId, location, radius = 25 } = req.body;
    
    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }
    
    // Verify user owns the resume
    const resume = await db.select().from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, req.user!.id)))
      .limit(1);
    
    if (!resume.length) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // This would typically call an external job API or Python service
    // For now, we'll return a simple response
    res.json({ 
      message: 'Job matching initiated', 
      resumeId,
      status: 'processing' 
    });
  } catch (error) {
    console.error('Error generating job matches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Premium feature: Remote work filter
router.get('/remote', requirePremium, async (req: AuthRequest, res) => {
  try {
    const remoteJobs = await db.select().from(jobs)
      .where(eq(jobs.isRemote, true))
      .orderBy(desc(jobs.createdAt))
      .limit(100);
    
    res.json(remoteJobs);
  } catch (error) {
    console.error('Error fetching remote jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as jobRoutes };