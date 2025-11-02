import express, { Response } from 'express';
import { AppDataSource } from '../data-source';
import { FamilyMember, RelationshipInHouse } from '../entities/FamilyMember';
import { Family } from '../entities/Family';
import { asyncHandler } from '../middleware/error-handler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all family members with filtering and pagination
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const memberRepository = AppDataSource.getRepository(FamilyMember);
  const { 
    page = 1, 
    limit = 50, 
    familyId, 
    search, 
    isActive = 'true',
    relationshipInHouse // Updated from relationshipInFamily
  } = req.query;

  const queryBuilder = memberRepository.createQueryBuilder('member')
    .leftJoinAndSelect('member.family', 'family')
    .orderBy('member.lastName', 'ASC')
    .addOrderBy('member.firstName', 'ASC');

  // Apply filters
  if (familyId) {
    queryBuilder.andWhere('member.familyId = :familyId', { familyId });
  }

  if (isActive !== 'all') {
    queryBuilder.andWhere('member.isActive = :isActive', { isActive: isActive === 'true' });
  }

  if (relationshipInHouse) {
    queryBuilder.andWhere('member.relationshipInHouse = :relationshipInHouse', { relationshipInHouse });
  }

  if (search) {
    queryBuilder.andWhere(
      '(LOWER(member.firstName) LIKE LOWER(:search) OR LOWER(member.lastName) LIKE LOWER(:search) OR LOWER(member.email) LIKE LOWER(:search) OR LOWER(member.cellPhone) LIKE LOWER(:search) OR LOWER(member.fullHebrewName) LIKE LOWER(:search) OR LOWER(member.hebrewLastName) LIKE LOWER(:search))',
      { search: `%${search}%` }
    );
  }

  // Pagination
  const offset = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(offset).take(Number(limit));

  const [members, total] = await queryBuilder.getManyAndCount();

  res.json({
    members,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  });
}));

// Get member by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const memberRepository = AppDataSource.getRepository(FamilyMember);
  const member = await memberRepository.findOne({
    where: { id: req.params.id },
    relations: ['family']
  });

  if (!member) {
    return res.status(404).json({
      error: 'Member not found',
      message: 'The specified member does not exist.'
    });
  }

  res.json({ member });
}));

// Create new family member
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const memberRepository = AppDataSource.getRepository(FamilyMember);
  const familyRepository = AppDataSource.getRepository(Family);

  const {
    firstName,
    lastName,
    fullHebrewName,
    hebrewLastName,
    email,
    cellPhone,
    whatsappNumber,
    dateOfBirth,
    hebrewBirthDate,
    relationshipInHouse, // Frontend sends this
    familyId,
    isPrimaryContact,
    isActive,
    mothersHebrewName,
    fathersHebrewName,
    isCohen,
    isLevi,
    isYisroel,
    title,
    aliyahDate,
    dateOfDeath,
    hebrewDeathDate,
    memorialInstructions,
    education,
    profession,
    synagogueRoles,
    skills,
    interests,
    receiveEmails,
    receiveTexts,
    emergencyContact,
    medicalNotes,
    accessibilityNeeds,
    notes
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !familyId) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'First name, last name, and family ID are required.'
    });
  }

  // Verify family exists
  const family = await familyRepository.findOne({ where: { id: familyId } });
  if (!family) {
    return res.status(404).json({
      error: 'Family not found',
      message: 'The specified family does not exist.'
    });
  }

  // Check for duplicate email if provided
  if (email) {
    // Check if email exists for a different person (same email + different name OR same email + different family)
    const existingMember = await memberRepository.findOne({ 
      where: { email },
      relations: ['family']
    });
    
    if (existingMember) {
      // Allow same email if it's the same person being updated (check by name similarity)
      const isSamePerson = (
        existingMember.firstName.toLowerCase() === firstName.toLowerCase() &&
        existingMember.lastName.toLowerCase() === lastName.toLowerCase()
      );
      
      // Allow same email if it's within the same family
      const isSameFamily = existingMember.familyId === familyId;
      
      // Only block if it's a different person in a different family
      if (!isSamePerson && !isSameFamily) {
        return res.status(409).json({
          error: 'Email already exists',
          message: 'A member with this email address already exists in another family.',
          existingMember: {
            id: existingMember.id,
            firstName: existingMember.firstName,
            lastName: existingMember.lastName,
            family: existingMember.family
          }
        });
      }
    }
  }

  // 🚨 DUPLICATE PREVENTION: Check for recent duplicate submissions
  // This prevents network-level duplication from creating multiple records
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  
  const recentDuplicate = await memberRepository
    .createQueryBuilder('member')
    .where('member.firstName = :firstName', { firstName })
    .andWhere('member.lastName = :lastName', { lastName })
    .andWhere('member.familyId = :familyId', { familyId })
    .andWhere('member.createdAt > :fiveSecondsAgo', { fiveSecondsAgo })
    .orderBy('member.createdAt', 'DESC')
    .getOne();

  if (recentDuplicate) {
    console.log(`🚨 DUPLICATE PREVENTION: Blocking duplicate submission for ${firstName} ${lastName} in family ${familyId}`);
    console.log(`🚨 Recent duplicate found: ${recentDuplicate.id} created at ${recentDuplicate.createdAt}`);
    
    // Return the existing member instead of creating a duplicate
    const existingMember = await memberRepository.findOne({
      where: { id: recentDuplicate.id },
      relations: ['family']
    });

    return res.status(200).json({
      message: 'Member already exists (duplicate submission prevented)',
      member: existingMember,
      duplicatePrevented: true
    });
  }

  const member = new FamilyMember();
  member.firstName = firstName;
  member.lastName = lastName;
  member.fullHebrewName = fullHebrewName || null;
  member.hebrewLastName = hebrewLastName || null;
  member.email = email || null;
  member.cellPhone = cellPhone || null;
  member.whatsappNumber = whatsappNumber || null;
  member.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
  member.hebrewBirthDate = hebrewBirthDate || undefined;
  member.relationshipInHouse = relationshipInHouse || RelationshipInHouse.HUSBAND;
  member.familyId = familyId;
  member.isPrimaryContact = isPrimaryContact || false;
  member.isActive = isActive !== undefined ? isActive : true;
  member.mothersHebrewName = mothersHebrewName || null;
  member.fathersHebrewName = fathersHebrewName || null;
  member.isCohen = isCohen || false;
  member.isLevi = isLevi || false;
  member.isYisroel = isYisroel || false;
  member.title = title || null;
  member.aliyahDate = aliyahDate ? new Date(aliyahDate) : undefined;
  member.dateOfDeath = dateOfDeath ? new Date(dateOfDeath) : undefined;
  member.hebrewDeathDate = hebrewDeathDate || undefined;
  member.memorialInstructions = memorialInstructions || null;
  member.education = education || null;
  member.profession = profession || null;
  member.synagogueRoles = synagogueRoles || null;
  member.skills = skills || null;
  member.interests = interests || null;
  member.receiveEmails = receiveEmails !== undefined ? receiveEmails : true;
  member.receiveTexts = receiveTexts || false;
  member.emergencyContact = emergencyContact || false;
  member.medicalNotes = medicalNotes || null;
  member.accessibilityNeeds = accessibilityNeeds || null;
  member.notes = notes || null;

  await memberRepository.save(member);

  // If wedding anniversary is provided, update the family record
  if (req.body.weddingAnniversary || req.body.hebrewWeddingAnniversary) {
    const familyRepository = AppDataSource.getRepository(Family);
    const family = await familyRepository.findOne({ where: { id: familyId } });
    if (family) {
      if (req.body.weddingAnniversary) {
        family.weddingAnniversary = new Date(req.body.weddingAnniversary);
      }
      if (req.body.hebrewWeddingAnniversary) {
        family.hebrewWeddingAnniversary = req.body.hebrewWeddingAnniversary;
      }
      await familyRepository.save(family);
    }
  }

  // Fetch the saved member with family relation
  const savedMember = await memberRepository.findOne({
    where: { id: member.id },
    relations: ['family']
  });

  res.status(201).json({
    message: 'Family member created successfully',
    member: savedMember
  });
}));

// Update family member
router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const memberRepository = AppDataSource.getRepository(FamilyMember);
  const member = await memberRepository.findOne({ where: { id: req.params.id } });

  if (!member) {
    return res.status(404).json({
      error: 'Member not found',
      message: 'The specified member does not exist.'
    });
  }

  // Check for duplicate email if being updated
  if (req.body.email && req.body.email !== member.email) {
    const existingMember = await memberRepository.findOne({ 
      where: { email: req.body.email },
      relations: ['family']
    });
    
    if (existingMember) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'A member with this email address already exists.',
        existingMember: {
          id: existingMember.id,
          firstName: existingMember.firstName,
          lastName: existingMember.lastName,
          family: existingMember.family
        }
      });
    }
  }

  // Update fields
  (Object.keys(req.body) as Array<keyof FamilyMember | string>).forEach((key) => {
    if (key === 'dateOfBirth' || key === 'aliyahDate' || key === 'dateOfDeath') {
      const typedKey = key as keyof FamilyMember;
      const value = (req.body as Record<string, unknown>)[key];
      (member as any)[typedKey] = value ? new Date(value as string) : undefined;
    } else if (key === 'relationshipInHouse') {
      // Map relationshipInHouse to relationshipInHouse
      member.relationshipInHouse = (req.body as Record<string, unknown>)[key] as any;
    } else if ((req.body as Record<string, unknown>)[key] !== undefined) {
      const typedKey = key as keyof FamilyMember;
      (member as any)[typedKey] = (req.body as Record<string, unknown>)[key];
    }
  });

  await memberRepository.save(member);

  // If wedding anniversary is being updated, also update the family record
  if (req.body.weddingAnniversary || req.body.hebrewWeddingAnniversary) {
    const familyRepository = AppDataSource.getRepository(Family);
    const family = await familyRepository.findOne({ where: { id: member.familyId } });
    if (family) {
      if (req.body.weddingAnniversary !== undefined) {
        family.weddingAnniversary = req.body.weddingAnniversary ? new Date(req.body.weddingAnniversary) : undefined;
      }
      if (req.body.hebrewWeddingAnniversary !== undefined) {
        family.hebrewWeddingAnniversary = req.body.hebrewWeddingAnniversary;
      }
      await familyRepository.save(family);
    }
  }

  // Fetch updated member with family relation
  const updatedMember = await memberRepository.findOne({
    where: { id: member.id },
    relations: ['family']
  });

  res.json({
    message: 'Family member updated successfully',
    member: updatedMember
  });
}));

// Delete family member
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const memberRepository = AppDataSource.getRepository(FamilyMember);
  const member = await memberRepository.findOne({ where: { id: req.params.id } });

  if (!member) {
    return res.status(404).json({
      error: 'Member not found',
      message: 'The specified member does not exist.'
    });
  }

  await memberRepository.remove(member);

  res.json({
    message: 'Family member deleted successfully'
  });
}));

// Get birthdays this month
router.get('/special/birthdays-this-month', asyncHandler(async (req: AuthRequest, res: Response) => {
  const memberRepository = AppDataSource.getRepository(FamilyMember);
  const currentMonth = new Date().getMonth() + 1;

  const birthdays = await memberRepository
    .createQueryBuilder('member')
    .leftJoinAndSelect('member.family', 'family')
    .where('EXTRACT(MONTH FROM member.dateOfBirth) = :month', { month: currentMonth })
    .andWhere('member.isActive = true')
    .orderBy('EXTRACT(DAY FROM member.dateOfBirth)', 'ASC')
    .getMany();

  res.json({
    birthdays,
    month: currentMonth,
    total: birthdays.length
  });
}));

// Get yahrzeits this month
router.get('/special/yahrzeits-this-month', asyncHandler(async (req: AuthRequest, res: Response) => {
  const memberRepository = AppDataSource.getRepository(FamilyMember);
  const currentMonth = new Date().getMonth() + 1;

  const yahrzeits = await memberRepository
    .createQueryBuilder('member')
    .leftJoinAndSelect('member.family', 'family')
    .where('EXTRACT(MONTH FROM member.dateOfDeath) = :month', { month: currentMonth })
    .andWhere('member.dateOfDeath IS NOT NULL')
    .orderBy('EXTRACT(DAY FROM member.dateOfDeath)', 'ASC')
    .getMany();

  res.json({
    yahrzeits,
    month: currentMonth,
    total: yahrzeits.length
  });
}));

// Get upcoming B'nai Mitzvah
router.get('/special/upcoming-bnai-mitzvah', asyncHandler(async (req: AuthRequest, res: Response) => {
  const memberRepository = AppDataSource.getRepository(FamilyMember);
  const currentYear = new Date().getFullYear();

  const upcomingBnaiMitzvah = await memberRepository
    .createQueryBuilder('member')
    .leftJoinAndSelect('member.family', 'family')
    .where('member.dateOfBirth IS NOT NULL')
    .andWhere('member.barBatMitzvahDate IS NULL')
    .andWhere('member.isActive = true')
    .andWhere(`EXTRACT(YEAR FROM member.dateOfBirth) BETWEEN :startYear AND :endYear`, {
      startYear: currentYear - 15,
      endYear: currentYear - 11
    })
    .orderBy('member.dateOfBirth', 'ASC')
    .getMany();

  res.json({
    upcomingBnaiMitzvah,
    total: upcomingBnaiMitzvah.length
  });
}));

export { router as familyMemberRouter }; 