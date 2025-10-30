import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { SystemSettings, SystemSettingCategory } from '../entities/SystemSettings';
import { asyncHandler } from '../middleware/error-handler';

const router = express.Router();

// Get all system settings
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const systemSettingsRepository = AppDataSource.getRepository(SystemSettings);
  const settings = await systemSettingsRepository.find({
    order: { category: 'ASC', key: 'ASC' }
  });
  
  res.json(settings);
}));

// Get system setting by key
router.get('/:key', asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const systemSettingsRepository = AppDataSource.getRepository(SystemSettings);
  
  const setting = await systemSettingsRepository.findOne({ where: { key } });
  if (!setting) {
    return res.status(404).json({
      error: 'Setting not found',
      message: 'System setting not found.'
    });
  }
  
  res.json(setting);
}));

// Create new system setting
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { key, value, category, description, isEditable = true, updatedBy } = req.body;
  
  if (!key || value === undefined || !updatedBy) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Key, value, and updatedBy are required.'
    });
  }
  
  const systemSettingsRepository = AppDataSource.getRepository(SystemSettings);
  
  // Check if setting already exists
  const existingSetting = await systemSettingsRepository.findOne({ where: { key } });
  if (existingSetting) {
    return res.status(409).json({
      error: 'Setting already exists',
      message: 'A system setting with this key already exists.'
    });
  }
  
  const setting = new SystemSettings();
  setting.key = key;
  setting.value = value;
  setting.category = category || 'general';
  setting.description = description || '';
  setting.isEditable = isEditable;
  setting.updatedBy = updatedBy;
  
  const savedSetting = await systemSettingsRepository.save(setting);
  
  res.status(201).json(savedSetting);
}));

// Update system setting
router.put('/:key', asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const { value, category, description, isEditable, updatedBy } = req.body;
  
  if (!updatedBy) {
    return res.status(400).json({
      error: 'Missing required field',
      message: 'updatedBy is required.'
    });
  }
  
  const systemSettingsRepository = AppDataSource.getRepository(SystemSettings);
  
  const setting = await systemSettingsRepository.findOne({ where: { key } });
  if (!setting) {
    return res.status(404).json({
      error: 'Setting not found',
      message: 'System setting not found.'
    });
  }
  
  if (!setting.isEditable) {
    return res.status(403).json({
      error: 'Setting not editable',
      message: 'This system setting cannot be modified.'
    });
  }
  
  if (value !== undefined) setting.value = value;
  if (category !== undefined) setting.category = category;
  if (description !== undefined) setting.description = description;
  if (isEditable !== undefined) setting.isEditable = isEditable;
  setting.updatedBy = updatedBy;
  
  const updatedSetting = await systemSettingsRepository.save(setting);
  
  res.json(updatedSetting);
}));

// Delete system setting
router.delete('/:key', asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const systemSettingsRepository = AppDataSource.getRepository(SystemSettings);
  
  const setting = await systemSettingsRepository.findOne({ where: { key } });
  if (!setting) {
    return res.status(404).json({
      error: 'Setting not found',
      message: 'System setting not found.'
    });
  }
  
  if (!setting.isEditable) {
    return res.status(403).json({
      error: 'Setting not deletable',
      message: 'This system setting cannot be deleted.'
    });
  }
  
  await systemSettingsRepository.remove(setting);
  
  res.json({ message: 'System setting deleted successfully' });
}));

// Get settings by category
router.get('/category/:category', asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const systemSettingsRepository = AppDataSource.getRepository(SystemSettings);
  
  // Validate that the category is a valid enum value
  if (!Object.values(SystemSettingCategory).includes(category as SystemSettingCategory)) {
    return res.status(400).json({
      error: 'Invalid category',
      message: 'Invalid system setting category.'
    });
  }
  
  const settings = await systemSettingsRepository.find({
    where: { category: category as SystemSettingCategory },
    order: { key: 'ASC' }
  });
  
  res.json(settings);
}));

// Bulk update settings
router.put('/bulk', asyncHandler(async (req: Request, res: Response) => {
  const { settings, updatedBy } = req.body;
  
  if (!Array.isArray(settings) || !updatedBy) {
    return res.status(400).json({
      error: 'Invalid format',
      message: 'Settings must be an array and updatedBy is required.'
    });
  }
  
  const systemSettingsRepository = AppDataSource.getRepository(SystemSettings);
  const updatedSettings = [];
  
  for (const settingUpdate of settings) {
    const { key, value } = settingUpdate;
    
    if (!key || value === undefined) {
      continue; // Skip invalid entries
    }
    
    const setting = await systemSettingsRepository.findOne({ where: { key } });
    if (setting && setting.isEditable) {
      setting.value = value;
      setting.updatedBy = updatedBy;
      const updatedSetting = await systemSettingsRepository.save(setting);
      updatedSettings.push(updatedSetting);
    }
  }
  
  res.json({
    message: 'Settings updated successfully',
    updatedCount: updatedSettings.length,
    settings: updatedSettings
  });
}));

export { router as systemSettingsRouter };
