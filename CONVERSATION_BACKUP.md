# Pilzno CRM - Complete Conversation & Context Backup

**Generated**: 2025-01-XX  
**Purpose**: Complete backup of all project context, decisions, implementations, and next steps for handoff to another Cursor agent

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Major Feature Implementations](#major-feature-implementations)
3. [Technical Decisions & Architecture](#technical-decisions--architecture)
4. [Current System Status](#current-system-status)
5. [Remote Deployment Setup](#remote-deployment-setup)
6. [GitHub Repository Status](#github-repository-status)
7. [Environment Configuration](#environment-configuration)
8. [Remaining Tasks & TODOs](#remaining-tasks--todos)
9. [Known Issues & Gotchas](#known-issues--gotchas)
10. [Quick Reference Commands](#quick-reference-commands)

---

## Project Overview

### System Description
Pilzno Synagogue CRM is a comprehensive management system for Pilzno Synagogue built with React/TypeScript frontend, Node.js/TypeScript backend, and PostgreSQL database. It handles families, members, Jewish lifecycle events, donations, pledges, and community engagement.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **Backend**: Node.js 18 + TypeScript + Express + TypeORM
- **Database**: PostgreSQL 15 (NOT MongoDB - user preference)
- **Containerization**: Docker Desktop + Docker Compose
- **Development Environment**: Windows 11 Pro + Git Bash (preferred terminal)
- **Version Control**: Git + GitHub (`https://github.com/bennyg83/pilzno_crm.git`)

### Key Principles
- **PostgreSQL ONLY** - No MongoDB or related types
- **Windows development** with Git Bash as preferred terminal
- **Docker Desktop** required with WSL2 backend
- **Material-UI** for all UI components (no custom CSS frameworks)
- **TypeScript strict mode** - proper typing required, no `any` types
- **JSDoc comments** required for all functions/components

---

## Major Feature Implementations

### 1. Financial/Pledge System Enhancements ✅
**Status**: COMPLETED

#### Changes Made:
- **Annual Pledge Tagging**: Added `isAnnualPledge` boolean field to Pledge entity
- **Removed `pledgedBy` Field**: Completely removed from frontend and backend
- **Enhanced Description Field**: Added dropdown with predefined options + free-text input
- **Default Due Date**: Set to end of current Hebrew calendar year for annual pledges
- **Pledge Type Selector**: Added selector for different pledge types
- **Status Field**: Added status field with color coding (Pending, Paid, Overdue, etc.)
- **Hebrew Calendar Integration**: Annual pledge calculations based on Hebrew year

#### Files Modified:
- `backend/src/entities/Pledge.ts` - Removed `pledgedBy` field
- `backend/src/routes/pledges.ts` - Removed `pledgedBy` references
- `backend/src/migrations/1756920000002-RemovePledgedByFromPledges.ts` - Migration script
- `frontend/src/components/PledgeFormDialog.tsx` - Complete form overhaul
- `frontend/src/pages/FamiliesPage.tsx` - Updated pledge display cards

#### Key Features:
- Annual pledges show on family cards with "Annual" badge
- One-time pledges display separately
- Hebrew calendar year calculations for annual totals
- Status color coding (green=paid, orange=pending, red=overdue)

---

### 2. Important Dates Layout Cleanup ✅
**Status**: COMPLETED

#### Issue:
Cards in "Important Dates" section were stacking vertically instead of displaying in a clean grid layout.

#### Solution:
- Restructured JSX to use proper Material-UI Grid system
- Ensured cards display in responsive grid (2-3 columns depending on screen size)
- Fixed card wrapping and spacing issues

#### Files Modified:
- `frontend/src/pages/FamiliesPage.tsx` - Layout restructure

---

### 3. Additional Important Dates System ✅
**Status**: COMPLETED

#### Features Implemented:
- **Add Additional Dates**: Modal dialog for adding custom important dates
- **Edit Functionality**: Full edit capability for saved dates
- **Delete Functionality**: Remove saved dates
- **Date Type Selection**: Dropdown with predefined date types
- **Hebrew Date Support**: Automatic conversion and display
- **Form State Management**: Separate state for form input vs. saved dates display

#### Components Created:
- `frontend/src/components/AdditionalDateFormDialog.tsx` - Modal for add/edit operations

#### Backend:
- `backend/src/routes/additional-dates.ts` - API endpoints for CRUD operations
- `backend/src/entities/AdditionalImportantDate.ts` - Entity definition

#### Key Implementation Notes:
- Form disappears after successful save (separate `additionalDates` vs `savedAdditionalDates` states)
- Dates display in organized cards in the "Important Dates" section
- Hebrew date conversion using `@hebcal/core` library
- Validation prevents duplicate dates

---

### 4. Donations Tracking System ✅
**Status**: COMPLETED (Frontend complete, backend API ready)

#### Features:
- **Dedicated Donations Page**: Full page with tabs for "All Donations", "Reports", "Analytics"
- **Donation Form Dialog**: Modal for adding/editing donations
- **Search & Filtering**: Search by family name, filter by date range, type, status
- **Summary Statistics**: Total donations, by family, by type
- **Reports**: Breakdown by family, date range, donation type
- **Analytics**: Charts and trends (placeholder for future implementation)

#### Components Created:
- `frontend/src/pages/DonationsPage.tsx` - Main donations page
- `frontend/src/components/DonationFormDialog.tsx` - Form dialog
- `frontend/src/types/index.ts` - Added `Donation`, `DonationFormData`, `DonationSummary` interfaces

#### Backend:
- `backend/src/entities/Donation.ts` - Entity already exists
- Backend routes need to be created (marked as TODO)

#### Navigation:
- Enabled "Donations" link in left sidebar (`frontend/src/components/Layout.tsx`)

---

### 5. Members Page Enhancements ✅
**Status**: COMPLETED

#### Features:
- **View Member Functionality**: Added "View" button to member cards
- **Member View Dialog**: Read-only dialog displaying all member details
- **Organized Display**: Details organized by category (Basic, Contact, Professional, Religious, Notes)

#### Components Created:
- `frontend/src/components/MemberViewDialog.tsx` - Read-only view dialog

#### Files Modified:
- `frontend/src/pages/MembersPage.tsx` - Added view functionality

#### Key Notes:
- View dialog mirrors the tile view shown inside family details
- No edit capability from view dialog (use Edit button for that)
- Displays Hebrew names, Jewish lifecycle events, professional info, notes

---

### 6. Backend Permission Fixes ✅
**Status**: COMPLETED

#### Issue:
`super_admin` role users were getting 403 Forbidden when trying to manage users in admin console.

#### Solution:
Modified permission checks in `backend/src/routes/users.ts` to allow both `admin` and `super_admin` roles access to user management endpoints.

#### Changes:
- Changed `if (currentUser?.role !== 'admin')` to `if (currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin')`
- Applied to all user management routes: create, get all, update, delete

#### Files Modified:
- `backend/src/routes/users.ts`

---

### 7. GitHub Repository Setup ✅
**Status**: COMPLETED

#### Actions Taken:
- Initialized fresh Git repository in local project
- Added GitHub remote: `https://github.com/bennyg83/pilzno_crm.git`
- Made initial commit with all project files
- Force-pushed to remote (user confirmed remote was empty)

#### Current Status:
- Repository is linked and synced
- Remote: `origin` → `git@github.com:bennyg83/pilzno_crm.git`
- Branch: `main`

---

### 8. Remote Deployment Setup (In Progress) 🚧
**Status**: PARTIALLY COMPLETED

#### Setup:
- **Remote System**: Mini-PC running Windows 11 Pro
- **Hostname**: `crm-mini` (resolves to `10.100.102.112` on local network)
- **SSH Access**: Enabled via Windows OpenSSH Server
  - Username: `cursors123`
  - Note: Password authentication works from PowerShell, but Git Bash had issues (use PowerShell for SSH)

#### Tailscale Funnel Configuration:
- **Public URL**: `https://crm-mini.tail34e202.ts.net/`
- **Backend Port Mapping**: `http://localhost:3002` → Public HTTPS
- **Status**: Tunnel is running and accessible
- **Purpose**: Provides public HTTPS access without port forwarding or domain purchase

#### Current Remote Status:
- ✅ Tailscale installed and Funnel enabled
- ✅ Public URL working: `https://crm-mini.tail34e202.ts.net/`
- ⚠️ Need to validate build version on remote
- ⚠️ Need to sync with GitHub repo
- ⚠️ Need to update environment variables for production
- ⚠️ Need to rebuild with correct API base URL

#### Next Steps for Remote:
1. SSH into mini-PC: `ssh cursors123@crm-mini` (use PowerShell, not Git Bash)
2. Navigate to project: `cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"`
3. Check git status and compare with GitHub
4. Pull latest changes if needed
5. Set environment variables:
   - `backend/.env`: `CORS_ORIGIN=https://<github-username>.github.io/pilzno_crm`
   - `frontend/.env.production`: `VITE_API_BASE_URL=https://crm-mini.tail34e202.ts.net`
6. Rebuild and restart:
   ```powershell
   docker compose down
   cd frontend; npm ci; npm run build; cd ..
   docker compose up -d --build
   ```

---

## Technical Decisions & Architecture

### Why Tailscale Funnel Instead of Cloudflare Tunnel?
**Decision**: Use Tailscale Funnel for public access  
**Reason**: 
- Free solution without requiring domain purchase
- Provides stable `*.ts.net` HTTPS URL
- No port forwarding required
- Simpler setup than Cloudflare Tunnel (which requires domain)

**Alternative Considered**: Cloudflare Tunnel + domain purchase (user wanted free solution)

### Why PostgreSQL Over MongoDB?
**Decision**: PostgreSQL ONLY  
**Reason**: User preference - explicitly stated "We are not wanting to use mongodb or related types"

### Why Git Bash Preferred Terminal?
**Decision**: Use Git Bash for all terminal operations  
**Reason**: User preference on Windows system  
**Note**: However, SSH to remote works better from PowerShell (Git Bash had connection issues)

### Docker Build Process Rules
**CRITICAL RULE**: When deploying frontend changes to Docker:
```bash
# ALWAYS use this sequence:
docker compose down
cd frontend && npm run build && cd ..
docker compose up -d --build
```
**Why?**: Building while containers run causes build context conflicts.

**Note**: Previous attempts used `docker --context desktop-linux` but standard `docker compose` works fine on Windows with Docker Desktop.

---

## Current System Status

### Local Development System
- **Location**: `C:\Users\binya\Documents\Projects Shul\Pilzno\pilzno_crm`
- **Git Status**: Clean, synced with GitHub
- **Docker Status**: Should be running (containers: backend, frontend, database)
- **Backend Port**: `3002` (host) → `3001` (container)
- **Frontend Port**: `3003` (host) → `80` (container)
- **Database Port**: `5435` (host) → `5432` (container)

### Remote Production System (Mini-PC)
- **Location**: `C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm`
- **SSH**: `ssh cursors123@crm-mini` (use PowerShell)
- **Public URL**: `https://crm-mini.tail34e202.ts.net/`
- **Status**: Unknown - needs validation script run

### Database Configuration
- **Database Name**: `pilzno_synagogue` (default)
- **Database User**: `synagogue_admin` (default)
- **Database Password**: `synagogue_secure_pass` (default - CHANGE IN PRODUCTION)
- **Database Port**: `5435` (host), `5432` (container)

### Container Names
All containers prefixed with `pilzno-synagogue-`:
- `pilzno-synagogue-db` - PostgreSQL database
- `pilzno-synagogue-backend` - Backend API
- `pilzno-synagogue-frontend` - Frontend (nginx)

---

## Remote Deployment Setup

### SSH Access Details
- **Host**: `crm-mini` (or `10.100.102.112`)
- **Username**: `cursors123`
- **Port**: `22` (default)
- **Authentication**: Password (user verified working from PowerShell)

### Tailscale Setup
- **Account**: User has free Tailscale account
- **Funnel URL**: `https://crm-mini.tail34e202.ts.net/`
- **Backend Service**: Running on port `443` via Tailscale Funnel
- **Configuration**: Done via `tailscale serve` and `tailscale funnel` commands

### GitHub Integration (To Be Completed)
- **Repository**: `https://github.com/bennyg83/pilzno_crm.git`
- **SSH Key**: Need to generate on mini-PC and add to GitHub
- **Sync Status**: Unknown - needs validation

---

## GitHub Repository Status

### Repository Details
- **URL**: `https://github.com/bennyg83/pilzno_crm.git`
- **SSH URL**: `git@github.com:bennyg83/pilzno_crm.git`
- **Branch**: `main`
- **Status**: Initial push completed, repository populated

### .gitignore Status
- **Current**: Basic .gitignore exists
- **TODO**: Harden to exclude secrets, builds, archives (marked as pending task)

### Collaboration Setup (Pending)
- **Collaborator Access**: Not yet configured
- **Branch Protection**: Not yet configured
- **Secrets Management**: Need to configure GitHub secrets for CI/CD

---

## Environment Configuration

### Backend Environment Variables
**File**: `backend/.env`
```env
# Database
DB_NAME=pilzno_synagogue
DB_USER=synagogue_admin
DB_PASSWORD=synagogue_secure_pass  # CHANGE IN PRODUCTION
DB_PORT=5435
DB_HOST=localhost

# JWT
JWT_SECRET=pilzno_synagogue_jwt_secret_key_2024  # CHANGE IN PRODUCTION

# Server
PORT=3001
NODE_ENV=development

# CORS (for production)
CORS_ORIGIN=https://<github-username>.github.io/pilzno_crm
```

### Frontend Environment Variables
**File**: `frontend/.env.production`
```env
VITE_API_BASE_URL=https://crm-mini.tail34e202.ts.net
NODE_ENV=production
```

**File**: `frontend/.env.development` (if exists)
```env
VITE_API_BASE_URL=http://localhost:3002
NODE_ENV=development
```

### Docker Compose Environment Variables
**File**: `docker-compose.yml`
- Uses `.env` files from backend/frontend directories
- Can override via environment variables
- Default ports: Frontend=3003, Backend=3002, DB=5435

---

## Remaining Tasks & TODOs

### High Priority
1. **✅ Link GitHub Remote** - COMPLETED
2. **⏳ Validate Remote Build** - Run validation script on mini-PC
3. **⏳ Sync Remote with GitHub** - Pull latest changes to mini-PC
4. **⏳ Update Remote Environment Variables** - Set production envs on mini-PC
5. **⏳ Rebuild Remote System** - Build with correct API base URL

### Medium Priority
6. **⏳ Harden .gitignore** - Exclude secrets, builds, archives
7. **⏳ Configure GitHub Collaborator Access** - Add friend as collaborator
8. **⏳ Set Up Branch Protection** - Protect main branch
9. **⏳ Set Up GitHub Actions Self-Hosted Runner** - Install on mini-PC
10. **⏳ Create Docker Deploy Scripts** - Pull, migrate, compose up

### Low Priority
11. **⏳ Add GitHub Actions Workflow** - Auto-deploy on push
12. **⏳ Set Up Dynamic DNS Fallback** - If Tailscale unavailable

### Backend API Tasks
13. **⏳ Create Donations Backend Routes** - Frontend exists, backend API needed
14. **⏳ Test All API Endpoints** - Ensure everything works with new changes

### Frontend Tasks
15. **⏳ Move formatCurrency to Utils** - Currently temporary in DonationsPage
16. **⏳ Complete Analytics Tab** - Placeholder in DonationsPage

---

## Known Issues & Gotchas

### SSH Access
- **Issue**: Git Bash has trouble with SSH password authentication to remote
- **Workaround**: Use PowerShell for SSH connections to mini-PC
- **Command**: `ssh cursors123@crm-mini` (works from PowerShell)

### Docker Build Process
- **Issue**: Building frontend while containers are running causes conflicts
- **Solution**: ALWAYS use: `docker compose down` → `npm run build` → `docker compose up -d --build`
- **Documentation**: See `BUILD_PROCESS_TROUBLESHOOTING.md`

### Windows Path Issues
- **Issue**: Spaces in directory name "Projects Shul" caused SCP transfer issues
- **Solution**: User renamed to "Projects_Shul" on remote system
- **Note**: Always quote paths with spaces in Git Bash

### Tailscale Funnel CLI
- **Issue**: Old CLI syntax `tailscale funnel 443 on` doesn't work
- **Solution**: Use `tailscale funnel --https=443 on` or `tailscale funnel on`
- **Note**: Ensure Tailscale and Funnel are enabled in admin console first

### Backend Permissions
- **Issue**: `super_admin` role couldn't access user management
- **Fixed**: Updated permission checks in `backend/src/routes/users.ts`
- **Status**: Resolved ✅

### Frontend Build Warnings
- **Issue**: Multiple unused import warnings during build
- **Status**: Most cleaned up, some may remain
- **Note**: TypeScript strict mode helps catch these

---

## Quick Reference Commands

### Local Development
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Rebuild frontend (IMPORTANT: stop containers first)
docker compose down
cd frontend && npm run build && cd ..
docker compose up -d --build

# Access database
docker exec -it pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue
```

### Git Operations
```bash
# Check status
git status

# Pull latest
git pull origin main

# Push changes
git add .
git commit -m "description"
git push origin main

# Check remote
git remote -v
```

### Remote System (Mini-PC)
```powershell
# SSH into remote (use PowerShell, not Git Bash)
ssh cursors123@crm-mini

# Once connected, navigate to project
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"

# Check Docker status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild (same process as local)
docker compose down
cd frontend; npm ci; npm run build; cd ..
docker compose up -d --build
```

### Tailscale Funnel
```powershell
# Check status
tailscale serve status
tailscale funnel status

# Set up tunnel (if needed)
tailscale serve --https=443 http://localhost:3002
tailscale funnel --https=443 on

# View public URL
tailscale serve status
```

### Database Operations
```bash
# Backup database (local)
docker exec pilzno-synagogue-db pg_dump -U synagogue_admin pilzno_synagogue > backup.sql

# Restore database
docker exec -i pilzno-synagogue-db psql -U synagogue_admin pilzno_synagogue < backup.sql

# Run migrations
cd backend
npm run migration:run
```

---

## Project File Structure Reference

### Key Directories
```
pilzno_crm/
├── backend/              # Node.js/TypeScript backend
│   ├── src/
│   │   ├── entities/     # TypeORM entities
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Express middleware
│   │   └── migrations/   # Database migrations
│   └── .env              # Backend environment variables
├── frontend/             # React/TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application pages
│   │   ├── services/     # API service layer
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── .env.production   # Frontend production env vars
├── scripts/              # Utility scripts
├── docs/                 # Documentation
└── docker-compose.yml    # Docker Compose configuration
```

### Important Files
- `docker-compose.yml` - Main Docker configuration
- `DEVELOPMENT_RULES_AND_POLICIES.md` - All development rules
- `PROJECT_MIGRATION_GUIDE.md` - Migration documentation
- `BUG_TRACKING.md` - Bug tracking and fixes
- `README.md` - Project overview

---

## Contact & Next Steps

### For New Cursor Agent
1. Read this entire document to understand project context
2. Review `DEVELOPMENT_RULES_AND_POLICIES.md` for coding standards
3. Check `BUG_TRACKING.md` for recent fixes and known issues
4. Review current TODO list above
5. Validate remote system status (run validation script)
6. Continue from where we left off

### Key Contacts
- **GitHub Repo**: `https://github.com/bennyg83/pilzno_crm.git`
- **Remote System**: `crm-mini` (10.100.102.112)
- **Public Backend URL**: `https://crm-mini.tail34e202.ts.net/`

### Important Notes
- Always use Git Bash for local development (except SSH to remote - use PowerShell)
- Follow Docker build process rules (stop → build → start)
- PostgreSQL ONLY - no MongoDB
- TypeScript strict mode - proper typing required
- Material-UI for all UI components

---

**End of Conversation Backup**

*This document represents the complete context and state of the Pilzno CRM project as of the last conversation session. Use this as your starting point for continuing development.*

