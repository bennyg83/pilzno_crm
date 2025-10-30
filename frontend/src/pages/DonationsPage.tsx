/**
 * DonationsPage Component
 * 
 * A comprehensive page for managing and viewing donations in the CRM system.
 * This page provides functionality for recording new donations, viewing
 * donation history, generating reports, and analyzing donation patterns.
 * 
 * Features:
 * - Donation recording and editing
 * - Donation history with filtering and search
 * - Financial reporting and analytics
 * - Export capabilities
 * - Family-specific donation views
 * 
 * @author Pilzno CRM Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import {
  Add,
  Search,
  Edit,
  Delete,
  Download
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'

import DonationFormDialog from '../components/DonationFormDialog'
import { Donation, DonationFormData, DonationSummary, Family, FamilyMember } from '../types'
// import { formatCurrency } from '../utils/formatCurrency' // TODO: Create this utility
import { getCurrentHebrewYearRange, formatHebrewYear } from '../utils/hebrewCalendar'

// Temporary formatCurrency function - TODO: Move to utils
const formatCurrency = (amount: number, currency: 'NIS' | 'USD' | 'GBP' = 'NIS'): string => {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '₪'
  return `${symbol}${amount.toLocaleString()}`
}

/**
 * Tab panel component for the donations page tabs
 */
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`donations-tabpanel-${index}`}
      aria-labelledby={`donations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

/**
 * DonationsPage - Main donations management page
 * 
 * This component provides a comprehensive interface for managing donations
 * in the CRM system, including recording, viewing, and reporting functionality.
 * 
 * @returns {JSX.Element} The rendered donations page
 */
const DonationsPage: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Current active tab state
   * Controls which section of the donations page is currently visible
   */
  const [activeTab, setActiveTab] = useState(0)

  /**
   * Donations data state
   * Holds the list of all donations for display and management
   */
  const [donations, setDonations] = useState<Donation[]>([])

  /**
   * Families data state
   * Holds the list of families for donation form and filtering
   */
  const [families, setFamilies] = useState<Family[]>([])

  /**
   * Family members data state
   * Holds the list of family members for memorial connections
   */
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

  /**
   * Donation summary state
   * Holds calculated summary data for reporting
   */
  const [donationSummary, setDonationSummary] = useState<DonationSummary | null>(null)

  /**
   * Loading states for different operations
   */
  const [isLoading, setIsLoading] = useState(true)
  // const [isSubmitting, setIsSubmitting] = useState(false) // TODO: Use when implementing API calls

  /**
   * Search and filter states
   */
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFamily, setFilterFamily] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  /**
   * Modal states
   */
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  /**
   * Load initial data when component mounts
   * 
   * This effect loads all necessary data for the donations page including
   * donations, families, and family members. It also calculates the
   * donation summary for reporting.
   */
  useEffect(() => {
    loadDonationsData()
  }, [])

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================
  
  /**
   * Load all donations data
   * 
   * This function loads donations, families, and family members data
   * and calculates the donation summary for reporting purposes.
   */
  const loadDonationsData = async () => {
    try {
      setIsLoading(true)
      
      // Load donations, families, and family members in parallel
      const [donationsResponse, familiesResponse, familyMembersResponse] = await Promise.all([
        // TODO: Implement API calls when backend is ready
        // apiService.donations.getAll(),
        // apiService.families.getAll(),
        // apiService.familyMembers.getAll()
        Promise.resolve({ donations: [] }),
        Promise.resolve({ families: [] }),
        Promise.resolve({ familyMembers: [] })
      ])
      
      setDonations(donationsResponse.donations || [])
      setFamilies(familiesResponse.families || [])
      setFamilyMembers(familyMembersResponse.familyMembers || [])
      
      // Calculate donation summary
      calculateDonationSummary(donationsResponse.donations || [])
      
    } catch (error) {
      console.error('Error loading donations data:', error)
      toast.error('Failed to load donations data')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Calculate donation summary for reporting
   * 
   * @param {Donation[]} donationsList - List of donations to analyze
   */
  const calculateDonationSummary = (donationsList: Donation[]) => {
    const currentHebrewYear = getCurrentHebrewYearRange()
    
    // Filter donations for current Hebrew year
    const currentYearDonations = donationsList.filter(donation => {
      const donationDate = new Date(donation.donationDate)
      const yearStart = new Date(currentHebrewYear.start)
      const yearEnd = new Date(currentHebrewYear.end)
      return donationDate >= yearStart && donationDate < yearEnd
    })
    
    // Calculate totals
    const totalDonations = currentYearDonations.length
    const totalAmount = currentYearDonations.reduce((sum, donation) => sum + donation.amount, 0)
    
    // Calculate by type
    const byType = {
      annual_pledge: 0,
      one_time_pledge: 0,
      event_sponsorship: 0,
      memorial: 0,
      general: 0,
      other: 0
    }
    
    currentYearDonations.forEach(donation => {
      byType[donation.donationType] += donation.amount
    })
    
    // Calculate by family
    const familyTotals = new Map<string, { familyName: string; totalAmount: number; donationCount: number }>()
    
    currentYearDonations.forEach(donation => {
      const existing = familyTotals.get(donation.familyId) || {
        familyName: donation.familyName,
        totalAmount: 0,
        donationCount: 0
      }
      existing.totalAmount += donation.amount
      existing.donationCount += 1
      familyTotals.set(donation.familyId, existing)
    })
    
    const byFamily = Array.from(familyTotals.entries())
      .map(([familyId, data]) => ({ familyId, ...data }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
    
    // Calculate by month
    const monthTotals = new Map<string, { month: string; year: number; amount: number; count: number }>()
    
    currentYearDonations.forEach(donation => {
      const date = new Date(donation.donationDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'long' })
      
      const existing = monthTotals.get(monthKey) || {
        month: monthName,
        year: date.getFullYear(),
        amount: 0,
        count: 0
      }
      existing.amount += donation.amount
      existing.count += 1
      monthTotals.set(monthKey, existing)
    })
    
    const byMonth = Array.from(monthTotals.values())
      .sort((a, b) => a.year - b.year || a.month.localeCompare(b.month))
    
    // Get recent donations (last 10)
    const recentDonations = currentYearDonations
      .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime())
      .slice(0, 10)
    
    setDonationSummary({
      totalDonations,
      totalAmount,
      currency: 'NIS', // Default currency, should be configurable
      byType,
      byMonth,
      byFamily,
      recentDonations
    })
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle tab change
   * 
   * @param {React.SyntheticEvent} event - The tab change event
   * @param {number} newValue - The new tab index
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  /**
   * Handle adding new donation
   */
  const handleAddDonation = () => {
    setEditingDonation(null)
    setIsDonationModalOpen(true)
  }

  /**
   * Handle editing existing donation
   * 
   * @param {Donation} donation - The donation to edit
   */
  const handleEditDonation = (donation: Donation) => {
    setEditingDonation(donation)
    setIsDonationModalOpen(true)
  }

  /**
   * Handle closing donation modal
   */
  const handleCloseDonationModal = () => {
    setIsDonationModalOpen(false)
    setEditingDonation(null)
  }

  /**
   * Handle saving donation
   * 
   * @param {DonationFormData} donationData - The donation data to save
   */
  const handleSaveDonation = async (_donationData: DonationFormData) => {
    try {
      // setIsSubmitting(true) // TODO: Uncomment when implementing API calls
      
      // TODO: Implement API call when backend is ready
      // if (editingDonation) {
      //   await apiService.donations.update(editingDonation.id, donationData)
      // } else {
      //   await apiService.donations.create(donationData)
      // }
      
      // For now, just show success message
      toast.success(editingDonation ? 'Donation updated successfully!' : 'Donation recorded successfully!')
      
      // Reload data
      await loadDonationsData()
      
      // Close modal
      handleCloseDonationModal()
      
    } catch (error) {
      console.error('Error saving donation:', error)
      toast.error('Failed to save donation')
    } finally {
      // setIsSubmitting(false) // TODO: Uncomment when implementing API calls
    }
  }

  /**
   * Handle deleting donation
   * 
   * @param {string} donationId - The ID of the donation to delete
   */
  const handleDeleteDonation = async (_donationId: string) => {
    try {
      // TODO: Implement API call when backend is ready
      // await apiService.donations.delete(donationId)
      
      toast.success('Donation deleted successfully!')
      await loadDonationsData()
      
    } catch (error) {
      console.error('Error deleting donation:', error)
      toast.error('Failed to delete donation')
    }
  }

  // ============================================================================
  // FILTERING AND SEARCH
  // ============================================================================
  
  /**
   * Get filtered donations based on current filters
   * 
   * @returns {Donation[]} Filtered list of donations
   */
  const getFilteredDonations = (): Donation[] => {
    return donations.filter(donation => {
      const matchesSearch = !searchTerm || 
        donation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.familyName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFamily = !filterFamily || donation.familyId === filterFamily
      const matchesType = !filterType || donation.donationType === filterType
      const matchesStatus = !filterStatus || donation.status === filterStatus
      
      return matchesSearch && matchesFamily && matchesType && matchesStatus
    })
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#6A1B9A', fontWeight: 'bold' }}>
          Donations Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddDonation}
          sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}
        >
          Record Donation
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Donations" />
          <Tab label="Reports" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* All Donations Tab */}
      <TabPanel value={activeTab} index={0}>
        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Family</InputLabel>
                  <Select
                    value={filterFamily}
                    label="Family"
                    onChange={(e) => setFilterFamily(e.target.value)}
                  >
                    <MenuItem value="">All Families</MenuItem>
                    {families.map((family) => (
                      <MenuItem key={family.id} value={family.id}>
                        {family.familyName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    label="Type"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="annual_pledge">Annual Pledge</MenuItem>
                    <MenuItem value="one_time_pledge">One-time Pledge</MenuItem>
                    <MenuItem value="event_sponsorship">Event Sponsorship</MenuItem>
                    <MenuItem value="memorial">Memorial</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="processed">Processed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  fullWidth
                  onClick={() => toast('Export functionality coming soon!')}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Donations Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Family</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredDonations().map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>{new Date(donation.donationDate).toLocaleDateString()}</TableCell>
                    <TableCell>{donation.familyName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={donation.donationType.replace('_', ' ').toUpperCase()} 
                        size="small" 
                        color="primary" 
                      />
                    </TableCell>
                    <TableCell>{donation.description}</TableCell>
                    <TableCell>{formatCurrency(donation.amount, donation.currency)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={donation.status.toUpperCase()} 
                        size="small" 
                        color={donation.status === 'processed' ? 'success' : 'default'} 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditDonation(donation)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteDonation(donation.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </TabPanel>

      {/* Reports Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Donation Reports - {formatHebrewYear(getCurrentHebrewYearRange().hebrewYear)}
        </Typography>
        
        {donationSummary ? (
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Total Donations
                  </Typography>
                  <Typography variant="h4">
                    {donationSummary.totalDonations}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Total Amount
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(donationSummary.totalAmount, donationSummary.currency)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Average Donation
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(
                      donationSummary.totalDonations > 0 
                        ? donationSummary.totalAmount / donationSummary.totalDonations 
                        : 0, 
                      donationSummary.currency
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Active Families
                  </Typography>
                  <Typography variant="h4">
                    {donationSummary.byFamily.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Families */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Top Donating Families
                  </Typography>
                  {donationSummary.byFamily.slice(0, 5).map((family, index) => (
                    <Box key={family.familyId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {index + 1}. {family.familyName}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(family.totalAmount, donationSummary.currency)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Donation Types */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Donations by Type
                  </Typography>
                  {Object.entries(donationSummary.byType).map(([type, amount]) => (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {type.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(amount, donationSummary.currency)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            No donation data available for the current Hebrew year.
          </Alert>
        )}
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Donation Analytics
        </Typography>
        <Alert severity="info">
          Advanced analytics and charts will be available in a future update.
        </Alert>
      </TabPanel>

      {/* Donation Form Modal */}
      <DonationFormDialog
        open={isDonationModalOpen}
        onClose={handleCloseDonationModal}
        onSave={handleSaveDonation}
        donation={editingDonation}
        families={families}
        familyMembers={familyMembers}
      />
    </Box>
  )
}

export default DonationsPage 