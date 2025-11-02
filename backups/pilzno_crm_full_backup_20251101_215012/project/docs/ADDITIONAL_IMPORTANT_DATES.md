# Additional Important Dates Feature

## Overview
The Additional Important Dates feature allows users to add custom important dates for families that aren't captured in the standard member fields. This includes wedding anniversaries, aliyah anniversaries, and other custom dates.

## Features

### Date Types
- **Wedding Anniversary**: For family wedding anniversaries
- **Aliyah Anniversary**: For immigration anniversaries (can be multiple per family, requires member selection)
- **Other**: Custom dates with free-text descriptions and member selection

### Functionality
- Add multiple additional dates per family
- Edit existing dates
- Delete dates
- Automatic Hebrew date support with manual override
- Member selection for aliyah anniversaries and custom dates
- Family-specific organization
- Consolidated date display to eliminate redundancy

## Backend Implementation

### Database Schema
```sql
CREATE TABLE additional_important_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('wedding_anniversary', 'aliyah_anniversary', 'other')),
    description TEXT,
    english_date DATE NOT NULL,
    hebrew_date VARCHAR(100),
    member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    member_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints
- `GET /api/additional-dates/family/:familyId` - Get all dates for a family
- `POST /api/additional-dates` - Create a new date
- `PUT /api/additional-dates/:id` - Update an existing date
- `DELETE /api/additional-dates/:id` - Delete a date
- `GET /api/additional-dates` - Get all dates (admin)

### Entity
- **File**: `backend/src/entities/AdditionalImportantDate.ts`
- **Relationships**: Many-to-one with Family entity
- **Validation**: Type enum validation, required fields validation

## Frontend Implementation

### Components
- **FamiliesPage**: Main integration point
- **Important Dates Tab**: Displays all dates in organized sections

### State Management
- Local state for form management
- Backend synchronization for persistence
- Real-time updates and validation

### User Experience
- Inline editing capabilities
- Bulk save operations
- Immediate feedback and error handling
- Responsive design for all screen sizes

## Usage

### Adding a New Date
1. Navigate to Family Details → Important Dates tab
2. Click "Add Another Date"
3. Select date type from dropdown
4. For Aliyah Anniversary and Other dates, select the family member
5. Fill in required fields (English date is mandatory)
6. Hebrew date is automatically populated but can be manually overridden
7. Click "Save All Dates" to persist changes

### Editing Existing Dates
1. Modify any field in the form
2. Changes are automatically saved to backend
3. Real-time validation and error handling

### Deleting Dates
1. Click the delete button (trash icon) on any date entry
2. Confirmation and immediate removal from both frontend and backend

## Data Flow

1. **Load**: Family view triggers loading of additional dates
2. **Display**: Dates are shown in organized sections by type
3. **Edit**: User modifications update local state
4. **Save**: Backend API calls persist changes
5. **Sync**: Local state is updated with backend response

## Security

- All endpoints require authentication
- Family-specific access control
- Input validation and sanitization
- SQL injection protection via TypeORM

## Performance

- Indexed database queries for fast lookups
- Efficient state management
- Optimized re-renders
- Lazy loading of date data

## Future Enhancements

- Date reminders and notifications
- Calendar integration
- Export functionality
- Advanced filtering and search
- Bulk operations
- Date templates for common events
