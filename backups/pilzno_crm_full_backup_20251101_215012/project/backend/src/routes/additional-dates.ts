import { Router, Request, Response } from 'express'
import { AppDataSource } from '../data-source'
import { AdditionalImportantDate, AdditionalDateType } from '../entities/AdditionalImportantDate'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()
const additionalDateRepository = AppDataSource.getRepository(AdditionalImportantDate)

// Get all additional dates for a family
router.get('/family/:familyId', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { familyId } = req.params
  
  const additionalDates = await additionalDateRepository.find({
    where: { familyId },
    order: { createdAt: 'ASC' }
  })
  
  res.json({
    additionalDates,
    total: additionalDates.length,
    message: 'Additional important dates retrieved successfully'
  })
}))

// Create a new additional date
router.post('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { familyId, type, description, englishDate, hebrewDate, memberId, memberName } = req.body
  
  // Validate required fields
  if (!familyId || !type || !englishDate) {
    return res.status(400).json({
      message: 'Family ID, type, and English date are required'
    })
  }
  
  // Validate date type
  const validTypes: AdditionalDateType[] = ['wedding_anniversary', 'aliyah_anniversary', 'other']
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: 'Invalid date type. Must be one of: wedding_anniversary, aliyah_anniversary, other'
    })
  }
  
  // Create new additional date
  const additionalDate = additionalDateRepository.create({
    familyId,
    type,
    description: type === 'other' ? description : undefined,
    englishDate,
    hebrewDate: hebrewDate || undefined,
    memberId: memberId || undefined,
    memberName: memberName || undefined
  })
  
  const savedDate = await additionalDateRepository.save(additionalDate)
  
  res.status(201).json({
    additionalDate: savedDate,
    message: 'Additional important date created successfully'
  })
}))

// Update an additional date
router.put('/:id', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { type, description, englishDate, hebrewDate, memberId, memberName } = req.body
  
  // Find existing date
  const existingDate = await additionalDateRepository.findOne({ where: { id } })
  if (!existingDate) {
    return res.status(404).json({
      message: 'Additional important date not found'
    })
  }
  
  // Validate date type if provided
  if (type) {
    const validTypes: AdditionalDateType[] = ['wedding_anniversary', 'aliyah_anniversary', 'other']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid date type. Must be one of: wedding_anniversary, aliyah_anniversary, other'
      })
    }
  }
  
  // Update fields
  if (type !== undefined) existingDate.type = type
  if (description !== undefined) existingDate.description = type === 'other' ? description : undefined
  if (englishDate !== undefined) existingDate.englishDate = englishDate
  if (hebrewDate !== undefined) existingDate.hebrewDate = hebrewDate
  if (memberId !== undefined) existingDate.memberId = memberId
  if (memberName !== undefined) existingDate.memberName = memberName
  
  const updatedDate = await additionalDateRepository.save(existingDate)
  
  res.json({
    additionalDate: updatedDate,
    message: 'Additional important date updated successfully'
  })
}))

// Delete an additional date
router.delete('/:id', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  const existingDate = await additionalDateRepository.findOne({ where: { id } })
  if (!existingDate) {
    return res.status(404).json({
      message: 'Additional important date not found'
    })
  }
  
  await additionalDateRepository.remove(existingDate)
  
  res.json({
    message: 'Additional important date deleted successfully'
  })
}))

// Get all additional dates (admin function)
router.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, familyId } = req.query
  
  const queryBuilder = additionalDateRepository.createQueryBuilder('additionalDate')
    .leftJoinAndSelect('additionalDate.family', 'family')
    .orderBy('additionalDate.createdAt', 'DESC')
  
  if (familyId) {
    queryBuilder.where('additionalDate.familyId = :familyId', { familyId })
  }
  
  const [additionalDates, total] = await queryBuilder
    .skip((Number(page) - 1) * Number(limit))
    .take(Number(limit))
    .getManyAndCount()
  
  res.json({
    additionalDates,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  })
}))

export default router
