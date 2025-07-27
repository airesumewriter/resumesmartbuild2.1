import express from 'express';
import { db, templates } from '../storage';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, requirePremium } from '../middleware/auth';

const router = express.Router();

// Get all templates
router.get('/', async (req, res) => {
  try {
    const { category, onlyFree } = req.query;
    
    let query = db.select().from(templates);
    
    if (category) {
      query = query.where(eq(templates.category, category as string));
    }
    
    if (onlyFree === 'true') {
      query = query.where(eq(templates.isFree, true));
    }

    const allTemplates = await query;
    
    res.json(allTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    
    if (!template.length) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create template (admin only - would need admin middleware)
router.post('/', async (req, res) => {
  try {
    const { name, category, isFree, previewUrl, templateData } = req.body;
    
    if (!name || !category || !templateData) {
      return res.status(400).json({ message: 'Name, category, and template data are required' });
    }
    
    const newTemplate = await db.insert(templates).values({
      name,
      category,
      isFree: isFree || true,
      previewUrl,
      templateData
    }).returning();
    
    res.status(201).json(newTemplate[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as templateRoutes };