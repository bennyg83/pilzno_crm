import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { asyncHandler } from '../middleware/error-handler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get current user profile
router.get('/profile', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  
  res.json({
    id: user?.id,
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: user?.role,
    isActive: user?.isActive,
    isFirstLogin: user?.isFirstLogin,
    createdAt: user?.createdAt
  });
}));

// Update user profile
router.put('/profile', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  await userRepository.save(user);

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
}));

// Create new user (admin only)
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUser = req.user;
  
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { email, password, firstName, lastName, role = 'user', permissions = [] } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'Email, password, firstName, and lastName are required.'
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  
  // Check if user already exists
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ 
      error: 'User already exists',
      message: 'A user with this email already exists.'
    });
  }

  // Create new user
  const user = new User();
  user.email = email;
  user.password = password; // Will be hashed by the entity
  user.firstName = firstName;
  user.lastName = lastName;
  user.role = role;
  user.permissions = permissions;
  user.isActive = true;
  user.isFirstLogin = true; // Mark as first login so they can change password

  const savedUser = await userRepository.save(user);

  // Return user without password
  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt
    }
  });
}));

// Update user (admin only)
router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUser = req.user;
  const { id } = req.params;
  
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { email, password, firstName, lastName, role, permissions, isActive } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'Email, firstName, and lastName are required.'
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id } });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if email is being changed and if it conflicts with another user
  if (email !== user.email) {
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already exists',
        message: 'A user with this email already exists.'
      });
    }
  }

  // Update user fields
  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;
  user.role = role || user.role;
  user.permissions = permissions || user.permissions;
  user.isActive = isActive !== undefined ? isActive : user.isActive;
  
  // Only update password if provided
  if (password && password.trim() !== '') {
    user.password = password; // Will be hashed by the entity
  }

  const updatedUser = await userRepository.save(user);

  res.json({
    message: 'User updated successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    }
  });
}));

// Get all users (admin only)
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUser = req.user;
  
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find({
    select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'isFirstLogin', 'createdAt']
  });

  res.json({ users });
}));

// Delete user (admin only)
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUser = req.user;
  const { id } = req.params;
  
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (currentUser.id === id) {
    return res.status(400).json({ 
      error: 'Cannot delete self',
      message: 'You cannot delete your own account.'
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id } });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  await userRepository.remove(user);

  res.json({ message: 'User deleted successfully' });
}));

// Change password (for first login or regular password change)
router.put('/change-password', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'Current password and new password are required.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      error: 'Invalid password',
      message: 'New password must be at least 6 characters long.'
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({ 
      error: 'Invalid password',
      message: 'Current password is incorrect.'
    });
  }

  // Update password and mark as not first login
  user.password = newPassword; // Will be hashed by the entity
  user.isFirstLogin = false;

  await userRepository.save(user);

  res.json({
    message: 'Password changed successfully',
    isFirstLogin: false
  });
}));

export { router as userRouter }; 