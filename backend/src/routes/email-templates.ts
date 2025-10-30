import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { EmailTemplate } from '../entities/EmailTemplate';
import { asyncHandler } from '../middleware/error-handler';

const router = express.Router();

// Get all email templates
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const emailTemplateRepository = AppDataSource.getRepository(EmailTemplate);
  const templates = await emailTemplateRepository.find({
    order: { createdAt: 'DESC' }
  });
  
  res.json(templates);
}));

// Get email template by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const emailTemplateRepository = AppDataSource.getRepository(EmailTemplate);
  
  const template = await emailTemplateRepository.findOne({ where: { id } });
  if (!template) {
    return res.status(404).json({
      error: 'Template not found',
      message: 'Email template not found.'
    });
  }
  
  res.json(template);
}));

// Create new email template
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, subject, body, category, isActive = true, createdBy } = req.body;
  
  if (!name || !subject || !body || !createdBy) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name, subject, body, and createdBy are required.'
    });
  }
  
  const emailTemplateRepository = AppDataSource.getRepository(EmailTemplate);
  
  const template = new EmailTemplate();
  template.name = name;
  template.subject = subject;
  template.body = body;
  template.category = category || 'custom';
  template.isActive = isActive;
  template.createdBy = createdBy;
  
  const savedTemplate = await emailTemplateRepository.save(template);
  
  res.status(201).json(savedTemplate);
}));

// Update email template
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, subject, body, category, isActive } = req.body;
  
  const emailTemplateRepository = AppDataSource.getRepository(EmailTemplate);
  
  const template = await emailTemplateRepository.findOne({ where: { id } });
  if (!template) {
    return res.status(404).json({
      error: 'Template not found',
      message: 'Email template not found.'
    });
  }
  
  if (name !== undefined) template.name = name;
  if (subject !== undefined) template.subject = subject;
  if (body !== undefined) template.body = body;
  if (category !== undefined) template.category = category;
  if (isActive !== undefined) template.isActive = isActive;
  
  const updatedTemplate = await emailTemplateRepository.save(template);
  
  res.json(updatedTemplate);
}));

// Delete email template
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const emailTemplateRepository = AppDataSource.getRepository(EmailTemplate);
  
  const template = await emailTemplateRepository.findOne({ where: { id } });
  if (!template) {
    return res.status(404).json({
      error: 'Template not found',
      message: 'Email template not found.'
    });
  }
  
  await emailTemplateRepository.remove(template);
  
  res.json({ message: 'Email template deleted successfully' });
}));

export { router as emailTemplatesRouter };
