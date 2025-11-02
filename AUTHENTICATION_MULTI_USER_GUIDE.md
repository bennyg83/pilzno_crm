# Multi-User Authentication Guide

This guide explains how the authentication system handles multiple users and multiple instances running simultaneously.

## ✅ Current Authentication System

### Architecture

The system uses **JWT (JSON Web Tokens)** for stateless authentication:

- ✅ **Stateless**: No server-side session storage
- ✅ **Scalable**: Works across multiple backend instances
- ✅ **Concurrent**: Multiple users can login simultaneously
- ✅ **Isolated**: Each user has their own independent token

### How It Works

1. **Login Process:**
   - User provides email and password
   - Backend verifies credentials against database
   - Backend generates unique JWT token (expires in 24 hours)
   - Frontend stores token in localStorage
   - Token included in all subsequent requests

2. **Token Structure:**
   ```json
   {
     "userId": "uuid",
     "email": "user@example.com",
     "role": "admin|user|staff|manager|viewer"
   }
   ```

3. **Request Validation:**
   - Each API request includes token in `Authorization: Bearer <token>` header
   - Middleware validates token and loads user from database
   - Request proceeds with authenticated user context

## 🔐 Multiple Users Support

### Concurrent Logins

**✅ YES - The system fully supports multiple users logging in simultaneously:**

- Each user gets their own unique JWT token
- Tokens are independent and don't interfere with each other
- Multiple users can access the system at the same time
- Each user's requests are validated independently

### Example Scenarios

**Scenario 1: Multiple Users, Same Time**
```
User A (admin@pilzno.org) logs in → Gets Token A
User B (staff@pilzno.org) logs in → Gets Token B
User C (user@pilzno.org) logs in → Gets Token C

All three can work simultaneously without conflict.
```

**Scenario 2: Same User, Multiple Devices**
```
User A logs in on Desktop → Gets Token A1
User A logs in on Mobile → Gets Token A2
User A logs in on Tablet → Gets Token A3

All three tokens work independently (no limit enforced).
```

## 🖥️ Multiple Instances Support

### Stateless Design

The JWT-based system is **designed for multiple backend instances**:

- ✅ **Shared Secret**: All instances use the same `JWT_SECRET`
- ✅ **No Shared State**: No session storage needed
- ✅ **Database Validation**: Each request validates token and loads user from database
- ✅ **Load Balancer Ready**: Can run behind load balancers

### Configuration

**Environment Variable:**
```bash
JWT_SECRET=pilzno_synagogue_jwt_secret_key_2024
```

**Critical:** All backend instances MUST share the same `JWT_SECRET` for tokens to work across instances.

### Multi-Instance Setup

**Option 1: Docker Compose Scale**
```yaml
services:
  pilzno-synagogue-backend:
    # ... configuration ...
    deploy:
      replicas: 3  # Run 3 instances
```

**Option 2: Manual Multiple Instances**
```bash
# Instance 1
docker run -e JWT_SECRET=shared_secret -p 3002:3001 backend

# Instance 2
docker run -e JWT_SECRET=shared_secret -p 3003:3001 backend

# Instance 3
docker run -e JWT_SECRET=shared_secret -p 3004:3001 backend
```

**Load Balancer Configuration:**
```
Frontend → Load Balancer → Backend Instances
                          ├─ Instance 1 (port 3002)
                          ├─ Instance 2 (port 3003)
                          └─ Instance 3 (port 3004)
```

## 🔒 Security Features

### Current Security

- ✅ **Password Hashing**: bcrypt with 12 salt rounds
- ✅ **Token Expiration**: 24-hour token lifetime
- ✅ **Role-Based Access**: Different roles (admin, staff, user, viewer)
- ✅ **Active User Check**: Only active users can login
- ✅ **Token Validation**: Every request validates token

### User Roles

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',  // Full access
  ADMIN = 'admin',              // Administrative access
  MANAGER = 'manager',          // Management access
  USER = 'user',                // Standard user
  VIEWER = 'viewer'             // Read-only access
}
```

### Permission System

Users have granular permissions:
- View/Create/Edit/Delete Families
- View/Create/Edit/Delete Members
- Financial Management (Pledges, Donations)
- System Settings Management
- Email Management
- Reports and Analytics

## 📊 Session Management

### Current Implementation

**Stateless Sessions:**
- No server-side session storage
- Token contains user information
- User loaded from database on each request
- `lastLoginAt` field exists but not updated (enhancement needed)

### Token Lifecycle

1. **Creation**: Token generated on successful login
2. **Storage**: Frontend stores in localStorage
3. **Usage**: Included in every API request
4. **Validation**: Backend validates on each request
5. **Expiration**: Token expires after 24 hours
6. **Refresh**: User must login again after expiration

### Logout

**Current Implementation:**
- Frontend removes token from localStorage
- Token remains valid until expiration (stateless design)
- No token blacklisting (enhancement for added security)

## 🚀 Enhancements Needed

### 1. Track Last Login

**Status**: ⚠️ Field exists but not updated

**Enhancement**: Update `lastLoginAt` on successful login

### 2. Session Tracking (Optional)

**Use Case**: Track active sessions for security

**Options:**
- **Option A**: Continue stateless (current - simpler, scalable)
- **Option B**: Add session table (more control, requires shared storage)

### 3. Token Revocation (Optional)

**Use Case**: Force logout/invalidate tokens

**Options:**
- Token blacklist table
- Redis for token blacklisting
- Or keep stateless and rely on expiration

### 4. Concurrent Session Limits (Optional)

**Use Case**: Limit number of active sessions per user

**Implementation**: Track active tokens in database

## 📝 Code Examples

### Login Endpoint

```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Authenticated Request

```typescript
GET /api/families
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "families": [...],
  "count": 10
}
```

## 🧪 Testing Multi-User Scenarios

### Test Multiple Users

```bash
# User 1 login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"pass123"}'

# User 2 login (simultaneous)
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"pass456"}'

# Both can make requests simultaneously
```

### Test Multiple Instances

```bash
# Backend Instance 1
docker run -p 3002:3001 -e JWT_SECRET=shared_secret backend

# Backend Instance 2
docker run -p 3003:3001 -e JWT_SECRET=shared_secret backend

# Login on Instance 1
TOKEN=$(curl -X POST http://localhost:3002/api/auth/login ...)

# Use token on Instance 2 (should work!)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/families
```

## ⚠️ Important Notes

### JWT Secret Security

**CRITICAL**: All instances must share the same `JWT_SECRET`:
- ✅ Same secret = tokens work across all instances
- ❌ Different secrets = tokens won't work across instances

### Database Connection

**IMPORTANT**: All instances must connect to the same database:
- Same PostgreSQL database
- Same connection credentials
- Shared user data

### Token Expiration

- Tokens expire after 24 hours
- No automatic refresh (user must login again)
- Expired tokens are rejected immediately

## 🔧 Configuration

### Environment Variables

```bash
# Required for all instances
JWT_SECRET=pilzno_synagogue_jwt_secret_key_2024
DATABASE_URL=postgresql://user:pass@db:5432/pilzno_synagogue
DB_HOST=pilzno-synagogue-db
DB_PORT=5432
DB_USER=synagogue_admin
DB_PASSWORD=synagogue_secure_pass
DB_NAME=pilzno_synagogue

# Optional
PORT=3001
CORS_ORIGIN=http://localhost:3003
NODE_ENV=development
```

---

**Last Updated**: November 2, 2025  
**Maintained by**: Pilzno CRM Development Team

