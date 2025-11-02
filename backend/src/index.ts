import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import { authRouter } from './routes/auth';
import { familyRouter } from './routes/families';
import { familyMemberRouter } from './routes/family-members';
import { userRouter } from './routes/users';
import pledgeRouter from './routes/pledges';
import additionalDatesRouter from './routes/additional-dates';
import { emailTemplatesRouter } from './routes/email-templates';
import { userInvitationsRouter } from './routes/user-invitations';
import { systemSettingsRouter } from './routes/system-settings';
import { errorHandler } from './middleware/error-handler';
import { authenticate } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Basic request logging at the very beginning
app.use((req, res, next) => {
  console.log(`🚀 [${new Date().toISOString()}] REQUEST RECEIVED: ${req.method} ${req.originalUrl}`);
  next();
});

// Security middleware
app.use(helmet());
// CORS configuration - allows local development and GitHub Pages
// Supports Tailscale URLs via environment variable
const allowedOrigins = [
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://localhost:3000',
  'https://bennyg83.github.io',
  ...(process.env.TAILSCALE_URL ? [process.env.TAILSCALE_URL.replace(/\/$/, '')] : []),
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log(`🚫 CORS blocked origin: ${origin}`);
    console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing - must come before debug middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(`   Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Pilzno Synagogue Management System API',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (no authentication required)
app.use('/api/auth', authRouter);

// Protected routes (authentication required)
app.use('/api/users', authenticate, userRouter);
app.use('/api/families', authenticate, familyRouter);
app.use('/api/family-members', authenticate, familyMemberRouter);
app.use('/api/pledges', authenticate, pledgeRouter);
app.use('/api/additional-dates', additionalDatesRouter);
app.use('/api/email-templates', authenticate, emailTemplatesRouter);
app.use('/api/user-invitations', authenticate, userInvitationsRouter);
app.use('/api/system-settings', authenticate, systemSettingsRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Pilzno Synagogue Management System API running on port ${PORT}`);
      console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
      console.log(`🌐 External access available at: http://0.0.0.0:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 