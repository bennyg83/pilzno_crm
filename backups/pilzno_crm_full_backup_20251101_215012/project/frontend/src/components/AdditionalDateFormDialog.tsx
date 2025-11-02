/**
 * AdditionalDateFormDialog Component
 * 
 * A modal dialog for adding and editing additional important dates for families.
 * This component provides a clean, professional interface for managing dates like
 * wedding anniversaries, aliyah anniversaries, and other custom important dates.
 * 
 * Features:
 * - Modal-based UI consistent with other form dialogs in the system
 * - Auto-conversion from Gregorian to Hebrew dates using @hebcal/core
 * - Form validation with clear error messages
 * - Support for different date types (wedding, aliyah, other)
 * - Member selection for dates that require a specific family member
 * - Responsive design that adapts to different screen sizes
 * 
 * @author Pilzno CRM Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { HDate } from '@hebcal/core'

import { FamilyMember } from '../types'

/**
 * Form data structure for additional important dates
 * 
 * @interface AdditionalDateFormData
 * @property {string} id - Unique identifier for the date (empty for new dates)
 * @property {'wedding_anniversary' | 'aliyah_anniversary' | 'other'} type - Type of important date
 * @property {string} description - Custom description for "other" type dates
 * @property {string} englishDate - Gregorian date in YYYY-MM-DD format
 * @property {string} hebrewDate - Hebrew date in readable format (e.g., "15 Nissan 5740")
 * @property {string} memberId - ID of the family member associated with this date
 * @property {string} memberName - Display name of the family member
 */
interface AdditionalDateFormData {
  id: string
  type: 'wedding_anniversary' | 'aliyah_anniversary' | 'other'
  description: string
  englishDate: string
  hebrewDate: string
  memberId: string
  memberName: string
}

/**
 * Props interface for the AdditionalDateFormDialog component
 * 
 * @interface AdditionalDateFormDialogProps
 * @property {boolean} open - Controls whether the modal dialog is visible
 * @property {() => void} onClose - Callback function called when the modal is closed
 * @property {(date: AdditionalDateFormData) => void} onSave - Callback function called when the form is submitted
 * @property {AdditionalDateFormData | null} [date] - Optional existing date data for editing mode
 * @property {FamilyMember[]} familyMembers - Array of family members for member selection
 * @property {string} familyName - Name of the family for display purposes
 */
interface AdditionalDateFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (date: AdditionalDateFormData) => void
  date?: AdditionalDateFormData | null
  familyMembers: FamilyMember[]
  familyName: string
}

/**
 * AdditionalDateFormDialog - Modal dialog for managing additional important dates
 * 
 * This component provides a comprehensive form for adding and editing additional
 * important dates for families. It handles both new date creation and existing
 * date editing with proper form validation and user feedback.
 * 
 * @param {AdditionalDateFormDialogProps} props - Component props
 * @returns {JSX.Element} The rendered modal dialog
 */
const AdditionalDateFormDialog: React.FC<AdditionalDateFormDialogProps> = ({
  open,
  onClose,
  onSave,
  date,
  familyMembers,
  familyName
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Form data state - holds all the form input values
   * This state is reset when the modal opens/closes or when switching between add/edit modes
   */
  const [formData, setFormData] = useState<AdditionalDateFormData>({
    id: '',
    type: 'wedding_anniversary',
    description: '',
    englishDate: '',
    hebrewDate: '',
    memberId: '',
    memberName: ''
  })

  /**
   * Error message state - displays validation errors to the user
   * Cleared when the form is successfully submitted or when the modal is closed
   */
  const [error, setError] = useState<string | null>(null)

  /**
   * Submission state - prevents duplicate form submissions
   * Shows loading spinner on submit button when true
   */
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  /**
   * Initialize form data when the date prop changes
   * 
   * This effect runs whenever the 'date' prop changes, which happens when:
   * - Opening the modal for a new date (date = null)
   * - Opening the modal for editing an existing date (date = existing date object)
   * - Switching between add and edit modes
   * 
   * The effect ensures the form is properly reset for new dates or populated
   * with existing data for editing, and clears any previous error states.
   */
  useEffect(() => {
    if (!date) {
      // Reset form for new date - clear all fields and set defaults
      setFormData({
        id: '',
        type: 'wedding_anniversary',
        description: '',
        englishDate: '',
        hebrewDate: '',
        memberId: '',
        memberName: ''
      })
    } else {
      // Populate form for editing existing date - load all existing values
      setFormData({
        id: date.id,
        type: date.type,
        description: date.description,
        englishDate: date.englishDate,
        hebrewDate: date.hebrewDate,
        memberId: date.memberId,
        memberName: date.memberName
      })
    }
    // Clear any previous error states and reset submission flag
    setError(null)
    setIsSubmitting(false)
  }, [date])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Convert a Gregorian date to Hebrew date format
   * 
   * This function uses the @hebcal/core library to convert a dayjs date object
   * to a Hebrew date string in a readable format (e.g., "15 Nissan 5740").
   * 
   * @param {dayjs.Dayjs} date - The Gregorian date to convert
   * @returns {string} The Hebrew date in readable format, or empty string if conversion fails
   */
  const convertToHebrewDate = (date: dayjs.Dayjs) => {
    try {
      const hebrewDate = new HDate(date.toDate())
      const hebrewYear = hebrewDate.getFullYear()
      const hebrewMonth = hebrewDate.getMonthName()
      const hebrewDay = hebrewDate.getDate()
      return `${hebrewDay} ${hebrewMonth} ${hebrewYear}`
    } catch (error) {
      console.error('Error converting to Hebrew date:', error)
      return ''
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle input field changes with automatic side effects
   * 
   * This function handles all form input changes and includes automatic logic for:
   * - Converting English dates to Hebrew dates when an English date is entered
   * - Clearing Hebrew dates when English dates are cleared
   * - Auto-populating member names when a member is selected
   * 
   * @param {keyof AdditionalDateFormData} field - The field being changed
   * @param {any} value - The new value for the field
   */
  const handleInputChange = (field: keyof AdditionalDateFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-populate Hebrew date when English date is provided
      if (field === 'englishDate' && value) {
        try {
          const englishDate = dayjs(value)
          if (englishDate.isValid()) {
            const hebrewDate = convertToHebrewDate(englishDate)
            newData.hebrewDate = hebrewDate
          }
        } catch (error) {
          console.error('Error converting date:', error)
        }
      } else if (field === 'englishDate' && !value) {
        // Clear Hebrew date if English date is cleared
        newData.hebrewDate = ''
      }
      
      // Auto-populate member name when member is selected
      if (field === 'memberId') {
        const member = familyMembers.find(m => m.id === value)
        newData.memberName = member ? `${member.firstName} ${member.lastName}` : ''
      }
      
      return newData
    })
  }

  /**
   * Handle form submission with comprehensive validation
   * 
   * This function performs client-side validation before submitting the form:
   * - Prevents duplicate submissions with isSubmitting flag
   * - Validates required fields based on date type
   * - Shows appropriate error messages for validation failures
   * - Calls the onSave callback with form data on successful validation
   * - Handles errors gracefully with user feedback
   * 
   * Validation rules:
   * - Date type is always required
   * - English date is always required
   * - Member selection is required for aliyah_anniversary and other types
   * - Description is required for "other" type dates
   */
  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      return
    }

    // ============================================================================
    // CLIENT-SIDE VALIDATION
    // ============================================================================
    
    // Validate date type selection
    if (!formData.type) {
      setError('Date type is required.')
      return
    }

    // Validate English date entry
    if (!formData.englishDate) {
      setError('English date is required.')
      return
    }

    // Validate member selection for date types that require it
    if ((formData.type === 'aliyah_anniversary' || formData.type === 'other') && !formData.memberId) {
      setError('Family member is required for this date type.')
      return
    }

    // Validate description for "other" type dates
    if (formData.type === 'other' && !formData.description) {
      setError('Description is required for "Other" date type.')
      return
    }

    // ============================================================================
    // FORM SUBMISSION
    // ============================================================================
    
    // Set submission state and clear any previous errors
    setIsSubmitting(true)
    setError(null)

    try {
      // Call the parent component's save handler
      onSave(formData)
      // Close the modal on successful save
      onClose()
    } catch (error: any) {
      console.error('Error saving additional date:', error)
      setError('Failed to save additional date. Please try again.')
    } finally {
      // Always reset submission state, even if there was an error
      setIsSubmitting(false)
    }
  }


  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      // Disable backdrop click to prevent accidental closes during form filling
      disableEscapeKeyDown={isSubmitting}
    >
      {/* Modal Header - Purple theme consistent with other dialogs */}
      <DialogTitle sx={{ bgcolor: '#6A1B9A', color: 'white', textAlign: 'center' }}>
        {date ? 'Edit Additional Date' : 'Add Additional Date'}
      </DialogTitle>
      
      {/* Modal Content - Form fields and validation */}
      <DialogContent sx={{ p: 3 }}>
        {/* Error Alert - Shows validation errors to the user */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Instructions - Helpful text explaining the form's purpose */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add an important date for the {familyName} family.
        </Typography>

        {/* Form Fields Grid - Responsive layout for all form inputs */}
        <Grid container spacing={3}>
          {/* Date Type Selection - Required field for all dates */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Date Type</InputLabel>
              <Select
                value={formData.type}
                label="Date Type"
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <MenuItem value="wedding_anniversary">Wedding Anniversary</MenuItem>
                <MenuItem value="aliyah_anniversary">Aliyah Anniversary</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Member Selection - Required for Aliyah and Other date types */}
          {(formData.type === 'aliyah_anniversary' || formData.type === 'other') && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Family Member</InputLabel>
                <Select
                  value={formData.memberId}
                  label="Family Member"
                  onChange={(e) => handleInputChange('memberId', e.target.value)}
                >
                  <MenuItem value="">-- Select Member --</MenuItem>
                  {familyMembers.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Custom Description - Required for "Other" date types */}
          {formData.type === 'other' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                placeholder="e.g., Bar Mitzvah, Special Event"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </Grid>
          )}

          {/* English Date Picker - Required field with date picker component */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="English Date"
                value={formData.englishDate ? dayjs(formData.englishDate) : null}
                onChange={(newValue) => {
                  const dateString = newValue ? newValue.format('YYYY-MM-DD') : ''
                  handleInputChange('englishDate', dateString)
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Hebrew Date Field - Auto-populated but editable */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hebrew Date"
              placeholder="e.g., 15 Nissan 5740"
              value={formData.hebrewDate}
              onChange={(e) => handleInputChange('hebrewDate', e.target.value)}
              helperText="Auto-populated from English date (can be overridden)"
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Modal Actions - Cancel and Submit buttons */}
      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        {/* Cancel Button - Closes modal without saving */}
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ color: '#6A1B9A', borderColor: '#6A1B9A' }}
        >
          Cancel
        </Button>
        
        {/* Submit Button - Saves the form data */}
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            date ? 'Update Date' : 'Add Date'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * Export the AdditionalDateFormDialog component as the default export
 * 
 * This component is used throughout the application for managing additional
 * important dates for families. It provides a consistent, professional
 * interface that matches the design patterns of other form dialogs in the system.
 */
export default AdditionalDateFormDialog
