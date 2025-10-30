# 🐛 Bug Tracking System

## Auto-Refresh Issues

### 1. Pledge Form Auto-Refresh Not Working
**Status**: 🔴 Active  
**Location**: `frontend/src/pages/FamiliesPage.tsx` - `handleSavePledge`  
**Description**: After editing a pledge and toggling annual pledge switch, the UI still shows stale data and requires manual refresh  
**Evidence**: 
- Form correctly sends `isAnnualPledge: false`
- Backend correctly saves the value
- Auto-refresh runs but UI doesn't update immediately
- Manual refresh shows correct data

**Root Cause**: Auto-refresh is running but not properly updating the viewing family state

### 2. Financial Summary Stale Data
**Status**: 🔴 Active  
**Location**: `frontend/src/pages/FamiliesPage.tsx` - Financial Summary calculations  
**Description**: Financial summary shows old pledge data until manual refresh  
**Evidence**:
- Annual pledges total shows incorrect values
- Pledge counts are wrong
- Data corrects after manual refresh

### 3. Duplicate Pledge Creation
**Status**: 🔴 Active  
**Location**: `frontend/src/pages/FamiliesPage.tsx` - `handleSavePledge`  
**Description**: Editing existing pledges creates new pledges instead of updating existing ones  
**Evidence**:
- New pledge IDs generated instead of updating existing
- Pledge count increases after edit
- Duplicates removed after manual refresh

## UI/UX Issues

### 4. Important Dates Tab Conditional Rendering
**Status**: ✅ Fixed  
**Location**: `frontend/src/pages/FamiliesPage.tsx` - Tab rendering logic  
**Description**: Important Dates tab was not accessible without Yahrzeit data  
**Resolution**: Fixed tab indexing and conditional rendering

### 5. Date Drift in Family Member Forms
**Status**: ✅ Fixed  
**Location**: `frontend/src/components/FamilyMemberFormDialog.tsx` - Date handling  
**Description**: Gregorian dates were drifting (e.g., Aug 12 → Aug 10)  
**Resolution**: Implemented read-only date fields with explicit edit mode

### 6. Hebrew Date Conversion Errors
**Status**: ✅ Fixed  
**Location**: Multiple components - `convertToHebrewDate` function  
**Description**: Hebrew dates showing incorrect values (e.g., "10 Iyyar 26" instead of "10 Elul")  
**Resolution**: Fixed HDate constructor usage

### 7. Family Name Auto-Population Issue
**Status**: ✅ Fixed  
**Location**: `frontend/src/components/FamilyMemberFormDialog.tsx` - Auto-population logic  
**Description**: "Family" suffix was being appended to last names during auto-population  
**Resolution**: Added regex to remove "Family" suffix

## Backend Issues

### 8. Missing Database Columns
**Status**: ✅ Fixed  
**Location**: `backend/src/entities/Pledge.ts` and database migrations  
**Description**: `dueDate` and `donationDate` columns missing from pledges table  
**Resolution**: Added columns to entity and created migration

### 9. TypeScript Compilation Errors
**Status**: ✅ Fixed  
**Location**: `backend/src/routes/pledges.ts` - Pledge creation/update  
**Description**: TypeScript errors due to missing fields in Pledge entity  
**Resolution**: Added missing fields to entity definition

### 10. API 500 Error on Families Endpoint
**Status**: ✅ Fixed  
**Location**: `backend/src/routes/families.ts` - Database queries  
**Description**: 500 error due to missing database columns  
**Resolution**: Ran pending database migrations

## Data Integrity Issues

### 11. Pledge Form Initialization Logic
**Status**: ✅ Fixed  
**Location**: `frontend/src/components/PledgeFormDialog.tsx` - Form initialization  
**Description**: Form was auto-setting `isAnnualPledge` based on description type  
**Resolution**: Removed automatic logic, made all fields manual

### 12. Currency Formatting Errors
**Status**: ✅ Fixed  
**Location**: `frontend/src/pages/FamiliesPage.tsx` - `formatCurrency` function  
**Description**: TypeError when formatting undefined or string amounts  
**Resolution**: Added proper type checking and conversion

## Performance Issues

### 13. Multiple API Calls on Page Load
**Status**: 🔴 Active  
**Location**: `frontend/src/pages/FamiliesPage.tsx` - Component initialization  
**Description**: Multiple unnecessary API calls being made during page load  
**Evidence**: Network tab shows redundant requests

### 14. Stale State Management
**Status**: 🔴 Active  
**Location**: Multiple components - State management  
**Description**: Components not properly updating when parent state changes  
**Evidence**: UI shows old data until forced refresh

## Security Issues

### 15. None Currently Identified
**Status**: ✅ Clean  
**Description**: No security issues identified at this time

## Priority Levels

### 🔴 High Priority (Blocking)
- Auto-refresh not working (Bugs #1, #2, #3)
- Duplicate pledge creation (Bug #3)

### 🟡 Medium Priority (Inconvenient)
- Multiple API calls on page load (Bug #13)
- Stale state management (Bug #14)

### 🟢 Low Priority (Minor)
- None currently identified

## Recent Fixes (2025-09-08)

### ✅ Pledge Form Improvements
- **Added annual tag** to pledge cards for easy identification
- **Removed pledgedBy field** - no longer needed within single family context
- **Enhanced description field** - now supports both dropdown (Annual Membership, Kibbudim, Kiddush, Other) and free-text input
- **Default due date** - automatically set to one week before Rosh Hashana if not specified
- **Pledge Type selector** - Annual vs One Time with clear visual indicators
- **Status field** - Pending, Partial, Fulfilled, Overdue, Cancelled with color coding
- **Backend cleanup** - removed pledgedBy from entity, routes, and database schema

### ✅ Important Dates Layout Cleanup
- **Fixed card stacking issue** - cards now display in proper grid layout instead of stacking vertically
- **Improved form organization** - Additional Important Dates form now has clean, organized structure
- **Better visual separation** - Clear distinction between form input and saved dates display
- **Enhanced spacing** - Proper margins and padding for better visual hierarchy

### ✅ Additional Dates Edit Functionality
- **Added edit buttons** - Each saved additional date now has edit and delete buttons
- **Inline edit form** - Clicking edit shows a form with all the same fields as the add form
- **Auto-populate Hebrew dates** - Edit form maintains the same Hebrew date conversion logic
- **Save/Cancel actions** - Clear save and cancel buttons for edit operations
- **Delete functionality** - Users can delete saved additional dates with confirmation
- **State management** - Proper separation between form input and saved dates display

### ✅ Additional Dates Modal Dialog
- **Modal-based UI** - Replaced inline forms with professional modal dialog similar to other form dialogs
- **Consistent UX** - Modal follows the same design patterns as Family, Member, and Pledge forms
- **Clean interface** - Single "Add Additional Date" button opens modal for new dates
- **Edit functionality** - Edit buttons on saved dates open the same modal in edit mode
- **Form validation** - Proper validation with error messages and required field indicators
- **Auto-conversion** - Hebrew date auto-population when English date is selected
- **Responsive design** - Modal adapts to different screen sizes with proper grid layout

## Next Actions

1. **Investigate auto-refresh root cause** - Check if `refreshAllData` is properly updating state
2. **Fix duplicate pledge creation** - Ensure we're updating existing pledges, not creating new ones
3. **Optimize API calls** - Reduce redundant requests on page load
4. **Improve state management** - Ensure components update when data changes

## Testing Checklist

- [ ] Pledge editing updates UI immediately
- [ ] Financial summary updates without manual refresh
- [ ] No duplicate pledges created during edits
- [ ] All form operations trigger proper refresh
- [ ] Page load doesn't make redundant API calls

---

**Last Updated**: 2025-09-08  
**Total Bugs**: 15 (10 Fixed, 5 Active)
