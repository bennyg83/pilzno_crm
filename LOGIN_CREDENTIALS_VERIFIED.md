# ✅ Login Credentials - Database Verification

**Date**: November 9, 2025  
**Status**: ✅ Verified

## Database Query Results

### User Account Details

| Field | Value |
|-------|-------|
| **Email** | `admin@pilzno.org` |
| **Role** | `super_admin` |
| **Status** | Active (`isActive: true`) |
| **First Name** | Admin |
| **Last Name** | User |
| **Created** | 2025-09-21 09:21:22 |
| **Last Login** | 2025-11-05 09:27:55 |
| **Password** | Set (hashed) ✅ |

### Verification

- ✅ **User exists** in database
- ✅ **Account is active**
- ✅ **Password is set** (stored as bcrypt hash)
- ✅ **Role**: `super_admin` (full access)

## Current Login Credentials

**Email:** `admin@pilzno.org`  
**Password:** `pilzno2024`  
**Role:** `super_admin`

### ✅ Password Verification Test

**Test Date**: November 9, 2025  
**Test Result**: ✅ **SUCCESS** - Login successful

The password `pilzno2024` was tested via API login endpoint and **confirmed working**.

## Notes

- Password is stored as a bcrypt hash in the database (cannot be read directly)
- Last successful login: November 5, 2025 at 09:27:55
- Account was created: September 21, 2025

## Password Reset (If Needed)

If you need to reset the password:

```powershell
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"
docker exec pilzno-synagogue-backend npm run ts-node backend/src/scripts/reset-password.ts YOUR_NEW_PASSWORD
```

Or with environment variable:
```powershell
$env:ADMIN_PASSWORD="your_new_password"
docker exec pilzno-synagogue-backend npm run ts-node backend/src/scripts/reset-password.ts
```

---

**Verified**: November 9, 2025  
**Database**: pilzno_synagogue  
**User Count**: 1 user

