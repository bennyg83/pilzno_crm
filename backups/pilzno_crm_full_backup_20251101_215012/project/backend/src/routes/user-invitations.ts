import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { UserInvitation } from '../entities/UserInvitation';
import { asyncHandler } from '../middleware/error-handler';

const router = express.Router();

// Get all user invitations
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userInvitationRepository = AppDataSource.getRepository(UserInvitation);
  const invitations = await userInvitationRepository.find({
    order: { createdAt: 'DESC' }
  });
  
  res.json(invitations);
}));

// Get user invitation by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userInvitationRepository = AppDataSource.getRepository(UserInvitation);
  
  const invitation = await userInvitationRepository.findOne({ where: { id } });
  if (!invitation) {
    return res.status(404).json({
      error: 'Invitation not found',
      message: 'User invitation not found.'
    });
  }
  
  res.json(invitation);
}));

// Create new user invitation
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { email, role, invitedBy, expiresAt } = req.body;
  
  if (!email || !role) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email and role are required.'
    });
  }

  // Get the authenticated user's ID as the inviter if not provided
  const currentUser = (req as any).user;
  const inviterId = invitedBy || currentUser?.id;
  
  if (!inviterId) {
    return res.status(400).json({
      error: 'Missing inviter',
      message: 'Could not determine who is sending the invitation.'
    });
  }
  
  const userInvitationRepository = AppDataSource.getRepository(UserInvitation);
  
  // Check if invitation already exists for this email
  const existingInvitation = await userInvitationRepository.findOne({ 
    where: { email, isAccepted: false } 
  });
  
  if (existingInvitation && !existingInvitation.isExpired()) {
    return res.status(409).json({
      error: 'Invitation already exists',
      message: 'An active invitation already exists for this email.'
    });
  }
  
  const invitation = new UserInvitation();
  invitation.email = email;
  invitation.firstName = req.body.firstName || '';
  invitation.lastName = req.body.lastName || '';
  invitation.role = role;
  invitation.invitedBy = inviterId;
  invitation.invitedAt = new Date();
  invitation.expiresAt = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
  
  const savedInvitation = await userInvitationRepository.save(invitation);
  
  res.status(201).json(savedInvitation);
}));

// Update user invitation
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, firstName, lastName, role, expiresAt } = req.body;
  
  const userInvitationRepository = AppDataSource.getRepository(UserInvitation);
  
  const invitation = await userInvitationRepository.findOne({ where: { id } });
  if (!invitation) {
    return res.status(404).json({
      error: 'Invitation not found',
      message: 'User invitation not found.'
    });
  }
  
  if (email !== undefined) invitation.email = email;
  if (firstName !== undefined) invitation.firstName = firstName;
  if (lastName !== undefined) invitation.lastName = lastName;
  if (role !== undefined) invitation.role = role;
  if (expiresAt !== undefined) invitation.expiresAt = expiresAt;
  
  const updatedInvitation = await userInvitationRepository.save(invitation);
  
  res.json(updatedInvitation);
}));

// Delete user invitation
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userInvitationRepository = AppDataSource.getRepository(UserInvitation);
  
  const invitation = await userInvitationRepository.findOne({ where: { id } });
  if (!invitation) {
    return res.status(404).json({
      error: 'Invitation not found',
      message: 'User invitation not found.'
    });
  }
  
  await userInvitationRepository.remove(invitation);
  
  res.json({ message: 'User invitation deleted successfully' });
}));

// Resend invitation
router.post('/:id/resend', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userInvitationRepository = AppDataSource.getRepository(UserInvitation);
  
  const invitation = await userInvitationRepository.findOne({ where: { id } });
  if (!invitation) {
    return res.status(404).json({
      error: 'Invitation not found',
      message: 'User invitation not found.'
    });
  }
  
  // Update expiration date and reset status
  invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  invitation.invitedAt = new Date();
  
  const updatedInvitation = await userInvitationRepository.save(invitation);
  
  res.json({
    message: 'Invitation resent successfully',
    invitation: updatedInvitation
  });
}));

export { router as userInvitationsRouter };
