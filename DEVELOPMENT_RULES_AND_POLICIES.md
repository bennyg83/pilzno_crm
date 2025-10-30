# Development Rules and Policies

## 🎯 Core Development Principles

### 1. Technology Stack Rules
- **✅ REQUIRED**: React 18+ with TypeScript
- **✅ REQUIRED**: Node.js 18+ with TypeScript
- **✅ REQUIRED**: PostgreSQL database (NO MongoDB)
- **✅ REQUIRED**: Docker Desktop with WSL2 backend
- **✅ REQUIRED**: Material-UI for all UI components
- **✅ REQUIRED**: Git Bash for all terminal operations

### 2. Code Quality Standards
- **TypeScript Strict Mode**: All code must be properly typed
- **No `any` Types**: Use proper TypeScript types or interfaces
- **JSDoc Comments**: All functions and components must have documentation
- **Error Handling**: All async operations must have try-catch blocks
- **Loading States**: Show loading indicators for all async operations

## 🏗️ Architecture Rules

### Frontend Architecture
```
src/
├── components/     # Reusable UI components only
├── pages/         # Main application pages/routes
├── services/      # API communication layer
├── types/         # TypeScript type definitions
├── utils/         # Helper functions and utilities
└── contexts/      # React context providers
```

### Backend Architecture
```
src/
├── entities/      # TypeORM database entities
├── routes/        # API route handlers
├── middleware/    # Express middleware
├── migrations/    # Database migrations
└── utils/         # Helper functions
```

## 🎨 UI/UX Standards

### Design System
- **Primary Color**: #6A1B9A (Purple)
- **Secondary Color**: #4A148C (Dark Purple)
- **Accent Color**: #9C4DCC (Light Purple)
- **Success Color**: #4CAF50 (Green)
- **Warning Color**: #FF9800 (Orange)
- **Error Color**: #F44336 (Red)

### Component Standards
- **Material-UI Only**: No custom CSS frameworks
- **Responsive Design**: Mobile-first approach
- **Consistent Spacing**: Use Material-UI spacing system
- **Icon Usage**: Material-UI Icons only
- **Typography**: Material-UI Typography components

### Layout Rules
- **Grid System**: Use Material-UI Grid for layouts
- **Card Components**: Use Material-UI Card for content grouping
- **Modal Dialogs**: Use Material-UI Dialog for forms and views
- **Form Validation**: Client-side validation with error messages
- **Loading States**: CircularProgress for async operations

## 🔧 Development Workflow

### Git Workflow
```bash
# Always use Git Bash for terminal operations
# Never use Command Prompt or PowerShell

# Branch naming
feature/feature-name
bugfix/bug-description
hotfix/critical-fix

# Commit messages
feat: add new feature
fix: fix bug
docs: update documentation
style: code formatting
refactor: code refactoring
test: add tests
```

### Docker Workflow
```bash
# Always use Docker Desktop context
docker --context desktop-linux compose [command]

# Never use docker-compose directly
# Always use the full context command

# Common commands
docker --context desktop-linux compose up -d
docker --context desktop-linux compose down
docker --context desktop-linux compose build
docker --context desktop-linux compose logs
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `FamilyFormDialog.tsx`)
- **Pages**: PascalCase (e.g., `FamiliesPage.tsx`)
- **Utilities**: camelCase (e.g., `hebrewCalendar.ts`)
- **Types**: camelCase (e.g., `index.ts`)
- **Constants**: UPPER_SNAKE_CASE

## 🗄️ Database Rules

### Entity Rules
- **TypeORM Entities**: All database models must be TypeORM entities
- **Migrations**: Never modify entities directly, always create migrations
- **Relationships**: Use proper foreign key relationships
- **Validation**: Use class-validator decorators for validation
- **Naming**: Use snake_case for database columns

### Migration Rules
```typescript
// Migration naming convention
[timestamp]-[Description].ts

// Example
1756920000000-AddIsAnnualPledgeToPledges.ts
```

### Database Access
- **Repository Pattern**: Use TypeORM repositories for database access
- **Transactions**: Use transactions for complex operations
- **Error Handling**: Proper error handling for database operations
- **Backup**: Regular database backups before major changes

## 🔐 Security Rules

### Authentication
- **JWT Tokens**: Use JWT for authentication
- **Password Hashing**: Use bcrypt for password hashing
- **Role-Based Access**: Implement proper role-based permissions
- **Token Expiration**: Set appropriate token expiration times

### API Security
- **CORS**: Configure CORS properly for production
- **Input Validation**: Validate all input data
- **SQL Injection**: Use parameterized queries
- **Rate Limiting**: Implement rate limiting for API endpoints

### Data Protection
- **Environment Variables**: Never commit sensitive data
- **Database Credentials**: Use environment variables
- **JWT Secrets**: Use strong, random JWT secrets
- **HTTPS**: Use HTTPS in production

## 📝 Code Documentation

### JSDoc Standards
```typescript
/**
 * Calculate member's age from date of birth
 * 
 * @param {string} dateOfBirth - ISO date string
 * @returns {number | null} Age in years or null if invalid date
 * @example
 * const age = getAge('1990-01-01'); // Returns 34
 */
const getAge = (dateOfBirth?: string): number | null => {
  // Implementation
}
```

### Component Documentation
```typescript
/**
 * FamilyFormDialog - Modal dialog for creating and editing families
 * 
 * This component provides a comprehensive form for family management,
 * including basic information, contact details, and family tier selection.
 * 
 * @param {boolean} open - Controls dialog visibility
 * @param {() => void} onClose - Callback when dialog is closed
 * @param {Family | null} family - The family to edit (null for new family)
 * @param {() => void} onSave - Callback when family is saved
 */
const FamilyFormDialog: React.FC<FamilyFormDialogProps> = ({ ... }) => {
  // Implementation
}
```

## 🧪 Testing Standards

### Unit Testing (Future)
- **Test Files**: `*.test.ts` or `*.spec.ts`
- **Test Coverage**: Minimum 80% coverage
- **Test Location**: Same directory as source files
- **Mocking**: Mock external dependencies

### Integration Testing (Future)
- **API Tests**: Test all API endpoints
- **Database Tests**: Test database operations
- **UI Tests**: Test critical user flows

## 🚀 Deployment Rules

### Environment Configuration
- **Development**: Use `.env` files for local development
- **Production**: Use environment variables or secure config
- **Secrets**: Never commit secrets to version control
- **Validation**: Validate all environment variables

### Docker Rules
- **Multi-stage Builds**: Use multi-stage builds for production
- **Image Size**: Keep Docker images as small as possible
- **Security**: Use non-root users in containers
- **Health Checks**: Implement health checks for all services

### Database Deployment
- **Migrations**: Run migrations before starting application
- **Backup**: Create backup before deployment
- **Rollback**: Have rollback plan ready
- **Monitoring**: Monitor database performance

## 🔍 Code Review Standards

### Review Checklist
- [ ] Code follows TypeScript strict mode
- [ ] All functions have JSDoc comments
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] UI follows design system
- [ ] Database operations are secure
- [ ] Environment variables are used
- [ ] No hardcoded values
- [ ] Proper error messages
- [ ] Responsive design

### Approval Requirements
- **At least 1 reviewer** for all changes
- **No self-approval** allowed
- **All tests pass** before merge
- **Documentation updated** if needed

## 📊 Performance Standards

### Frontend Performance
- **Bundle Size**: Keep bundle size under 2MB
- **Loading Time**: Initial load under 3 seconds
- **Memory Usage**: Monitor memory usage
- **Code Splitting**: Use code splitting for large components

### Backend Performance
- **Response Time**: API responses under 500ms
- **Database Queries**: Optimize database queries
- **Caching**: Implement caching where appropriate
- **Memory Usage**: Monitor memory usage

### Database Performance
- **Query Optimization**: Optimize all database queries
- **Indexing**: Proper indexing for frequently queried fields
- **Connection Pooling**: Use connection pooling
- **Monitoring**: Monitor database performance

## 🐛 Bug Tracking

### Bug Severity Levels
- **Critical**: System down, data loss, security breach
- **High**: Major feature broken, significant impact
- **Medium**: Minor feature broken, workaround available
- **Low**: Cosmetic issues, minor improvements

### Bug Reporting
- **Title**: Clear, descriptive title
- **Description**: Detailed description of the issue
- **Steps**: Steps to reproduce
- **Expected**: Expected behavior
- **Actual**: Actual behavior
- **Environment**: OS, browser, version
- **Screenshots**: Include screenshots if applicable

## 🔄 Maintenance Rules

### Regular Maintenance
- **Dependencies**: Update dependencies monthly
- **Security**: Check for security vulnerabilities
- **Performance**: Monitor performance metrics
- **Backups**: Regular database backups
- **Logs**: Monitor application logs

### Code Cleanup
- **Dead Code**: Remove unused code
- **Comments**: Update outdated comments
- **Refactoring**: Refactor complex code
- **Optimization**: Optimize slow code

## 📚 Learning and Development

### Required Knowledge
- **React 18+**: Hooks, Context, TypeScript
- **Node.js**: Express, TypeORM, JWT
- **PostgreSQL**: SQL, relationships, migrations
- **Docker**: Containers, Docker Compose
- **Git**: Version control, branching, merging

### Recommended Resources
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Material-UI Documentation**: https://mui.com/
- **TypeORM Documentation**: https://typeorm.io/
- **Docker Documentation**: https://docs.docker.com/

## 🎯 Success Metrics

### Code Quality Metrics
- **TypeScript Coverage**: 100%
- **JSDoc Coverage**: 100%
- **Test Coverage**: 80%+ (future)
- **Bug Rate**: < 5% of features
- **Performance**: < 3s load time

### Development Metrics
- **Build Time**: < 5 minutes
- **Deployment Time**: < 10 minutes
- **Code Review Time**: < 24 hours
- **Bug Fix Time**: < 48 hours
- **Feature Delivery**: On time, on budget

---

**Remember**: These rules ensure consistency, quality, and maintainability of the Pilzno Synagogue CRM system. Follow them religiously! 🏛️
