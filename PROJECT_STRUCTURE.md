# Project Structure Documentation

## 📁 Complete Project Structure

```
pilzno_crm/
├── 📁 frontend/                          # React/TypeScript Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/                # Reusable UI Components
│   │   │   ├── 📄 AdditionalDateFormDialog.tsx    # Modal for additional dates
│   │   │   ├── 📄 DonationFormDialog.tsx          # Modal for donation forms
│   │   │   ├── 📄 FamilyFormDialog.tsx            # Modal for family forms
│   │   │   ├── 📄 FamilyMemberFormDialog.tsx      # Modal for member forms
│   │   │   ├── 📄 Layout.tsx                      # Main layout component
│   │   │   ├── 📄 MemberViewDialog.tsx            # Read-only member view
│   │   │   ├── 📄 PledgeFormDialog.tsx            # Modal for pledge forms
│   │   │   └── 📄 PrivateRoute.tsx                # Authentication guard
│   │   ├── 📁 contexts/                  # React Context Providers
│   │   │   └── 📄 AuthContext.tsx                 # Authentication context
│   │   ├── 📁 pages/                     # Main Application Pages
│   │   │   ├── 📄 Dashboard.tsx                   # Main dashboard
│   │   │   ├── 📄 DonationsPage.tsx               # Donations management
│   │   │   ├── 📄 EventsPage.tsx                  # Events management
│   │   │   ├── 📄 FamiliesPage.tsx                # Family management (main)
│   │   │   ├── 📄 LoginPage.tsx                   # User login
│   │   │   ├── 📄 MembersPage.tsx                 # Member management
│   │   │   ├── 📄 NotFoundPage.tsx                # 404 page
│   │   │   └── 📄 SettingsPage.tsx                # System settings
│   │   ├── 📁 services/                  # API Service Layer
│   │   │   └── 📄 apiService.ts                   # Centralized API calls
│   │   ├── 📁 types/                     # TypeScript Type Definitions
│   │   │   └── 📄 index.ts                       # All type definitions
│   │   ├── 📁 utils/                     # Utility Functions
│   │   │   ├── 📄 hebrewCalendar.ts              # Hebrew calendar utilities
│   │   │   └── 📄 pledgeCalculations.ts          # Financial calculations
│   │   ├── 📄 App.tsx                            # Main app component
│   │   ├── 📄 main.tsx                           # App entry point
│   │   └── 📄 vite-env.d.ts                     # Vite type definitions
│   ├── 📄 Dockerfile                            # Frontend container config
│   ├── 📄 index.html                            # HTML template
│   ├── 📄 nginx.conf                            # Nginx configuration
│   ├── 📄 package.json                          # Frontend dependencies
│   ├── 📄 tsconfig.json                         # TypeScript config
│   ├── 📄 tsconfig.node.json                    # Node TypeScript config
│   └── 📄 vite.config.ts                        # Vite build configuration
├── 📁 backend/                           # Node.js/TypeScript Backend
│   ├── 📁 src/
│   │   ├── 📁 entities/                  # TypeORM Database Entities
│   │   │   ├── 📄 AdditionalImportantDate.ts     # Additional dates entity
│   │   │   ├── 📄 Donation.ts                   # Donations entity
│   │   │   ├── 📄 Email.ts                      # Email entity
│   │   │   ├── 📄 EmailTemplate.ts              # Email templates entity
│   │   │   ├── 📄 Event.ts                      # Events entity
│   │   │   ├── 📄 Family.ts                     # Family entity
│   │   │   ├── 📄 FamilyMember.ts               # Family members entity
│   │   │   ├── 📄 FamilyTier.ts                 # Family tiers entity
│   │   │   ├── 📄 Note.ts                       # Notes entity
│   │   │   ├── 📄 Pledge.ts                     # Pledges entity
│   │   │   ├── 📄 SystemSettings.ts             # System settings entity
│   │   │   ├── 📄 User.ts                       # Users entity
│   │   │   └── 📄 UserInvitation.ts             # User invitations entity
│   │   ├── 📁 middleware/                # Express Middleware
│   │   │   ├── 📄 auth.ts                       # Authentication middleware
│   │   │   └── 📄 error-handler.ts              # Error handling middleware
│   │   ├── 📁 migrations/                # Database Migrations
│   │   │   ├── 📄 1756920000000-AddIsAnnualPledgeToPledges.ts
│   │   │   ├── 📄 1756920000001-AddDueDateAndDonationDateToPledges.ts
│   │   │   └── 📄 1756920000002-RemovePledgedByFromPledges.ts
│   │   ├── 📁 routes/                     # API Route Handlers
│   │   │   ├── 📄 additionalImportantDates.ts   # Additional dates routes
│   │   │   ├── 📄 auth.ts                       # Authentication routes
│   │   │   ├── 📄 donations.ts                  # Donations routes
│   │   │   ├── 📄 emailTemplates.ts             # Email templates routes
│   │   │   ├── 📄 events.ts                     # Events routes
│   │   │   ├── 📄 families.ts                   # Families routes
│   │   │   ├── 📄 familyMembers.ts              # Family members routes
│   │   │   ├── 📄 pledges.ts                    # Pledges routes
│   │   │   ├── 📄 systemSettings.ts             # System settings routes
│   │   │   └── 📄 users.ts                      # Users routes
│   │   ├── 📄 data-source.ts                    # TypeORM configuration
│   │   └── 📄 index.ts                          # Server entry point
│   ├── 📄 Dockerfile                            # Backend container config
│   ├── 📄 package.json                          # Backend dependencies
│   └── 📄 tsconfig.json                         # TypeScript config
├── 📁 scripts/                           # Setup and Utility Scripts
│   ├── 📄 init-db.sql                          # Database initialization
│   ├── 📄 setup-new-system.sh                  # New system setup script
│   ├── 📄 transfer-to-ubuntu.bat               # Ubuntu transfer script
│   └── 📄 ubuntu-quick-start.sh                # Ubuntu quick start
├── 📁 data/                              # Application Data
│   ├── 📄 current-ip.txt                       # Current IP address
│   └── 📄 last-update.txt                      # Last update timestamp
├── 📁 docs/                              # Documentation
│   ├── 📄 ADDITIONAL_IMPORTANT_DATES.md        # Additional dates docs
│   ├── 📄 GITHUB_PAGES_DEPLOYMENT.md           # GitHub Pages deployment
│   ├── 📄 github-pages-migration-plan.txt      # Migration plan
│   └── 📄 SETTINGS_MANAGEMENT.md               # Settings management docs
├── 📄 .env.example                           # Environment variables template
├── 📄 .gitignore                             # Git ignore rules
├── 📄 BUG_TRACKING.md                         # Bug tracking document
├── 📄 docker-compose.yml                      # Development Docker Compose
├── 📄 docker-compose.prod.yml                 # Production Docker Compose
├── 📄 ENVIRONMENT_SETUP.md                    # Environment setup guide
├── 📄 PROJECT_MIGRATION_GUIDE.md              # Migration guide
├── 📄 PROJECT_STRUCTURE.md                    # This file
├── 📄 README.md                               # Main project README
├── 📄 start-app.sh                            # Quick start script
├── 📄 stop-app.sh                             # Quick stop script
└── 📄 pilzno_logo.png                         # Project logo
```

## 🏗️ Architecture Overview

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                           │
├─────────────────────────────────────────────────────────────┤
│  Pages (Routes)                                             │
│  ├── Dashboard                                              │
│  ├── Families (Main Feature)                               │
│  ├── Members                                               │
│  ├── Donations                                             │
│  ├── Events                                                │
│  └── Settings                                              │
├─────────────────────────────────────────────────────────────┤
│  Components                                                 │
│  ├── Layout (Navigation)                                   │
│  ├── Form Dialogs                                          │
│  ├── View Dialogs                                          │
│  └── PrivateRoute (Auth)                                   │
├─────────────────────────────────────────────────────────────┤
│  Services & Utils                                           │
│  ├── API Service (HTTP Client)                             │
│  ├── Hebrew Calendar Utils                                 │
│  └── Financial Calculations                                │
├─────────────────────────────────────────────────────────────┤
│  Contexts                                                   │
│  └── AuthContext (User State)                              │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Backend                          │
├─────────────────────────────────────────────────────────────┤
│  Routes (API Endpoints)                                     │
│  ├── /auth (Authentication)                                │
│  ├── /families (Family Management)                         │
│  ├── /members (Member Management)                          │
│  ├── /pledges (Financial Management)                       │
│  ├── /donations (Donations)                                │
│  └── /settings (System Settings)                           │
├─────────────────────────────────────────────────────────────┤
│  Middleware                                                 │
│  ├── Authentication (JWT)                                  │
│  └── Error Handling                                        │
├─────────────────────────────────────────────────────────────┤
│  Entities (Database Models)                                │
│  ├── Family, FamilyMember                                  │
│  ├── Pledge, Donation                                      │
│  ├── User, SystemSettings                                  │
│  └── Event, EmailTemplate                                  │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)                                     │
│  └── TypeORM (ORM)                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Key Components Explained

### Frontend Components

#### Layout.tsx
- **Purpose**: Main application layout with navigation
- **Features**: Sidebar navigation, user info, logout functionality
- **Dependencies**: Material-UI, React Router

#### FamiliesPage.tsx
- **Purpose**: Main family management interface
- **Features**: Family cards, financial tracking, member management
- **Key Functions**: CRUD operations, financial calculations, Hebrew date handling

#### MemberViewDialog.tsx
- **Purpose**: Read-only member information display
- **Features**: Comprehensive member details, organized information cards
- **Dependencies**: Material-UI, dayjs for date formatting

#### PledgeFormDialog.tsx
- **Purpose**: Pledge creation and editing
- **Features**: Annual/one-time pledges, due dates, Hebrew calendar integration
- **Key Features**: Dropdown for pledge types, custom descriptions

### Backend Components

#### data-source.ts
- **Purpose**: TypeORM database configuration
- **Features**: Entity registration, migration settings, connection management

#### auth.ts (Middleware)
- **Purpose**: JWT authentication middleware
- **Features**: Token validation, user context, role-based access

#### families.ts (Routes)
- **Purpose**: Family management API endpoints
- **Features**: CRUD operations, member relationships, financial data

## 🗄️ Database Schema

### Core Entities

#### Family
```typescript
interface Family {
  id: string
  familyName: string
  address: string
  phone: string
  email: string
  annualPledge: number
  currency: 'NIS' | 'USD' | 'GBP'
  tier: FamilyTier
  members: FamilyMember[]
  pledges: Pledge[]
  // ... additional fields
}
```

#### FamilyMember
```typescript
interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  fullHebrewName?: string
  hebrewLastName?: string
  email?: string
  cellPhone?: string
  dateOfBirth?: string
  relationshipInHouse: RelationshipInHouse
  isActive: boolean
  isPrimaryContact: boolean
  // ... additional fields
}
```

#### Pledge
```typescript
interface Pledge {
  id: string
  familyId: string
  amount: number
  currency: 'NIS' | 'USD' | 'GBP'
  description: string
  date: string
  isAnnualPledge: boolean
  dueDate?: string
  donationDate?: string
  status: 'pending' | 'paid' | 'cancelled'
  // ... additional fields
}
```

## 🔄 Data Flow

### Typical User Action Flow
1. **User Login** → AuthContext → JWT Token Storage
2. **Navigate to Families** → FamiliesPage → API Call → Family Data
3. **View Family Details** → Family Card → Member/Financial Data
4. **Add Member** → MemberFormDialog → API Call → Database Update
5. **Add Pledge** → PledgeFormDialog → API Call → Financial Update

### API Request Flow
1. **Frontend** → apiService → HTTP Request
2. **Backend** → Route Handler → Middleware (Auth)
3. **Backend** → Entity Repository → Database Query
4. **Database** → PostgreSQL → Response
5. **Backend** → JSON Response → Frontend
6. **Frontend** → State Update → UI Re-render

## 🎨 UI/UX Patterns

### Design System
- **Color Scheme**: Purple theme (#6A1B9A, #4A148C)
- **Typography**: Material-UI Typography components
- **Layout**: Grid system with responsive breakpoints
- **Components**: Material-UI component library
- **Icons**: Material-UI Icons

### Common Patterns
- **Modal Dialogs**: For forms and detailed views
- **Card Layout**: For displaying lists of items
- **Tab Navigation**: For organizing related content
- **Form Validation**: Client-side validation with error messages
- **Loading States**: CircularProgress indicators
- **Error Handling**: Alert components for user feedback

## 🚀 Deployment Structure

### Development
- **Frontend**: Vite dev server on port 3000
- **Backend**: Node.js server on port 3002
- **Database**: PostgreSQL on port 5432
- **All services**: Docker containers

### Production
- **Frontend**: Nginx serving static files
- **Backend**: Node.js server (internal)
- **Database**: PostgreSQL (internal)
- **Reverse Proxy**: Nginx for external access
- **SSL**: HTTPS with Let's Encrypt certificates

## 📝 Development Guidelines

### Code Organization
1. **Components**: Reusable UI components in `/components`
2. **Pages**: Main application pages in `/pages`
3. **Services**: API communication in `/services`
4. **Types**: TypeScript definitions in `/types`
5. **Utils**: Helper functions in `/utils`

### Naming Conventions
- **Components**: PascalCase (e.g., `FamilyFormDialog`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Database**: snake_case

### Best Practices
1. **TypeScript**: Strict mode enabled, no `any` types
2. **Error Handling**: Try-catch blocks for all async operations
3. **Loading States**: Show loading indicators for user feedback
4. **Form Validation**: Client-side validation before API calls
5. **Documentation**: JSDoc comments for all functions
6. **Testing**: Unit tests for critical functions (future enhancement)

---

This structure provides a solid foundation for the Pilzno Synagogue CRM system and can be easily understood and maintained by any developer familiar with React, Node.js, and TypeScript.
