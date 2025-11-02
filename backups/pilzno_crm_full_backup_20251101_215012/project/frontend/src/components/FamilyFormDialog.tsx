import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Alert
} from '@mui/material'
import {
  Add,
  Delete,
  Star,
  Group,
  Phone,
  Email,
  Home,
  MonetizationOn,
  Description
} from '@mui/icons-material'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { HDate } from '@hebcal/core'
import { Family, FamilyFormData } from '../types'

interface FamilyFormDialogProps {
  open: boolean
  onClose: () => void
  family: Family | null
  onSave?: (data: FamilyFormData) => void
}

// Default form values - moved outside component to prevent recreation
const defaultValues: FamilyFormData = {
  familyName: '',
  hebrewFamilyName: '',
  membershipStatus: 'prospective' as const,
  primaryEmail: '',
  secondaryEmail: '',
  phone: '',
  emergencyContact: '',
  receiveNewsletter: true,
  receiveEventNotifications: true,
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Israel', // Default to Israel
  currency: 'NIS' as const,   // Default to NIS for Israel
  annualPledge: 0,
  membershipStartDate: '',
  membershipEndDate: '',
  pledges: [],
  dietaryRestrictions: '',
  specialNeeds: '',
  familyNotes: '',
  isFoundingFamily: false,
  isBoardFamily: false
}

const FamilyFormDialog: React.FC<FamilyFormDialogProps> = ({ open, onClose, family, onSave }) => {
  const [currentTab, setCurrentTab] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FamilyFormData>({
    defaultValues
  })

  const { fields: pledgeFields, append: addPledge, remove: removePledge } = useFieldArray({
    control,
    name: 'pledges'
  })

  const watchCountry = watch('country')

  // Auto-update currency when country changes
  useEffect(() => {
    if (watchCountry === 'Israel') {
      setValue('currency', 'NIS')
    } else if (watchCountry === 'United States') {
      setValue('currency', 'USD')
    } else if (watchCountry === 'United Kingdom') {
      setValue('currency', 'GBP')
    }
  }, [watchCountry, setValue])

  // Convert English date to Hebrew date using @hebcal/core library
  // This function creates IMMUTABLE date pairs to prevent drift
  const convertToHebrewDate = (date: dayjs.Dayjs): { gregorianDate: string; hebrewDate: string } => {
    try {
      // Check if date is valid
      if (!date || !date.isValid()) {
        console.warn('Invalid date provided to convertToHebrewDate:', date)
        return { gregorianDate: '', hebrewDate: '' }
      }
      
      // Store the EXACT Gregorian date as a constant string (YYYY-MM-DD format)
      const gregorianDate = date.format('YYYY-MM-DD')
      
      // Create HDate object from the JavaScript Date object
      // HDate constructor with a Date object converts from Gregorian to Hebrew
      const hebrewDate = new HDate(date.toDate())
      
      const hebrewDateString = `${hebrewDate.getDate()} ${hebrewDate.getMonthName()} ${hebrewDate.getFullYear()}`
      
      // Return IMMUTABLE date pair - these values should never change unless user explicitly updates
      return { 
        gregorianDate, 
        hebrewDate: hebrewDateString 
      }
    } catch (error) {
      console.error('Error converting to Hebrew date:', error)
      return { gregorianDate: '', hebrewDate: '' }
    }
  }

  // Load family data when editing
  useEffect(() => {
    if (family) {
      reset({
        ...defaultValues, // Start with all defaults
        familyName: family.familyName,
        hebrewFamilyName: family.hebrewFamilyName || '',
        membershipStatus: family.membershipStatus,
        primaryEmail: family.primaryEmail || '',
        phone: family.phone || '',
        address: family.address || '',
        city: family.city || '',
        currency: family.currency,
        annualPledge: family.annualPledge,
        isFoundingFamily: family.isFoundingFamily,
        isBoardFamily: family.isBoardFamily,
      })
    } else {
      reset(defaultValues)
    }
  }, [family, reset]) // Removed defaultValues to prevent infinite loop

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const onSubmit = async (data: FamilyFormData) => {
    setIsSubmitting(true)
    try {
      // Debug: Family form submission
      console.log('Family Form Data:', data)
      if (onSave) {
        await onSave(data)
      }
      onClose()
    } catch (error) {
      console.error('Error saving family:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addNewPledge = () => {
    addPledge({
      amount: 0,
      currency: watch('currency'),
      description: '',
      date: dayjs().format('YYYY-MM-DD'),
      pledgedBy: '',
      isAnonymous: false
    })
  }

  const formatCurrency = (currency: 'USD' | 'NIS' | 'GBP') => {
    if (currency === 'USD') return '$'
    if (currency === 'GBP') return '£'
    return '₪'
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        aria-labelledby="family-dialog-title"
        aria-describedby="family-dialog-description"
        disableRestoreFocus={true}
        keepMounted={false}
        disableEnforceFocus={false}
        disableAutoFocus={false}
      >
        <DialogTitle id="family-dialog-title" sx={{ bgcolor: '#6A1B9A', color: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {family ? 'Edit Family' : 'Add New Family'}
            </Typography>
            {family && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {family.isFoundingFamily && (
                  <Chip icon={<Star />} label="Founding" size="small" sx={{ bgcolor: '#FFD700', color: '#E65100' }} />
                )}
                {family.isBoardFamily && (
                  <Chip icon={<Group />} label="Board" size="small" sx={{ bgcolor: '#E1BEE7', color: '#4A148C' }} />
                )}
              </Box>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box id="family-dialog-description" sx={{ display: 'none' }}>
            {family ? 'Edit family information and details' : 'Create a new family record with contact and membership information'}
          </Box>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#F8F9FA' }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Basic Info" />
            <Tab label="Contact" />
            <Tab label="Address" />
            <Tab label="Financial" />
            <Tab label="Pledges" />
            <Tab label="Special Info" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
            {/* Tab 0: Basic Information */}
            {currentTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Group sx={{ mr: 1, color: '#6A1B9A' }} />
                    Basic Family Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="familyName"
                    control={control}
                    rules={{ required: 'Family name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Family Name (English)"
                        placeholder="Cohen, Levy, etc."
                        error={!!errors.familyName}
                        helperText={errors.familyName?.message}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="hebrewFamilyName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Hebrew Family Name (עברית)"
                        placeholder="כהן, לוי, וכו'"
                        inputProps={{ dir: 'rtl' }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: '"Arial", "Tahoma", sans-serif',
                            fontSize: '1.1rem'
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="membershipStatus"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Membership Status</InputLabel>
                        <Select {...field} label="Membership Status">
                          <MenuItem value="prospective">Prospective</MenuItem>
                          <MenuItem value="member">Member</MenuItem>
                          <MenuItem value="visitor">Visitor</MenuItem>
                          <MenuItem value="former">Former</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="membershipStartDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Membership Start Date"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Controller
                      name="isFoundingFamily"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ mr: 0.5, color: '#FFD700' }} />
                              Founding Family
                            </Box>
                          }
                        />
                      )}
                    />
                    <Controller
                      name="isBoardFamily"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Group sx={{ mr: 0.5, color: '#6A1B9A' }} />
                              Board Family
                            </Box>
                          }
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Tab 1: Contact Information */}
            {currentTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: '#6A1B9A' }} />
                    Contact Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="primaryEmail"
                    control={control}
                    rules={{ 
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email address'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Primary Email"
                        type="email"
                        error={!!errors.primaryEmail}
                        helperText={errors.primaryEmail?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#6A1B9A' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="secondaryEmail"
                    control={control}
                    rules={{ 
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email address'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Secondary Email"
                        type="email"
                        error={!!errors.secondaryEmail}
                        helperText={errors.secondaryEmail?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Primary Phone"
                        placeholder="+972-50-123-4567"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: '#6A1B9A' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="emergencyContact"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Emergency Contact"
                        placeholder="Name and phone number"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Communication Preferences
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Controller
                      name="receiveNewsletter"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="Receive Newsletter"
                        />
                      )}
                    />
                    <Controller
                      name="receiveEventNotifications"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="Receive Event Notifications"
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Tab 2: Address Information */}
            {currentTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Home sx={{ mr: 1, color: '#6A1B9A' }} />
                    Address Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Street Address"
                        placeholder="123 Herzl Street"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="City"
                        placeholder="Tel Aviv"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="State/Province"
                        placeholder="Optional"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name="zipCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="ZIP/Postal Code"
                        placeholder="12345"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Country</InputLabel>
                        <Select {...field} label="Country">
                          <MenuItem value="Israel">🇮🇱 Israel</MenuItem>
                          <MenuItem value="United States">🇺🇸 United States</MenuItem>
                          <MenuItem value="Canada">🇨🇦 Canada</MenuItem>
                          <MenuItem value="United Kingdom">🇬🇧 United Kingdom</MenuItem>
                          <MenuItem value="France">🇫🇷 France</MenuItem>
                          <MenuItem value="Germany">🇩🇪 Germany</MenuItem>
                          <MenuItem value="Other">🌍 Other</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {/* Tab 3: Financial Information */}
            {currentTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <MonetizationOn sx={{ mr: 1, color: '#43A047' }} />
                    Financial Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="currency"
                    control={control}
                    render={() => (
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={watch('currency')}
                          onChange={(e) => setValue('currency', e.target.value as 'NIS' | 'USD' | 'GBP')}
                          label="Currency"
                        >
                          <MenuItem value="NIS">NIS (₪) - Israeli Shekel</MenuItem>
                          <MenuItem value="USD">USD ($) - US Dollar</MenuItem>
                          <MenuItem value="GBP">GBP (£) - British Pound</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="annualPledge"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Annual Pledge Amount"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {formatCurrency(watch('currency'))}
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="membershipStartDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Membership Start Date"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="membershipEndDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Membership End Date (Optional)"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="weddingAnniversary"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Wedding Anniversary (Optional)"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => {
                          field.onChange(date ? date.format('YYYY-MM-DD') : '')
                          setValue(`hebrewWeddingAnniversary`, convertToHebrewDate(date || dayjs()).hebrewDate)
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="hebrewWeddingAnniversary"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Hebrew Wedding Anniversary"
                        placeholder="e.g., 15 Nissan 5740"
                        helperText="Auto-calculated from English date, but can be edited"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {/* Tab 4: Pledges */}
            {currentTab === 4 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Description sx={{ mr: 1, color: '#6A1B9A' }} />
                    Pledges & Commitments
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addNewPledge}
                    sx={{ color: '#6A1B9A', borderColor: '#6A1B9A' }}
                  >
                    Add Pledge
                  </Button>
                </Box>

                {pledgeFields.length === 0 && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    No pledges added yet. Click "Add Pledge" to create a new pledge commitment.
                  </Alert>
                )}

                <Grid container spacing={2}>
                  {pledgeFields.map((field, index) => (
                    <Grid item xs={12} key={field.id}>
                      <Card sx={{ border: '1px solid #E0E0E0' }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                              <Controller
                                name={`pledges.${index}.amount`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Amount"
                                    type="number"
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          {formatCurrency(watch(`pledges.${index}.currency`) || 'NIS')}
                                        </InputAdornment>
                                      ),
                                    }}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <Controller
                                name={`pledges.${index}.currency`}
                                control={control}
                                render={({ field }) => (
                                  <FormControl fullWidth>
                                    <InputLabel>Currency</InputLabel>
                                    <Select {...field} label="Currency">
                                      <MenuItem value="NIS">₪ NIS</MenuItem>
                                      <MenuItem value="USD">$ USD</MenuItem>
                                      <MenuItem value="GBP">£ GBP</MenuItem>
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Controller
                                name={`pledges.${index}.description`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Pledge Description"
                                    placeholder="e.g., Torah fund, Building renovation, High Holiday sponsorship"
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <Controller
                                name={`pledges.${index}.date`}
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    label="Date"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                                    slotProps={{
                                      textField: {
                                        fullWidth: true,
                                        size: 'small'
                                      }
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={1}>
                              <IconButton
                                onClick={() => removePledge(index)}
                                sx={{ color: '#E53935', mt: 1 }}
                              >
                                <Delete />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Tab 5: Special Information */}
            {currentTab === 5 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Description sx={{ mr: 1, color: '#6A1B9A' }} />
                    Special Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="dietaryRestrictions"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Dietary Restrictions"
                        placeholder="e.g., Kosher only, Vegetarian, Allergies to nuts, etc."
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="specialNeeds"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Special Needs"
                        placeholder="e.g., Wheelchair accessible seating, Large print materials, etc."
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="familyNotes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Family Notes"
                        placeholder="Additional notes about the family..."
                        multiline
                        rows={4}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#F8F9FA', borderTop: '1px solid #E0E0E0' }}>
          <Button 
            onClick={onClose} 
            size="large"
            tabIndex={-1}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            size="large"
            autoFocus
            sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}
          >
            {isSubmitting ? 'Saving...' : family ? 'Update Family' : 'Create Family'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default FamilyFormDialog 