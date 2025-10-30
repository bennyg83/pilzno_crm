# Environment Variables Configuration

This document describes the environment variables used in the Pilzno Synagogue Management System.

## Development Environment

For development, the default values in `docker-compose.yml` are sufficient. No additional configuration needed.

## Production Environment

For production deployments, create a `.env` file in the project root with the following variables:

### Database Configuration
```bash
# Database password - CHANGE THIS for production
DB_PASSWORD=your_secure_database_password_here

# Database port (external)
DB_PORT=5433
```

### Backend Configuration
```bash
# JWT Secret for authentication - MUST BE CHANGED for production
# Generate with: openssl rand -base64 64
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random

# Backend port
BACKEND_PORT=3001
```

### Frontend Configuration
```bash
# API base URL for frontend
API_BASE_URL=http://localhost:3001

# Frontend port
FRONTEND_PORT=3000
```

### Optional Configuration

#### Email Configuration (Future Implementation)
```bash
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

#### Monitoring and Logging
```bash
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn-for-error-tracking
```

#### Production Security
```bash
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Example .env File

```bash
# Pilzno Synagogue Management System - Production Environment
DB_PASSWORD=SuperSecureDbPassword123!
JWT_SECRET=veryLongAndRandomJWTSecretKeyForProductionUseThatShouldBeAtLeast64Characters
API_BASE_URL=https://api.pilzno-synagogue.org
FRONTEND_PORT=3000
BACKEND_PORT=3001
```

## Security Notes

1. **Never commit the `.env` file** to version control
2. **Generate unique passwords** for each environment
3. **Use strong JWT secrets** (at least 64 characters)
4. **Regularly rotate secrets** in production
5. **Use HTTPS** in production environments

## Loading Environment Variables

Environment variables are automatically loaded by Docker Compose when using:
- `docker-compose -f docker-compose.prod.yml up -d` (production)
- `docker-compose --profile dev up -d` (development) 