# Pilzno Synagogue Management System

A comprehensive management system for Pilzno Synagogue, designed to handle families, individual members, Jewish lifecycle events, donations, and community engagement.

## 🕍 Features

### Core Management
- **Family Management**: Complete family profiles with Hebrew name support
- **Member Management**: Individual member tracking with Jewish lifecycle events
- **Event Management**: Bar/Bat Mitzvah, weddings, yahrzeits, and community events
- **Donation Tracking**: Pledges, donations, and financial management
- **Community Health**: Family engagement and membership status tracking

### Jewish Lifecycle Support
- Hebrew date support for births, yahrzeits, and celebrations
- Bar/Bat Mitzvah tracking and countdown
- Kohen/Levi status tracking
- Israeli citizenship and Aliyah date management
- Memorial and yahrzeit management

### Community Features
- Membership tier management (Founding Families, Life Members, etc.)
- Email communication system (no Gmail integration)
- Comprehensive note-taking with synagogue-specific categories
- Advanced search and filtering capabilities
- Dashboard with community health metrics

## 🏗️ Architecture

### Backend (Node.js + TypeScript + PostgreSQL)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based authentication
- **API**: RESTful API with comprehensive error handling

### Frontend (React + TypeScript + Material-UI)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) with custom synagogue theme
- **Build Tool**: Vite for fast development and building
- **State Management**: React Query for server state
- **Routing**: React Router v6

### Development Environment
- **Containerization**: Docker Compose for isolated development
- **Database**: PostgreSQL 15 in Docker container
- **Container Names**: All prefixed with `pilzno-synagogue-` for isolation

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pilzno_crm
   ```

2. **Start the complete system**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Development Workflow

**Backend Development:**
```bash
cd backend
npm install
npm run dev
```

**Frontend Development:**
```bash
cd frontend
npm install
npm run dev
```

**🚨 IMPORTANT: Docker Build Process**
When making frontend changes that need to be deployed to Docker containers:

```bash
# ALWAYS use this sequence for Docker deployments:
docker --context desktop-linux compose down
cd frontend && npm run build && cd ..
docker --context desktop-linux compose up -d --build
```

**Why?** Building while containers run causes build context conflicts. See [BUILD_PROCESS_TROUBLESHOOTING.md](./BUILD_PROCESS_TROUBLESHOOTING.md) for details.

## 📊 Database Schema

### Core Entities

#### Families (`families` table)
- Family information with Hebrew name support
- Membership status and family health tracking
- Address, contact information, and communication preferences
- Financial tracking (annual pledge, total donations)
- Special status flags (founding family, board family)

#### Family Members (`family_members` table)
- Individual member profiles with Hebrew names
- Jewish lifecycle fields (Bar/Bat Mitzvah, Kohen/Levi status)
- Israeli connection tracking
- Professional and community involvement
- Memorial information and accessibility needs

#### Family Tiers (`family_tiers` table)
- Membership levels (Founding Family, Life Members, etc.)
- Benefits and minimum donation requirements

#### Events (`events` table)
- Jewish lifecycle and community events
- Hebrew date support and recurrence patterns
- Location and status tracking

#### Donations (`donations` table)
- Comprehensive donation tracking
- Multiple payment methods and donation types
- Recurring donation support
- Tax deductible amount tracking

#### Notes (`notes` table)
- Enhanced note system with synagogue-specific categories
- Support for both legacy CRM and new synagogue relationships
- Follow-up tracking and priority levels

#### Emails (`emails` table)
- Email communication without Gmail integration
- Jewish lifecycle email types
- Scheduling and priority support

## 🎨 Design System & Authentic Emblem

### Official Pilzno Synagogue Emblem
The system uses the authentic Pilzno Synagogue emblem featuring:
- **Circular Design**: Deep purple background with gold elements
- **Crown**: Traditional heraldic crown at the top with jewels
- **Central Shield**: White shield with green heraldic elements
- **Guardian Lions**: Two golden lions as heraldic supporters
- **Hebrew Text**: "בית הכנסת פילזנו" (Beit Knesset Pilzno - Pilzno Synagogue)
- **English Text**: "PILZNO" in bold golden letters

### Color Palette (From Authentic Emblem)
- **Primary Purple**: #4A148C (Deep purple from emblem background)
- **Secondary Gold**: #FFD700 (Bright gold from lions, crown, and text)
- **Success Green**: #2E7D32 (Green from shield heraldic elements)
- **Text Colors**: 
  - Primary: #2E0058 (Dark purple for main text)
  - Secondary: #4A148C (Medium purple for secondary text)
- **Background**: #FAFAFA (Light background for optimal contrast)
- **Paper**: #FFFFFF (Pure white for cards and surfaces)

### Typography & Styling
- **Font Family**: Roboto with Hebrew font support
- **Card Design**: Rounded corners (12px) with authentic purple shadows
- **Button Styling**: Gold secondary buttons with purple primary
- **Form Fields**: Purple-themed with gold focus indicators
- **Navigation**: Purple app bar with gold text
- **Notifications**: Purple background with gold text

## 🔐 Authentication & Security

- JWT-based authentication with 24-hour token expiration
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js for security headers
- CORS configuration for frontend-backend communication

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token validity

### Family Management (Phase 2)
- `GET /api/families` - List families with advanced search
- `POST /api/families` - Create new family with duplicate detection
- `GET /api/families/statistics` - Dashboard statistics
- `GET /api/families/:id` - Get family details
- `PUT /api/families/:id` - Update family information
- `DELETE /api/families/:id` - Delete family

### Member Management (Phase 2)
- `GET /api/family-members` - List members with filtering
- `GET /api/family-members/birthdays-this-month` - Birthday tracking
- `GET /api/family-members/yahrzeits-this-month` - Memorial tracking
- `GET /api/family-members/upcoming-bnai-mitzvah` - B'nai Mitzvah tracking

## 🔄 Development Phases

### ✅ Phase 1: Project Transformation (COMPLETED)
- [x] Complete project structure transformation
- [x] Docker setup with unique container names
- [x] Authentic Pilzno synagogue emblem integration
- [x] Color palette extraction from official emblem
- [x] Database schema design with TypeORM entities
- [x] Authentication system setup
- [x] Material-UI theme with authentic synagogue colors

### 🚧 Phase 2: Backend API Development (Next)
- [ ] Family Management API (PROMPT 3)
- [ ] Family Member Management API (PROMPT 4)
- [ ] Backend routes and integration (PROMPT 5)

### 🚧 Phase 3: Frontend Development (Future)
- [ ] Family Management frontend (PROMPT 6)
- [ ] Member Management frontend (PROMPT 7)
- [ ] Dashboard updates and navigation (PROMPT 8)

### 🚧 Phase 4: Final Integration (Future)
- [ ] System integration and cleanup (PROMPT 9)
- [ ] Final feature completion (PROMPT 10)

## 🛠️ Technologies Used

### Backend
- Node.js 18 with TypeScript
- Express.js web framework
- TypeORM with PostgreSQL
- JWT authentication
- bcryptjs for password hashing
- Helmet.js for security
- express-rate-limit for rate limiting
- class-validator for input validation

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) with authentic Pilzno theme
- Vite build tool
- React Router v6
- React Query for server state
- React Hook Form for form management
- Axios for HTTP requests
- react-hot-toast for notifications

### Development & DevOps
- Docker & Docker Compose
- TypeScript for type safety
- ESLint for code quality
- PostgreSQL 15 database

## 🎯 Authentic Synagogue Features

### Hebrew Language Support
- Full Hebrew text support throughout the interface
- Hebrew names for families and members
- Hebrew date integration for Jewish calendar events
- Right-to-left text support where appropriate

### Jewish Lifecycle Management
- Comprehensive Bar/Bat Mitzvah tracking
- Yahrzeit (memorial anniversary) management
- Jewish holiday and event calendars
- Kohen/Levi priestly designation tracking
- Israeli citizenship and Aliyah documentation

### Community Engagement
- Family health and engagement metrics
- Membership tier management with benefits
- Donation and pledge comprehensive tracking
- Community event organization and tracking
- Pastoral care and community support documentation

## 📞 Support

For technical support or questions about the Pilzno Synagogue Management System, please contact the development team.

## 📄 License

MIT License - see LICENSE file for details.

---

**Pilzno Synagogue Management System** - Honoring tradition with modern technology, serving our community with the authentic spirit of Pilzno Synagogue (בית הכנסת פילזנו). 