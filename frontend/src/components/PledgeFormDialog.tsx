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
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  Box
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { HDate } from '@hebcal/core'

import { PledgeFormData, FamilyMember } from '../types'

interface PledgeFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (pledge: PledgeFormData) => void
  pledge?: PledgeFormData | null
  familyMembers: FamilyMember[]
  familyName: string
}

const PledgeFormDialog: React.FC<PledgeFormDialogProps> = ({
  open,
  onClose,
  onSave,
  pledge,
  familyMembers
}) => {
  const [formData, setFormData] = useState<PledgeFormData>({
    amount: 0,
    currency: 'NIS',
    description: '',
    customDescription: '',
    date: dayjs().format('YYYY-MM-DD'),
    isAnonymous: false,
    dueDate: '',
    donationDate: '',
    isAnnualPledge: false,
    status: 'pending',
    fulfilledAmount: 0,
    fulfilledDate: '',
    notes: '',
    connectedEvents: []
  })

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data when pledge prop changes
  useEffect(() => {
    if (!pledge) {
      // Reset form for new pledge
      setFormData({
        amount: 0,
        currency: 'NIS',
        description: '',
        customDescription: '',
        date: dayjs().format('YYYY-MM-DD'),
        isAnonymous: false,
        dueDate: getDefaultDueDate(),
        donationDate: '',
        isAnnualPledge: false,
        status: 'pending',
        fulfilledAmount: 0,
        fulfilledDate: '',
        notes: '',
        connectedEvents: []
      })
    } else {
      // Populate form for editing existing pledge
      // Check if description is a predefined option or custom
      const predefinedOptions = ['Annual Membership', 'Kibbudim', 'Kiddush', 'Other']
      const isPredefined = predefinedOptions.includes(pledge.description)
      
      setFormData({
        amount: pledge.amount,
        currency: pledge.currency,
        description: isPredefined ? pledge.description : 'Other',
        customDescription: isPredefined ? '' : pledge.description,
        date: pledge.date,
        isAnonymous: pledge.isAnonymous,
        dueDate: pledge.dueDate || '',
        donationDate: pledge.donationDate || '',
        isAnnualPledge: pledge.isAnnualPledge || false,
        status: pledge.status || 'pending',
        fulfilledAmount: pledge.fulfilledAmount || 0,
        fulfilledDate: pledge.fulfilledDate || '',
        notes: pledge.notes || '',
        connectedEvents: pledge.connectedEvents || []
      })
    }
    setError(null)
    setIsSubmitting(false)
  }, [pledge, familyMembers])


  const handleInputChange = (field: keyof PledgeFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // No automatic logic - all fields are manual
      if (field === 'description') {
        // Only clear custom description if switching away from "Other"
        if (value !== 'Other') {
          newData.customDescription = ''
        }
      }
      
      // Handle manual toggle of isAnnualPledge
      if (field === 'isAnnualPledge') {
        // No automatic logic - user controls everything manually
        // If user sets to false, they can choose to clear due date or keep it
        // If user sets to true, they can choose to set due date or leave it empty
      }
      
      return newData
    })
  }

  const addEvent = () => {
    const newEvent = {
      type: 'yahrzeit' as const,
      description: '',
      date: '',
      memberId: ''
    }
    setFormData(prev => ({
      ...prev,
      connectedEvents: [...(prev.connectedEvents || []), newEvent]
    }))
  }

  const removeEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      connectedEvents: prev.connectedEvents?.filter((_, i) => i !== index) || []
    }))
  }

  const handleEventChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      connectedEvents: prev.connectedEvents?.map((event, i) => 
        i === index ? { ...event, [field]: value } : event
      ) || []
    }))
  }

  // Reminder date calculation removed - all fields are now manual

  // Calculate default due date (one week before Rosh Hashana)
  const getDefaultDueDate = () => {
    const today = new HDate()
    const currentYear = today.getFullYear()
    
    // For 2025, we know Rosh Hashana 5786 is September 22, 2025
    const currentDate = new Date()
    
    let roshHashanaDate: Date
    
    if (currentDate.getFullYear() === 2025 && 
        (currentDate.getMonth() < 8 || (currentDate.getMonth() === 8 && currentDate.getDate() < 22))) {
      // We're still in Hebrew year 5785, next Rosh Hashana is Sep 22, 2025
      roshHashanaDate = new Date(2025, 8, 22) // September 22, 2025
    } else if (currentDate.getFullYear() === 2025 && 
               (currentDate.getMonth() > 8 || (currentDate.getMonth() === 8 && currentDate.getDate() >= 22))) {
      // We're in Hebrew year 5786, next Rosh Hashana is Sep 11, 2026
      roshHashanaDate = new Date(2026, 8, 11) // September 11, 2026
    } else {
      // Fallback to HDate calculation for other years
      const nextRoshHashana = new HDate(1, 1, currentYear + 1)
      roshHashanaDate = nextRoshHashana.greg()
    }
    
    // Subtract one week (7 days)
    const oneWeekBefore = new Date(roshHashanaDate)
    oneWeekBefore.setDate(roshHashanaDate.getDate() - 7)
    
    return dayjs(oneWeekBefore).format('YYYY-MM-DD')
  }

  // Get current Hebrew year range (Rosh Hashana to Rosh Hashana)
  const getCurrentHebrewYearRange = () => {
    const today = new HDate()
    const currentYear = today.getFullYear()
    
    // For 2025, we know Rosh Hashana 5786 is September 22, 2025
    // and Rosh Hashana 5785 was September 15, 2024
    const currentDate = new Date()
    
    // Check if we're in 2025 and before September 22 (Rosh Hashana 5786)
    if (currentDate.getFullYear() === 2025 && 
        (currentDate.getMonth() < 8 || (currentDate.getMonth() === 8 && currentDate.getDate() < 22))) {
      // We're still in Hebrew year 5785
      return {
        start: '2024-09-15', // Rosh Hashana 5785
        end: '2025-09-22',   // Rosh Hashana 5786
        hebrewYear: 5785
      }
    } else if (currentDate.getFullYear() === 2025 && 
               (currentDate.getMonth() > 8 || (currentDate.getMonth() === 8 && currentDate.getDate() >= 22))) {
      // We're in Hebrew year 5786
      return {
        start: '2025-09-22', // Rosh Hashana 5786
        end: '2026-09-11',   // Rosh Hashana 5787
        hebrewYear: 5786
      }
    } else {
      // Fallback to HDate calculation for other years
      const roshHashana = new HDate(1, 1, currentYear)
      const roshHashanaGregorian = roshHashana.greg()
      
      const nextRoshHashana = new HDate(1, 1, currentYear + 1)
      const nextRoshHashanaGregorian = nextRoshHashana.greg()
      
      return {
        start: dayjs(roshHashanaGregorian).format('YYYY-MM-DD'),
        end: dayjs(nextRoshHashanaGregorian).format('YYYY-MM-DD'),
        hebrewYear: currentYear
      }
    }
  }

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('🚫 SUBMISSION BLOCKED - Already submitting')
      return
    }

    if (!formData.amount || !formData.description) {
      setError('Amount and pledge type are required.')
      return
    }
    
    if (formData.description === 'Other' && !formData.customDescription) {
      setError('Custom description is required when selecting "Other".')
      return
    }

    // Prepare the final form data with proper description
    const finalFormData = {
      ...formData,
      description: formData.description === 'Other' ? (formData.customDescription || '') : (formData.description || '')
    }

    console.log('Submitting pledge form data:', finalFormData)
    console.log('🔍 IS ANNUAL PLEDGE DEBUG:', {
      formDataIsAnnualPledge: formData.isAnnualPledge,
      finalFormDataIsAnnualPledge: finalFormData.isAnnualPledge,
      description: formData.description,
      customDescription: formData.customDescription
    })
    console.log('Family members available:', familyMembers)

    setIsSubmitting(true)
    setError(null)

    try {
      onSave(finalFormData)
      onClose()
    } catch (error: any) {
      console.error('Error saving pledge:', error)
      setError('Failed to save pledge. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: '#4A148C', color: 'white', textAlign: 'center' }}>
        {pledge ? 'Edit Pledge' : 'Add New Pledge'}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
          Pledge Details
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount *"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Currency *</InputLabel>
              <Select
                value={formData.currency}
                label="Currency *"
                onChange={(e) => handleInputChange('currency', e.target.value)}
              >
                <MenuItem value="NIS">NIS (₪)</MenuItem>
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Pledge Type *</InputLabel>
              <Select
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                label="Pledge Type *"
              >
                <MenuItem value="Annual Membership">Annual Membership</MenuItem>
                <MenuItem value="Kibbudim">Kibbudim</MenuItem>
                <MenuItem value="Kiddush">Kiddush</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {formData.description === 'Other' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Description *"
                value={formData.customDescription || ''}
                onChange={(e) => handleInputChange('customDescription', e.target.value)}
                required
                multiline
                rows={2}
                placeholder="Enter custom pledge description"
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Pledger Information */}
        <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
          Pledger Information
        </Typography>
        
        {/* Pledge Status Information */}
        <Box sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 1, bgcolor: '#F8F9FA' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
            Pledge Status Definitions:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • <strong>Pending</strong>: Pledge made, payment not yet received
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • <strong>Partial</strong>: Partial payment received, balance outstanding
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • <strong>Fulfilled</strong>: Full payment received
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • <strong>Overdue</strong>: Payment past due date
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • <strong>Cancelled</strong>: Pledge cancelled or withdrawn
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        {/* Fulfillment Tracking */}
        {formData.status === 'partial' && (
          <Box sx={{ mb: 2, p: 2, border: '1px solid #FF9800', borderRadius: 1, bgcolor: '#FFF3E0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, color: '#E65100' }}>
              Partial Payment Details:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount Received"
                  type="number"
                  value={formData.fulfilledAmount || ''}
                  onChange={(e) => handleInputChange('fulfilledAmount', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01, max: formData.amount }}
                  helperText={`Out of ${formData.amount} ${formData.currency}`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Payment Date"
                    value={formData.fulfilledDate ? dayjs(formData.fulfilledDate) : null}
                    onChange={(date) => handleInputChange('fulfilledDate', date ? date.format('YYYY-MM-DD') : '')}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {formData.status === 'fulfilled' && (
          <Box sx={{ mb: 2, p: 2, border: '1px solid #4CAF50', borderRadius: 1, bgcolor: '#E8F5E8' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, color: '#2E7D32' }}>
              Payment Complete:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount Received"
                  type="number"
                  value={formData.fulfilledAmount || formData.amount}
                  onChange={(e) => handleInputChange('fulfilledAmount', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Payment Date"
                    value={formData.fulfilledDate ? dayjs(formData.fulfilledDate) : null}
                    onChange={(date) => handleInputChange('fulfilledDate', date ? date.format('YYYY-MM-DD') : '')}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        )}
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Pledge Type</InputLabel>
              <Select
                value={formData.isAnnualPledge ? 'annual' : 'onetime'}
                label="Pledge Type"
                onChange={(e) => handleInputChange('isAnnualPledge', e.target.value === 'annual')}
              >
                <MenuItem value="annual">🔄 Annual</MenuItem>
                <MenuItem value="onetime">📅 One Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Pledge Status</InputLabel>
              <Select
                value={formData.status || 'pending'}
                label="Pledge Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="pending">🟡 Pending</MenuItem>
                <MenuItem value="partial">🟠 Partial</MenuItem>
                <MenuItem value="fulfilled">🟢 Fulfilled</MenuItem>
                <MenuItem value="overdue">🔴 Overdue</MenuItem>
                <MenuItem value="cancelled">⚫ Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                />
              }
              label="Anonymous Pledge"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Dates */}
        <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
          Pledge Dates
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Pledge Date *"
                value={dayjs(formData.date)}
                onChange={(date) => handleInputChange('date', date ? date.format('YYYY-MM-DD') : '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date of Donation (Optional)"
                value={formData.donationDate ? dayjs(formData.donationDate) : null}
                onChange={(date) => handleInputChange('donationDate', date ? date.format('YYYY-MM-DD') : '')}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date (Optional)"
                value={formData.dueDate ? dayjs(formData.dueDate) : null}
                onChange={(date) => handleInputChange('dueDate', date ? date.format('YYYY-MM-DD') : '')}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Annual Pledge Information */}
        <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
          Annual Pledge Information (Optional)
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Hebrew Year: {getCurrentHebrewYearRange().hebrewYear} 
              ({getCurrentHebrewYearRange().start} to {getCurrentHebrewYearRange().end})
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAnnualPledge || false}
                  onChange={(e) => handleInputChange('isAnnualPledge', e.target.checked)}
                />
              }
              label="This is an annual pledge (renews each Hebrew year)"
            />
            
            {formData.isAnnualPledge && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 1, bgcolor: '#F8F9FA' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Annual pledges automatically renew each Hebrew year from Rosh Hashana to Rosh Hashana
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Next renewal: {getCurrentHebrewYearRange().end}
                </Typography>
                {/* Reminder date calculation removed - all fields are now manual */}
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Event Connections */}
        <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
          Connect to Important Events (Optional)
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect this pledge to specific events like Yahrzeits, birthdays, or anniversaries
            </Typography>
            
            {/* Event Connection List */}
            {(formData.connectedEvents || []).map((event, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        value={event.type}
                        label="Event Type"
                        onChange={(e) => handleEventChange(index, 'type', e.target.value)}
                      >
                        <MenuItem value="yahrzeit">Yahrzeit</MenuItem>
                        <MenuItem value="birthday">Birthday</MenuItem>
                        <MenuItem value="anniversary">Anniversary</MenuItem>
                        <MenuItem value="siyum">Siyum</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={event.description}
                      onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                      placeholder="e.g., Father's Yahrzeit"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Date Type</InputLabel>
                      <Select
                        value={event.dateType || 'gregorian'}
                        label="Date Type"
                        onChange={(e) => handleEventChange(index, 'dateType', e.target.value)}
                      >
                        <MenuItem value="gregorian">Gregorian</MenuItem>
                        <MenuItem value="hebrew">Hebrew</MenuItem>
                        <MenuItem value="family_event">Family Event</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    {event.dateType === 'gregorian' && (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Event Date"
                          value={event.date ? dayjs(event.date) : null}
                          onChange={(date) => handleEventChange(index, 'date', date ? date.format('YYYY-MM-DD') : '')}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true
                            }
                          }}
                        />
                      </LocalizationProvider>
                    )}
                    {event.dateType === 'hebrew' && (
                      <TextField
                        fullWidth
                        size="small"
                        label="Hebrew Date"
                        value={event.hebrewDate || ''}
                        onChange={(e) => handleEventChange(index, 'hebrewDate', e.target.value)}
                        placeholder="e.g., 15 Tishrei 5785"
                        helperText="Enter Hebrew date (e.g., 15 Tishrei 5785)"
                      />
                    )}
                    {event.dateType === 'family_event' && (
                      <FormControl fullWidth size="small">
                        <InputLabel>Family Event</InputLabel>
                        <Select
                          value={event.familyEventId || ''}
                          label="Family Event"
                          onChange={(e) => handleEventChange(index, 'familyEventId', e.target.value)}
                        >
                          <MenuItem value="">-- Select Event --</MenuItem>
                          {familyMembers.map((member) => (
                            <React.Fragment key={member.id}>
                              {member.dateOfBirth && (
                                <MenuItem value={`birthday_${member.id}`}>
                                  {member.firstName} {member.lastName} - Birthday
                                </MenuItem>
                              )}
                              {member.dateOfDeath && (
                                <MenuItem value={`yahrzeit_${member.id}`}>
                                  {member.firstName} {member.lastName} - Yahrzeit
                                </MenuItem>
                              )}
                            </React.Fragment>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Member</InputLabel>
                      <Select
                        value={event.memberId || ''}
                        label="Member"
                        onChange={(e) => handleEventChange(index, 'memberId', e.target.value)}
                      >
                        <MenuItem value="">-- Select --</MenuItem>
                        {familyMembers.map((member) => (
                          <MenuItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <Button
                      size="small"
                      onClick={() => removeEvent(index)}
                      sx={{ color: '#E53935' }}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            <Button
              variant="outlined"
              onClick={addEvent}
              sx={{ color: '#6A1B9A', borderColor: '#6A1B9A' }}
            >
              + Add Event Connection
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Additional Information */}
        <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
          Additional Information
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              multiline
              rows={3}
              placeholder="Any additional details about this pledge..."
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !formData.amount || !formData.description || (formData.description === 'Other' && !formData.customDescription)}
          sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            pledge ? 'Update Pledge' : 'Add Pledge'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PledgeFormDialog
