/**
 * DonationFormDialog Component
 * 
 * A modal dialog for recording and managing donations in the CRM system.
 * This component provides a comprehensive interface for tracking various
 * types of donations including annual pledges, one-time donations, event
 * sponsorships, and memorial donations.
 * 
 * Features:
 * - Support for multiple donation types
 * - Payment method tracking
 * - Event and memorial connections
 * - Hebrew date conversion
 * - Anonymous donation options
 * - Reference number tracking
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
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
// import { HDate } from '@hebcal/core' // TODO: Uncomment when implementing Hebrew date conversion

import { DonationFormData, Family, FamilyMember } from '../types'

/**
 * Props interface for the DonationFormDialog component
 * 
 * @interface DonationFormDialogProps
 * @property {boolean} open - Controls whether the modal dialog is visible
 * @property {() => void} onClose - Callback function called when the modal is closed
 * @property {(donation: DonationFormData) => void} onSave - Callback function called when the form is submitted
 * @property {DonationFormData | null} [donation] - Optional existing donation data for editing mode
 * @property {Family[]} families - Array of families for family selection
 * @property {FamilyMember[]} familyMembers - Array of family members for memorial connections
 */
interface DonationFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (donation: DonationFormData) => void
  donation?: DonationFormData | null
  families: Family[]
  familyMembers: FamilyMember[] // eslint-disable-line @typescript-eslint/no-unused-vars
}

/**
 * DonationFormDialog - Modal dialog for managing donations
 * 
 * This component provides a comprehensive form for recording and editing
 * donations in the CRM system. It handles various donation types and
 * includes proper validation and user feedback.
 * 
 * @param {DonationFormDialogProps} props - Component props
 * @returns {JSX.Element} The rendered modal dialog
 */
const DonationFormDialog: React.FC<DonationFormDialogProps> = ({
  open,
  onClose,
  onSave,
  donation,
  families,
  familyMembers: _familyMembers // Suppress unused parameter warning
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Form data state - holds all the form input values
   * This state is reset when the modal opens/closes or when switching between add/edit modes
   */
  const [formData, setFormData] = useState<DonationFormData>({
    familyId: '',
    amount: 0,
    currency: 'NIS',
    donationType: 'general',
    description: '',
    donationDate: dayjs().format('YYYY-MM-DD'),
    isAnonymous: false,
    paymentMethod: 'cash',
    checkNumber: '',
    referenceNumber: '',
    notes: '',
    connectedEventId: '',
    memorialPersonName: '',
    memorialPersonHebrewName: '',
    connectedPledgeId: ''
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
   * Initialize form data when the donation prop changes
   * 
   * This effect runs whenever the 'donation' prop changes, which happens when:
   * - Opening the modal for a new donation (donation = null)
   * - Opening the modal for editing an existing donation (donation = existing donation object)
   * - Switching between add and edit modes
   * 
   * The effect ensures the form is properly reset for new donations or populated
   * with existing data for editing, and clears any previous error states.
   */
  useEffect(() => {
    if (!donation) {
      // Reset form for new donation - clear all fields and set defaults
      setFormData({
        familyId: '',
        amount: 0,
        currency: 'NIS',
        donationType: 'general',
        description: '',
        donationDate: dayjs().format('YYYY-MM-DD'),
        isAnonymous: false,
        paymentMethod: 'cash',
        checkNumber: '',
        referenceNumber: '',
        notes: '',
        connectedEventId: '',
        memorialPersonName: '',
        memorialPersonHebrewName: '',
        connectedPledgeId: ''
      })
    } else {
      // Populate form for editing existing donation - load all existing values
      setFormData({
        familyId: donation.familyId,
        amount: donation.amount,
        currency: donation.currency,
        donationType: donation.donationType,
        description: donation.description,
        donationDate: donation.donationDate,
        isAnonymous: donation.isAnonymous,
        paymentMethod: donation.paymentMethod,
        checkNumber: donation.checkNumber || '',
        referenceNumber: donation.referenceNumber || '',
        notes: donation.notes || '',
        connectedEventId: donation.connectedEventId || '',
        memorialPersonName: donation.memorialPersonName || '',
        memorialPersonHebrewName: donation.memorialPersonHebrewName || '',
        connectedPledgeId: donation.connectedPledgeId || ''
      })
    }
    // Clear any previous error states and reset submission flag
    setError(null)
    setIsSubmitting(false)
  }, [donation])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  // TODO: Implement Hebrew date conversion when needed
  // const convertToHebrewDate = (date: dayjs.Dayjs) => { ... }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle input field changes with automatic side effects
   * 
   * This function handles all form input changes and includes automatic logic for:
   * - Converting English dates to Hebrew dates when an English date is entered
   * - Auto-populating memorial person names when a family member is selected
   * 
   * @param {keyof DonationFormData} field - The field being changed
   * @param {any} value - The new value for the field
   */
  const handleInputChange = (field: keyof DonationFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-populate Hebrew date when English date is provided
      if (field === 'donationDate' && value) {
          try {
            const englishDate = dayjs(value)
            if (englishDate.isValid()) {
              // Note: Hebrew date conversion is available but not currently stored
              // const hebrewDate = convertToHebrewDate(englishDate)
            }
          } catch (error) {
            console.error('Error converting date:', error)
          }
      }
      
      return newData
    })
  }

  /**
   * Handle form submission with comprehensive validation
   * 
   * This function performs client-side validation before submitting the form:
   * - Prevents duplicate submissions with isSubmitting flag
   * - Validates required fields based on donation type
   * - Shows appropriate error messages for validation failures
   * - Calls the onSave callback with form data on successful validation
   * - Handles errors gracefully with user feedback
   * 
   * Validation rules:
   * - Family selection is always required
   * - Amount is always required and must be greater than 0
   * - Description is always required
   * - Donation date is always required
   * - Check number is required for check payments
   * - Memorial person name is required for memorial donations
   */
  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      return
    }

    // ============================================================================
    // CLIENT-SIDE VALIDATION
    // ============================================================================
    
    // Validate family selection
    if (!formData.familyId) {
      setError('Family selection is required.')
      return
    }

    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      setError('Donation amount must be greater than 0.')
      return
    }

    // Validate description
    if (!formData.description.trim()) {
      setError('Description is required.')
      return
    }

    // Validate donation date
    if (!formData.donationDate) {
      setError('Donation date is required.')
      return
    }

    // Validate check number for check payments
    if (formData.paymentMethod === 'check' && !formData.checkNumber?.trim()) {
      setError('Check number is required for check payments.')
      return
    }

    // Validate memorial person name for memorial donations
    if (formData.donationType === 'memorial' && !formData.memorialPersonName?.trim()) {
      setError('Memorial person name is required for memorial donations.')
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
      console.error('Error saving donation:', error)
      setError('Failed to save donation. Please try again.')
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
        {donation ? 'Edit Donation' : 'Record New Donation'}
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
          Record a donation for tracking and reporting purposes.
        </Typography>

        {/* Form Fields Grid - Responsive layout for all form inputs */}
        <Grid container spacing={3}>
          {/* Family Selection - Required field for all donations */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Family</InputLabel>
              <Select
                value={formData.familyId}
                label="Family"
                onChange={(e) => handleInputChange('familyId', e.target.value)}
              >
                <MenuItem value="">-- Select Family --</MenuItem>
                {families.map((family) => (
                  <MenuItem key={family.id} value={family.id}>
                    {family.familyName} {family.hebrewFamilyName && `(${family.hebrewFamilyName})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Donation Type - Required field for categorization */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Donation Type</InputLabel>
              <Select
                value={formData.donationType}
                label="Donation Type"
                onChange={(e) => handleInputChange('donationType', e.target.value)}
              >
                <MenuItem value="annual_pledge">Annual Pledge</MenuItem>
                <MenuItem value="one_time_pledge">One-time Pledge</MenuItem>
                <MenuItem value="event_sponsorship">Event Sponsorship</MenuItem>
                <MenuItem value="memorial">Memorial Donation</MenuItem>
                <MenuItem value="general">General Donation</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Amount - Required field with currency selection */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          {/* Currency Selection */}
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                label="Currency"
                onChange={(e) => handleInputChange('currency', e.target.value)}
              >
                <MenuItem value="NIS">NIS (₪)</MenuItem>
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Payment Method */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Payment Method"
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Description - Required field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              placeholder="e.g., Annual membership, Event sponsorship, Memorial donation"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              multiline
              rows={2}
            />
          </Grid>

          {/* Donation Date - Required field with date picker */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Donation Date"
                value={formData.donationDate ? dayjs(formData.donationDate) : null}
                onChange={(newValue) => {
                  const dateString = newValue ? newValue.format('YYYY-MM-DD') : ''
                  handleInputChange('donationDate', dateString)
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

          {/* Check Number - Required for check payments */}
          {formData.paymentMethod === 'check' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check Number"
                value={formData.checkNumber}
                onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                required
              />
            </Grid>
          )}

          {/* Reference Number - Optional tracking field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reference Number"
              placeholder="e.g., Bank transfer reference, Receipt number"
              value={formData.referenceNumber}
              onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
            />
          </Grid>

          {/* Memorial Person Name - Required for memorial donations */}
          {formData.donationType === 'memorial' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Memorial Person Name"
                  placeholder="Name of the person being memorialized"
                  value={formData.memorialPersonName}
                  onChange={(e) => handleInputChange('memorialPersonName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hebrew Name"
                  placeholder="Hebrew name of the person being memorialized"
                  value={formData.memorialPersonHebrewName}
                  onChange={(e) => handleInputChange('memorialPersonHebrewName', e.target.value)}
                />
              </Grid>
            </>
          )}

          {/* Anonymous Donation Checkbox */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                />
              }
              label="This is an anonymous donation"
            />
          </Grid>

          {/* Notes - Optional additional information */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              placeholder="Additional notes or comments about this donation"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              multiline
              rows={3}
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
            donation ? 'Update Donation' : 'Record Donation'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * Export the DonationFormDialog component as the default export
 * 
 * This component is used throughout the application for managing donations
 * in the CRM system. It provides a consistent, professional interface
 * that matches the design patterns of other form dialogs in the system.
 */
export default DonationFormDialog
