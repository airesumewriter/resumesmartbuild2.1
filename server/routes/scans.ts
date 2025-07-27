import express from 'express';
import { db, scans, resumes, users } from '../storage';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { spawn } from 'child_process';
import path from 'path';

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    isPremium: boolean;
  };
}

const router = express.Router();

// Get scan history for a resume
router.get('/resume/:resumeId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { resumeId } = req.params;
    
    // Verify user owns the resume
    const resume = await db.select().from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, req.user!.id)))
      .limit(1);
    
    if (!resume.length) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const scanHistory = await db.select().from(scans)
      .where(eq(scans.resumeId, resumeId))
      .orderBy(desc(scans.createdAt));
    
    res.json(scanHistory);
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Perform ATS scan
router.post('/ats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { resumeId, jobPosition } = req.body;
    
    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }
    
    // Check scan limits
    const user = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    
    if (!user.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user[0].isPremium && user[0].scansRemaining <= 0) {
      return res.status(403).json({ 
        message: 'No scans remaining. Upgrade to premium for unlimited scans.' 
      });
    }
    
    // Verify user owns the resume
    const resume = await db.select().from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, req.user!.id)))
      .limit(1);
    
    if (!resume.length) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Call Python ATS scanner
    const pythonScript = path.join(__dirname, '../../python/ats_scanner.py');
    const resumeContent = JSON.stringify(resume[0].content);
    
    const pythonProcess = spawn('python', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python script error:', error);
        return res.status(500).json({ message: 'ATS scan failed' });
      }
      
      try {
        const scanResult = JSON.parse(result);
        
        // Save scan result
        const newScan = await db.insert(scans).values({
          resumeId,
          score: scanResult.score,
          suggestions: scanResult.suggestions,
          keywords: scanResult.keywords
        }).returning();
        
        // Decrease scan count for non-premium users
        if (!user[0].isPremium) {
          await db.update(users)
            .set({ scansRemaining: user[0].scansRemaining - 1 })
            .where(eq(users.id, req.user!.id));
        }
        
        // Update resume scan date
        await db.update(resumes)
          .set({ lastScanDate: new Date() })
          .where(eq(resumes.id, resumeId));
        
        res.json({
          ...newScan[0],
          scansRemaining: user[0].isPremium ? -1 : user[0].scansRemaining - 1
        });
      } catch (parseError) {
        console.error('Error parsing scan result:', parseError);
        res.status(500).json({ message: 'Failed to process scan result' });
      }
    });
    
    // Send resume content to Python script
    pythonProcess.stdin.write(JSON.stringify({
      content: resumeContent,
      jobPosition: jobPosition || 'general'
    }));
    pythonProcess.stdin.end();
    
  } catch (error) {
    console.error('Error performing ATS scan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as scanRoutes };