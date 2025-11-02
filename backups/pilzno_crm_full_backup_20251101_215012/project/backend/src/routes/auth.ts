import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { asyncHandler } from '../middleware/error-handler';
import { validate } from 'class-validator';

const router = express.Router();

// Register new user
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role = 'user' } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email, password, first name, and last name are required.'
    });
  }

  const userRepository = AppDataSource.getRepository(User);

  // Check if user already exists
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({
      error: 'User already exists',
      message: 'A user with this email address already exists.'
    });
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create new user
  const user = new User();
  user.email = email;
  user.password = hashedPassword;
  user.firstName = firstName;
  user.lastName = lastName;
  user.role = role;

  // Validate user entity
  const errors = await validate(user);
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'User data validation failed.',
      details: errors
    });
  }

  await userRepository.save(user);

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET || 'pilzno_synagogue_jwt_secret_key_2024';
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    token
  });
}));

// Login user
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  console.log('🔐 Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('❌ Missing credentials');
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Email and password are required.'
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  console.log('🔍 Looking up user:', email);
  
  const user = await userRepository.findOne({ 
    where: { email, isActive: true } 
  });

  if (!user) {
    console.log('❌ User not found or not active:', email);
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Invalid email or password.'
    });
  }
  
  console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });

  // Verify password
  console.log('🔐 Verifying password for user:', email);
  console.log('   Stored hash:', user.password);
  console.log('   Input password:', password);
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log('   Password valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    console.log('❌ Password verification failed');
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Invalid email or password.'
    });
  }
  
  console.log('✅ Password verified successfully');

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET || 'pilzno_synagogue_jwt_secret_key_2024';
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    token
  });
}));

// Verify token (protected route for checking if token is still valid)
router.get('/verify', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide a valid authorization token.'
    });
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET || 'pilzno_synagogue_jwt_secret_key_2024';

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId, isActive: true }
    });

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token was not found.'
      });
    }

    res.json({
      message: 'Token is valid',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid or expired.'
    });
  }
}));

export { router as authRouter }; 