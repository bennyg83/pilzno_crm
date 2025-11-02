import { Router, Request, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Pledge } from '../entities/Pledge'
import { Family } from '../entities/Family'
import { FamilyMember } from '../entities/FamilyMember'
import { authenticate } from '../middleware/auth'

const router = Router()
const pledgeRepository = AppDataSource.getRepository(Pledge)
const familyRepository = AppDataSource.getRepository(Family)
const familyMemberRepository = AppDataSource.getRepository(FamilyMember)

// Apply authentication middleware to all routes
router.use(authenticate)

// Get all pledges with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, familyId, status } = req.query
    
    const queryBuilder = pledgeRepository
      .createQueryBuilder('pledge')
      .leftJoinAndSelect('pledge.family', 'family')
      .leftJoinAndSelect('pledge.familyMember', 'familyMember')
      .orderBy('pledge.createdAt', 'DESC')

    if (familyId) {
      queryBuilder.andWhere('pledge.familyId = :familyId', { familyId })
    }

    if (status) {
      queryBuilder.andWhere('pledge.status = :status', { status })
    }

    const [pledges, total] = await queryBuilder
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .getManyAndCount()

    res.json({
      pledges,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    console.error('Error fetching pledges:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get pledge by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const pledge = await pledgeRepository.findOne({
      where: { id },
      relations: ['family', 'familyMember']
    })

    if (!pledge) {
      return res.status(404).json({ message: 'Pledge not found' })
    }

    res.json(pledge)
  } catch (error) {
    console.error('Error fetching pledge:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Create new pledge
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      amount,
      currency,
      description,
      date,
      isAnonymous,
      status = 'pending',
      notes,
      familyId,
      connectedEvents,
      dueDate,
      donationDate,
      isAnnualPledge,
      fulfilledAmount,
      fulfilledDate
    } = req.body

    // Validate required fields
    if (!amount || !description || !familyId) {
      return res.status(400).json({ 
        message: 'Amount, description, and family ID are required' 
      })
    }

    // Verify family exists
    const family = await familyRepository.findOne({ where: { id: familyId } })
    if (!family) {
      return res.status(404).json({ message: 'Family not found' })
    }

    // No need to verify family member since pledgedBy is removed

    // Create pledge
    const pledge = pledgeRepository.create({
      amount: parseFloat(amount),
      currency: currency || 'NIS',
      description,
      date: new Date(date),
      isAnonymous: isAnonymous || false,
      status,
      notes: notes || '',
      connectedEvents: connectedEvents || null,
      fulfilledAmount: fulfilledAmount ? parseFloat(fulfilledAmount) : null,
      fulfilledDate: fulfilledDate ? new Date(fulfilledDate) : null,
      isAnnualPledge: isAnnualPledge || false,
      dueDate: dueDate ? new Date(dueDate) : null,
      donationDate: donationDate ? new Date(donationDate) : null,
      familyId
    })

    const savedPledge = await pledgeRepository.save(pledge)

    // Return pledge with relations
    const pledgeWithRelations = await pledgeRepository.findOne({
      where: { id: savedPledge.id },
      relations: ['family', 'familyMember']
    })

    res.status(201).json({
      message: 'Pledge created successfully',
      pledge: pledgeWithRelations
    })
  } catch (error) {
    console.error('Error creating pledge:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update pledge
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body

    console.log('🔄 PLEDGE UPDATE REQUEST:', {
      id,
      updateData,
      isAnnualPledge: updateData.isAnnualPledge,
      description: updateData.description
    })

    const pledge = await pledgeRepository.findOne({ where: { id } })
    if (!pledge) {
      return res.status(404).json({ message: 'Pledge not found' })
    }

    console.log('🔄 EXISTING PLEDGE:', {
      id: pledge.id,
      description: pledge.description,
      isAnnualPledge: pledge.isAnnualPledge
    })

    // Update allowed fields
    const allowedFields = [
      'amount', 'currency', 'description', 'date', 
      'isAnonymous', 'status', 'notes', 'connectedEvents', 'dueDate',
      'donationDate', 'isAnnualPledge', 'fulfilledAmount', 'fulfilledDate'
    ]

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'date') {
          pledge[field] = updateData[field] ? new Date(updateData[field]) : new Date()
        } else if (field === 'amount') {
          pledge[field] = parseFloat(updateData[field])
        } else {
          pledge[field] = updateData[field]
        }
      }
    })

    pledge.updatedAt = new Date()

    console.log('🔄 PLEDGE BEFORE SAVE:', {
      id: pledge.id,
      description: pledge.description,
      isAnnualPledge: pledge.isAnnualPledge
    })

    const updatedPledge = await pledgeRepository.save(pledge)

    console.log('🔄 PLEDGE AFTER SAVE:', {
      id: updatedPledge.id,
      description: updatedPledge.description,
      isAnnualPledge: updatedPledge.isAnnualPledge
    })

    // Return updated pledge with relations
    const pledgeWithRelations = await pledgeRepository.findOne({
      where: { id: updatedPledge.id },
      relations: ['family', 'familyMember']
    })

    res.json({
      message: 'Pledge updated successfully',
      pledge: pledgeWithRelations
    })
  } catch (error) {
    console.error('Error updating pledge:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete pledge
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const pledge = await pledgeRepository.findOne({ where: { id } })
    if (!pledge) {
      return res.status(404).json({ message: 'Pledge not found' })
    }

    await pledgeRepository.remove(pledge)
    res.json({ message: 'Pledge deleted successfully' })
  } catch (error) {
    console.error('Error deleting pledge:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
