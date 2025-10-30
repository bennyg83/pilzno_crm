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
import { EventSponsorship } from '../types'

interface EventSponsorshipDialogProps {
  open: boolean
  onClose: () => void
  onSave: (sponsorship: EventSponsorship) => void
  sponsorship?: EventSponsorship | null
  familyId: string
  familyName: string
}

const EventSponsorshipDialog: React.FC<EventSponsorshipDialogProps> = ({
  open,
  onClose,
  onSave,
  sponsorship,
  familyId,
  familyName
}) => {
  const [formData, setFormData] = useState<Partial<EventSponsorship>>({
    eventType: 'kiddush',
    eventName: '',
    eventDate: '',
    description: '',
    amount: 0,
    currency: 'USD',
    familyId: familyId,
    sponsoredBy: '',
    status: 'planned',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form data when sponsorship prop changes
  useEffect(() => {
    if (sponsorship) {
      setFormData({
        ...sponsorship,
        eventDate: sponsorship.eventDate || ''
      })
    } else {
      // Reset form for new sponsorship
      setFormData({
        eventType: 'kiddush',
        eventName: '',
        eventDate: '',
        description: '',
        amount: 0,
        currency: 'USD',
        familyId: familyId,
        sponsoredBy: '',
        status: 'planned',
        notes: ''
      })
    }
    setError(null)
  }, [sponsorship, familyId])

  const handleInputChange = (field: keyof EventSponsorship, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.eventName || !formData.eventDate) {
      setError('Event name and date are required.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const sponsorshipData: EventSponsorship = {
        id: sponsorship?.id || `temp-${Date.now()}`,
        eventType: formData.eventType || 'kiddush',
        eventName: formData.eventName || '',
        eventDate: formData.eventDate || '',
        description: formData.description || '',
        amount: formData.amount || 0,
        currency: formData.currency || 'USD',
        familyId: familyId,
        sponsoredBy: formData.sponsoredBy || '',
        status: formData.status || 'planned',
        notes: formData.notes || ''
      }

      onSave(sponsorshipData)
      onClose()
    } catch (error: any) {
      console.error('Error saving sponsorship:', error)
      setError('Failed to save sponsorship. Please try again.')
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
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#6A1B9A', color: 'white' }}>
        {sponsorship ? 'Edit Event Sponsorship' : 'New Event Sponsorship'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Family: <strong>{familyName}</strong>
          </Typography>

          {/* Event Information */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
            Event Information
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.eventType || 'kiddush'}
                  label="Event Type"
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                >
                  <MenuItem value="kiddush">Kiddush</MenuItem>
                  <MenuItem value="seudah">Seudah</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Name *"
                value={formData.eventName || ''}
                onChange={(e) => handleInputChange('eventName', e.target.value)}
                required
                placeholder="e.g., Shabbat Kiddush, Bar Mitzvah Seudah"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Event Date *"
                value={formData.eventDate}
                onChange={(date) => handleInputChange('eventDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sponsored By"
                value={formData.sponsoredBy || ''}
                onChange={(e) => handleInputChange('sponsoredBy', e.target.value)}
                placeholder="e.g., Cohen Family, In Memory of..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional details about the event..."
              />
            </Grid>
          </Grid>

          {/* Financial Information */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
            Financial Information
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency || 'USD'}
                  label="Currency"
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="NIS">NIS (₪)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Status and Notes */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
            Status & Notes
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'planned'}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="planned">Planned</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes, special requirements, etc."
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !formData.eventName || !formData.eventDate}
          sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            sponsorship ? 'Update Sponsorship' : 'Create Sponsorship'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EventSponsorshipDialog
