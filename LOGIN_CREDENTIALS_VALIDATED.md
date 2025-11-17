# ✅ Login Credentials Validation

**Date**: December 16, 2024  
**Status**: ✅ **VALIDATED - Login Successful**

## Database Verification

### User Account Status

| Field | Value |
|-------|-------|
| **Email** | `admin@pilzno.org` |
| **Role** | `super_admin` |
| **Status** | Active (`isActive: true`) |
| **First Name** | Admin |
| **Last Name** | User |
| **Created** | 2025-09-21 09:21:22 |
| **Last Login** | 2025-11-09 13:43:58 |

### Verification Results

- ✅ **User exists** in database
- ✅ **Account is active** (`isActive: true`)
- ✅ **Password is set** (stored as bcrypt hash)
- ✅ **Role**: `super_admin` (full access)

## Login Credentials

**Email:** `admin@pilzno.org`  
**Password:** `pilzno2024`  
**Role:** `super_admin`

## API Login Test

**Test Date**: December 16, 2024  
**Test Result**: ✅ **SUCCESS** - Login successful

**API Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "684d900e-0c51-4f7d-86b4-20b1304d9cb3",
    "email": "admin@pilzno.org",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## How to Use

### Local Development

1. **Start the backend:**
   ```powershell
   cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"
   docker-compose up -d
   ```

2. **Access the frontend:**
   - Local: http://localhost:3003
   - Or run frontend dev server: `cd frontend && npm run dev`

3. **Login with:**
   - Email: `admin@pilzno.org`
   - Password: `pilzno2024`

### Production (GitHub Pages)

1. **Access:** https://bennyg83.github.io/pilzno_crm
2. **Login with:**
   - Email: `admin@pilzno.org`
   - Password: `pilzno2024`

## Password Reset (If Needed)

If you need to reset the password:

```powershell
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"

# Set new password
$env:ADMIN_PASSWORD="your_new_password"

# Reset password
docker exec pilzno-synagogue-backend npm run ts-node backend/src/scripts/reset-password.ts
```

Or pass password as argument:
```powershell
docker exec pilzno-synagogue-backend npm run ts-node backend/src/scripts/reset-password.ts your_new_password
```

## Security Notes

- Password is stored as a bcrypt hash in the database (cannot be read directly)
- JWT tokens expire after 24 hours
- Last successful login: November 9, 2025 at 13:43:58
- Account was created: September 21, 2025

---

**Validated**: December 16, 2024  
**Database**: pilzno_synagogue  
**Backend**: http://localhost:3002  
**Status**: ✅ Working

