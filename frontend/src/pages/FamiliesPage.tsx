import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  People,
  Star,
  Group,
  Phone,
  Email,
  Home,
  MonetizationOn
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { apiService } from '../services/apiService'
import FamilyFormDialog from '../components/FamilyFormDialog'
import FamilyMemberFormDialog from '../components/FamilyMemberFormDialog'
import PledgeFormDialog from '../components/PledgeFormDialog'
import AdditionalDateFormDialog from '../components/AdditionalDateFormDialog'
import { Family, FamilyFormData, FamilyMember, PledgeFormData, Pledge } from '../types'
import dayjs from 'dayjs'
import { calculatePledgeTotals, getPledgeBreakdown } from '../utils/pledgeCalculations'

const FamiliesPage: React.FC = () => {
  // 🔍 BUILD TEST: Track if FamiliesPage component is being processed
  useEffect(() => {
    console.log('🔍 BUILD TEST: FamiliesPage component rendered - build system is processing this file')
  }, [])

  const [currentTab, setCurrentTab] = useState(0)
  const [familyDetailTab, setFamilyDetailTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFamily, setEditingFamily] = useState<Family | null>(null)
  const [viewingFamily, setViewingFamily] = useState<Family | null>(null)
  const [families, setFamilies] = useState<Family[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Member dialog state
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [currentFamilyId, setCurrentFamilyId] = useState<string>('')
  
  // Pledge dialog state
  const [isPledgeFormOpen, setIsPledgeFormOpen] = useState(false)
  const [editingPledge, setEditingPledge] = useState<Pledge | null>(null)
  const [currentFamilyForPledge, setCurrentFamilyForPledge] = useState<Family | null>(null)
  
  // Delete member dialog state
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null)
  
  
  // Saved additional dates state - for display
  const [savedAdditionalDates, setSavedAdditionalDates] = useState<Array<{
    id: string
    type: 'wedding_anniversary' | 'aliyah_anniversary' | 'other'
    description: string
    englishDate: string
    hebrewDate: string
    memberId: string
    memberName: string
  }>>([])
  
  // Additional date modal state
  const [isAdditionalDateModalOpen, setIsAdditionalDateModalOpen] = useState(false)
  const [editingAdditionalDate, setEditingAdditionalDate] = useState<{
    id: string
    type: 'wedding_anniversary' | 'aliyah_anniversary' | 'other'
    description: string
    englishDate: string
    hebrewDate: string
    memberId: string
    memberName: string
  } | null>(null)
  
  // Load additional dates for a family
  const loadAdditionalDates = async (familyId: string) => {
    try {
      const response = await apiService.additionalDates.getByFamily(familyId)
      setSavedAdditionalDates(response.additionalDates || [])
    } catch (error: any) {
      console.error('Error loading additional dates:', error)
      // If there's an error, just set empty array
      setSavedAdditionalDates([])
    }
  }

  // Handle adding new additional date
  const handleAddAdditionalDate = () => {
    setEditingAdditionalDate(null)
    setIsAdditionalDateModalOpen(true)
  }

  // Handle editing additional date
  const handleEditAdditionalDate = (date: any) => {
    setEditingAdditionalDate(date)
    setIsAdditionalDateModalOpen(true)
  }

  // Handle closing modal
  const handleCloseAdditionalDateModal = () => {
    setIsAdditionalDateModalOpen(false)
    setEditingAdditionalDate(null)
  }

  // Handle saving additional date (both new and edit)
  const handleSaveAdditionalDate = async (dateData: any) => {
    try {
      const savedDate = await saveAdditionalDate(dateData)
      
      if (editingAdditionalDate) {
        // Update existing date
        setSavedAdditionalDates(prev => 
          prev.map(date => 
            date.id === editingAdditionalDate.id ? savedDate : date
          )
        )
        toast.success('Additional date updated successfully!')
      } else {
        // Add new date
        setSavedAdditionalDates(prev => [...prev, savedDate])
        toast.success('Additional date added successfully!')
      }
      
      handleCloseAdditionalDateModal()
    } catch (error) {
      console.error('Error saving additional date:', error)
      toast.error('Failed to save additional date')
    }
  }

  // Handle deleting additional date
  const handleDeleteAdditionalDate = async (dateId: string) => {
    try {
      await apiService.additionalDates.delete(dateId)
      setSavedAdditionalDates(prev => prev.filter(date => date.id !== dateId))
      toast.success('Additional date deleted successfully!')
    } catch (error) {
      console.error('Error deleting additional date:', error)
      toast.error('Failed to delete additional date')
    }
  }

  // Load families from API
  const loadFamilies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiService.families.getAll()
      setFamilies(response.families || [])
      // Remove unnecessary logging
    } catch (error: any) {
      console.error('Error loading families:', error)
      setError('Failed to load families. Please try again.')
      // Show mock data as fallback if API fails
              setFamilies([
          {
            id: 'mock-1',
            familyName: 'Cohen (Mock Data)',
            hebrewFamilyName: 'כהן',
            primaryEmail: 'cohen@example.com',
            phone: '+972-50-123-4567',
            address: '123 Herzl Street',
            city: 'Tel Aviv',
            membershipStatus: 'member',
            familyHealth: 'Good',
            totalDonations: 0,
            memberCount: 4,
            annualPledge: 5000,
            currency: 'NIS',
            isFoundingFamily: true,
            isBoardFamily: false,
            createdAt: '2023-01-15'
          }
        ])
    } finally {
      setIsLoading(false)
    }
  }

  // Load family members from API
  const loadFamilyMembers = async () => {
    try {
      const response = await apiService.familyMembers.getAll()
      setFamilyMembers(response.members)
      // Remove unnecessary logging
    } catch (error) {
      console.error('Error loading family members:', error)
    }
  }

  // Load families on component mount
  useEffect(() => {
    loadFamilies()
    loadFamilyMembers()
  }, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const handleAddFamily = () => {
    setEditingFamily(null)
    setIsFormOpen(true)
  }

  const handleEditFamily = (family: Family) => {
    setEditingFamily(family)
    setIsFormOpen(true)
  }

  const handleViewFamily = (family: Family) => {
    setViewingFamily(family)
    // Load additional dates for this family
    loadAdditionalDates(family.id)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingFamily(null)
  }

  const handleSaveFamily = async (data: FamilyFormData) => {
    try {
      if (editingFamily) {
        // Update existing family
        await apiService.families.update(editingFamily.id, data)
        toast.success('Family updated successfully!')
      } else {
        // Create new family
        await apiService.families.create(data)
        toast.success('Family created successfully!')
      }
      
      // Auto-refresh all data
      await refreshAllData()
      
    } catch (error: any) {
      console.error('Error saving family:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save family. Please try again.'
      toast.error(errorMessage)
      throw error // Re-throw to prevent dialog from closing on error
    }
  }

  // Refresh function for updating all data
  const refreshAllData = async (newPledge?: any) => {
    console.log('🔄 AUTO-REFRESH: Starting comprehensive data refresh...')
    
    try {
      // 1. Refresh all core data in parallel
      console.log('🔄 AUTO-REFRESH: Refreshing families and members...')
      await Promise.all([
        loadFamilies(),
        loadFamilyMembers()
      ])
      console.log('✅ AUTO-REFRESH: Core data refreshed')
      
      // 2. Refresh additional dates if viewing a family
      if (viewingFamily) {
        console.log('🔄 AUTO-REFRESH: Refreshing additional dates...')
        await loadAdditionalDates(viewingFamily.id)
        
        // 3. Refresh the specific family data to get updated pledges
        console.log('🔄 AUTO-REFRESH: Refreshing viewing family...')
        try {
          const familyResponse = await apiService.families.getById(viewingFamily.id)
          console.log('🔄 REFRESHING FAMILY DATA:', {
            familyId: viewingFamily.id,
            pledgesCount: familyResponse.pledges?.length || 0,
            pledges: familyResponse.pledges,
            fullResponse: familyResponse
          })
          
          // Only update if we have valid pledges data
          if (familyResponse.pledges && Array.isArray(familyResponse.pledges)) {
            console.log('🔄 AUTO-REFRESH: Setting viewingFamily with new data:', {
              pledgesCount: familyResponse.pledges.length,
              pledges: familyResponse.pledges.map(p => ({ id: p.id, description: p.description, isAnnualPledge: p.isAnnualPledge }))
            })
            setViewingFamily(familyResponse)
            console.log('✅ AUTO-REFRESH: Viewing family state updated')
          } else {
            console.warn('⚠️ REFRESH SKIPPED - Invalid pledges data:', familyResponse.pledges)
            // Merge the new family data but keep existing pledges to prevent data loss
            setViewingFamily(prevFamily => {
              const existingPledges = prevFamily?.pledges || []
              const updatedPledges = newPledge ? [...existingPledges, newPledge] : existingPledges
              
              return {
                ...prevFamily,  // Keep existing family data as base
                ...familyResponse,  // Overlay with new data
                pledges: updatedPledges  // Preserve existing pledges and add new one if provided
              }
            })
            console.log('✅ AUTO-REFRESH: Viewing family refreshed with fallback logic')
      }
    } catch (error) {
          console.error('❌ AUTO-REFRESH: Error refreshing viewing family:', error)
        }
      }
      
      console.log('✅ AUTO-REFRESH: Complete data refresh finished')
    } catch (error) {
      console.error('❌ AUTO-REFRESH: Error during data refresh:', error)
    }
  }

  // Member dialog handlers
  const handleAddMember = (familyId: string) => {
    setEditingMember(null)
    setCurrentFamilyId(familyId)
    setIsMemberFormOpen(true)
  }

  const handleEditMember = (member: FamilyMember) => {
    console.log('5) handleEditMember called for:', member.firstName, member.lastName)
    setEditingMember(member)
    setIsMemberFormOpen(true)
  }

  const handleSaveMember = async (savedMember: FamilyMember) => {
    try {
      if (editingMember) {
        // Update existing member
        const response = await apiService.familyMembers.update(editingMember.id, savedMember)
        toast.success(response.message || 'Member updated successfully!')
      } else {
        // Create new member
        const response = await apiService.familyMembers.create(savedMember)
        toast.success(response.message || 'Member added successfully!')
      }
      
      // Auto-refresh all data
      await refreshAllData()
      
    } catch (error: any) {
      console.error('Error saving member:', error)
      let errorMessage = error.response?.data?.message || 'Failed to save member. Please try again.'
      
      // Provide more helpful error message for email conflicts
      if (error.response?.status === 409 && errorMessage.includes('email')) {
        errorMessage = 'A member with this email address already exists. Please use a different email or search for the existing member.'
        
        // Try to find the existing member to help the user
        if (savedMember.email) {
          try {
            const searchResponse = await apiService.familyMembers.getAll({ search: savedMember.email })
            if (searchResponse.members.length > 0) {
              const existingMember = searchResponse.members[0]
              errorMessage += ` Found existing member: ${existingMember.firstName} ${existingMember.lastName} (${existingMember.family?.familyName || 'Unknown Family'})`
            }
          } catch (searchError) {
            console.error('Error searching for existing member:', searchError)
          }
        }
      }
      
      toast.error(errorMessage)
      throw error // Re-throw to prevent dialog from closing on error
    }
  }

  // Delete member handler
  const handleDeleteMember = (member: FamilyMember) => {
    setMemberToDelete(member)
    setIsDeleteMemberDialogOpen(true)
  }

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return
    
    // Check if this is the last member in the family
    const familyMembersCount = familyMembers.filter(m => m.familyId === memberToDelete.familyId).length
    if (familyMembersCount <= 1) {
      toast.error('Cannot delete the last member in a family. Please delete the family instead.')
      setIsDeleteMemberDialogOpen(false)
      setMemberToDelete(null)
      return
    }
    
    try {
      await apiService.familyMembers.delete(memberToDelete.id)
      
      // Remove from local state
      setFamilyMembers(prev => prev.filter(m => m.id !== memberToDelete.id))
      
      // Close dialog and reset state
      setIsDeleteMemberDialogOpen(false)
      setMemberToDelete(null)
      
      toast.success('Member deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting member:', error)
      toast.error(error.response?.data?.message || 'Failed to delete member')
    }
  }

  // Pledge dialog handlers
  const handleAddPledge = (family: Family) => {
    setEditingPledge(null)
    setCurrentFamilyForPledge(family)
    setIsPledgeFormOpen(true)
  }

  const handleEditPledge = (pledge: Pledge) => {
    setCurrentFamilyForPledge(viewingFamily)
    setEditingPledge(pledge)
    setIsPledgeFormOpen(true)
  }

  const handleQuickStatusUpdate = (pledge: Pledge) => {
    setCurrentFamilyForPledge(viewingFamily)
    setEditingPledge(pledge)
    setIsPledgeFormOpen(true)
  }




  const handleSavePledge = async (pledgeData: PledgeFormData) => {
    try {
      if (!currentFamilyForPledge) {
        toast.error('No family selected for pledge')
        return
      }

      // Prepare pledge data for API
      const apiPledgeData = {
        ...pledgeData,
        familyId: currentFamilyForPledge.id,
        status: pledgeData.status || 'pending', // Use the status from the form
        amount: parseFloat(pledgeData.amount.toString()),
        date: pledgeData.date,
        dueDate: pledgeData.dueDate || null,
        donationDate: pledgeData.donationDate || null,
        isAnnualPledge: pledgeData.isAnnualPledge || false,
        fulfilledAmount: pledgeData.fulfilledAmount || null,
        fulfilledDate: pledgeData.fulfilledDate || null,
        notes: pledgeData.notes || '',
        connectedEvents: pledgeData.connectedEvents || []
      }

      console.log('🔄 FAMILIES PAGE - Pledge data received:', {
        pledgeData,
        isAnnualPledge: pledgeData.isAnnualPledge,
        apiPledgeData,
        apiIsAnnualPledge: apiPledgeData.isAnnualPledge
      })

      let response
      if (editingPledge) {
        // Update existing pledge
        response = await apiService.pledges.update(editingPledge.id, apiPledgeData)
        toast.success('Pledge updated successfully!')
      } else {
        // Create new pledge
        response = await apiService.pledges.create(apiPledgeData)
        toast.success('Pledge saved successfully!')
      }
      console.log('Pledge saved:', response.pledge)
      
      // Close dialog and reset state
      setIsPledgeFormOpen(false)
      setEditingPledge(null)
      setCurrentFamilyForPledge(null)
      
      // Refresh family data to show the new pledge
      await refreshAllData(response.pledge)
      
    } catch (error: any) {
      console.error('Error saving pledge:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save pledge. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleDeleteFamily = async (family: Family) => {
    try {
      // Check if family has members
      if (family.memberCount > 0) {
        toast.error('Cannot delete family with members. Please remove all members first.')
        return
      }

      // Show confirmation dialog
      if (window.confirm(`Are you sure you want to delete the family "${family.familyName}"? This action cannot be undone.`)) {
        await apiService.families.delete(family.id)
        
        // Auto-refresh all data
        await refreshAllData()
        toast.success('Family deleted successfully!')
      }
    } catch (error: any) {
      console.error('Error deleting family:', error)
      toast.error(error.response?.data?.message || 'Failed to delete family')
    }
  }

  const filteredFamilies = families.filter((family: Family) =>
    family.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.hebrewFamilyName?.includes(searchTerm) ||
    family.primaryEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'member': return 'success'
      case 'prospective': return 'warning'
      case 'visitor': return 'info'
      case 'former': return 'default'
      default: return 'default'
    }
  }

  const formatCurrency = (amount: number | string | undefined, currency: 'USD' | 'NIS' | 'GBP') => {
    let symbol = '₪'
    if (currency === 'USD') symbol = '$'
    else if (currency === 'GBP') symbol = '£'
    
    // Handle undefined, null, or invalid amounts
    if (amount === undefined || amount === null || amount === '') {
      return `${symbol}0.00`
    }
    
    // Convert to number if it's a string
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    
    // Check if the conversion resulted in a valid number
    if (isNaN(numericAmount)) {
      return `${symbol}0.00`
    }
    
    return `${symbol}${numericAmount.toLocaleString()}`
  }
  
  const formatYahrzeitRelationship = (relationship: string): string => {
    switch (relationship) {
      case 'child_of': return 'Child of'
      case 'sibling_of': return 'Sibling of'
      case 'parent_of': return 'Parent of'
      case 'grandchild_of': return 'Grandchild of'
      case 'grandparent_of': return 'Grandparent of'
      default: return relationship
    }
  }
  
  // Additional important dates functions
  

  
  const saveAdditionalDate = async (dateData: any) => {
    try {
      if (dateData.id && !dateData.id.startsWith('temp-')) {
        // This is an existing date, update it
        const response = await apiService.additionalDates.update(dateData.id, {
          type: dateData.type,
          description: dateData.description,
          englishDate: dateData.englishDate,
          hebrewDate: dateData.hebrewDate,
          memberId: dateData.memberId,
          memberName: dateData.memberName
        })
        
        return response.additionalDate
      } else {
        // This is a new date, create it
        const response = await apiService.additionalDates.create({
          familyId: viewingFamily?.id,
          type: dateData.type,
          description: dateData.description,
          englishDate: dateData.englishDate,
          hebrewDate: dateData.hebrewDate,
          memberId: dateData.memberId,
          memberName: dateData.memberName
        })
        
        return response.additionalDate
      }
    } catch (error: any) {
      console.error('Error saving additional date:', error)
      toast.error(error.response?.data?.message || 'Failed to save additional date')
      throw error
    }
  }
  
  
  const getDateTypeLabel = (type: string): string => {
    switch (type) {
      case 'wedding_anniversary': return 'Wedding Anniversary'
      case 'aliyah_anniversary': return 'Aliyah Anniversary'
      case 'other': return 'Other'
      default: return type
    }
  }


  // Format date for display consistently
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return ''
    try {
      const date = dayjs(dateString)
      if (date.isValid()) {
        return date.format('DD/MM/YYYY')
      }
      return dateString
    } catch (error) {
      return dateString
    }
  }

  return (
    <Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
         <Typography variant="h4" sx={{ fontWeight: 600 }}>
           Family Management
         </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddFamily}
          sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}
        >
          Add Family
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Families" />
          <Tab label="Members" />
          <Tab label="Prospective" />
          <Tab label="Reports" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && (
            <>
              {/* Search and Filters */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search families by name, Hebrew name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ maxWidth: 600 }}
                />
              </Box>

              {/* Loading State */}
              {isLoading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" width="100%">
                  <CircularProgress size={40} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading families...
                  </Typography>
                </Box>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                  <Button onClick={loadFamilies} size="small" sx={{ ml: 2 }}>
                    Retry
                  </Button>
                </Alert>
              )}

              {/* Empty State */}
              {!isLoading && !error && families.length === 0 && (
                <Box display="flex" flexDirection="column" alignItems="center" minHeight="200px" justifyContent="center">
                  <People sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No families found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Get started by adding your first family
                  </Typography>
                  <Button variant="contained" onClick={handleAddFamily} startIcon={<Add />}>
                    Add Family
                  </Button>
                </Box>
              )}

              {/* Family Cards */}
              {!isLoading && !error && families.length > 0 && (
                <Grid container spacing={3}>
                  {filteredFamilies.map((family) => (
                  <Grid item xs={12} md={6} lg={4} key={family.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {family.familyName}
                            </Typography>
                            {family.hebrewFamilyName && (
                              <Typography variant="body2" sx={{ color: '#6A1B9A', fontWeight: 500 }}>
                                {family.hebrewFamilyName}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {family.isFoundingFamily && (
                              <Chip
                                icon={<Star />}
                                label="Founding"
                                size="small"
                                sx={{ bgcolor: '#FFD700', color: '#E65100', fontSize: '0.7rem' }}
                              />
                            )}
                            {family.isBoardFamily && (
                              <Chip
                                icon={<Group />}
                                label="Board"
                                size="small"
                                sx={{ bgcolor: '#E1BEE7', color: '#4A148C', fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>

                        <Chip
                          label={family.membershipStatus.charAt(0).toUpperCase() + family.membershipStatus.slice(1)}
                          size="small"
                          color={getStatusColor(family.membershipStatus) as any}
                          sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <People sx={{ fontSize: 16, color: '#6A1B9A', mr: 1 }} />
                          <Typography variant="body2">
                            {family.memberCount} member{family.memberCount !== 1 ? 's' : ''}
                          </Typography>
                        </Box>

                        {family.primaryEmail && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Email sx={{ fontSize: 16, color: '#6A1B9A', mr: 1 }} />
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              {family.primaryEmail}
                            </Typography>
                          </Box>
                        )}

                        {family.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Phone sx={{ fontSize: 16, color: '#6A1B9A', mr: 1 }} />
                            <Typography variant="body2">
                              {family.phone}
                            </Typography>
                          </Box>
                        )}

                        {family.address && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Home sx={{ fontSize: 16, color: '#6A1B9A', mr: 1 }} />
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              {family.address}, {family.city}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <MonetizationOn sx={{ fontSize: 16, color: '#43A047', mr: 1 }} />
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {(() => {
                                const pledgeTotals = calculatePledgeTotals(family.pledges, family.currency)
                                const breakdown = getPledgeBreakdown(pledgeTotals)
                                
                                if (breakdown.isEmpty) {
                                  return `Annual Pledge: ${formatCurrency(family.annualPledge, family.currency)}`
                                }
                                
                                return (
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                      Current Hebrew Year: {breakdown.total}
                                    </Typography>
                                    {breakdown.hasBoth && (
                                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                        Annual: {breakdown.annual} | One-time: {breakdown.oneTime}
                                      </Typography>
                                    )}
                                    {!breakdown.hasBoth && breakdown.annual && (
                                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                        Annual pledges only
                                      </Typography>
                                    )}
                                    {!breakdown.hasBoth && breakdown.oneTime && (
                                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                        One-time pledges only
                                      </Typography>
                                    )}
                                  </Box>
                                )
                              })()}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>

                                             <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                         <Box sx={{ display: 'flex', gap: 1 }}>
                           <Button
                             size="small"
                             startIcon={<Visibility />}
                             sx={{ color: '#6A1B9A' }}
                             onClick={() => handleViewFamily(family)}
                           >
                             View
                           </Button>
                           <Button
                             size="small"
                             startIcon={<People />}
                             sx={{ color: '#4CAF50' }}
                             onClick={() => handleAddMember(family.id)}
                           >
                             Add Member
                           </Button>
                         </Box>
                         <Box>
                           <IconButton
                             size="small"
                             onClick={() => handleEditFamily(family)}
                             sx={{ color: '#FFA726' }}
                           >
                             <Edit />
                           </IconButton>
                           <IconButton
                             size="small"
                             onClick={() => handleDeleteFamily(family)}
                             sx={{ color: '#E53935' }}
                           >
                             <Delete />
                           </IconButton>
                         </Box>
                       </CardActions>
                    </Card>
                  </Grid>
                ))}
                </Grid>
              )}

              {!isLoading && !error && filteredFamilies.length === 0 && families.length > 0 && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  No families found matching your search criteria.
                </Alert>
              )}
            </>
          )}

          {currentTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: '#424242' }}>
                Family Members Overview
              </Typography>
              
              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress size={40} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading family members...
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {families.map((family) => {
                    const familyMembersList = familyMembers.filter(member => member.familyId === family.id)
                    return (
                      <Grid item xs={12} md={6} lg={4} key={family.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <People sx={{ fontSize: 24, color: '#6A1B9A', mr: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {family.familyName}
                              </Typography>
                            </Box>
                            
                            {family.hebrewFamilyName && (
                              <Typography variant="body2" sx={{ color: '#6A1B9A', mb: 2 }}>
                                {family.hebrewFamilyName}
                              </Typography>
                            )}
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {familyMembersList.length} member{familyMembersList.length !== 1 ? 's' : ''}
                            </Typography>
                            
                            {familyMembersList.length > 0 ? (
                              <Box>
                                {familyMembersList.slice(0, 3).map((member) => (
                                  <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Box sx={{ 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: '50%', 
                                      bgcolor: member.isActive ? '#4CAF50' : '#9E9E9E',
                                      mr: 1
                                    }} />
                                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                      {member.firstName} {member.lastName}
                                      {member.isPrimaryContact && (
                                        <Chip 
                                          label="Primary" 
                                          size="small" 
                                          sx={{ ml: 1, height: 16, fontSize: '0.7rem' }} 
                                        />
                                      )}
                                    </Typography>
                                  </Box>
                                ))}
                                {familyMembersList.length > 3 && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    +{familyMembersList.length - 3} more members
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No members added yet
                              </Typography>
                            )}
                          </CardContent>
                          
                          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                            <Button
                              size="small"
                              startIcon={<People />}
                              sx={{ color: '#6A1B9A' }}
                              onClick={() => handleViewFamily(family)}
                            >
                              View Members
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => handleEditFamily(family)}
                              sx={{ color: '#FFA726' }}
                            >
                              Edit Family
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </Box>
          )}

          {currentTab === 2 && (
            <Typography variant="h6" sx={{ color: '#424242' }}>
              Prospective families view - Coming soon
            </Typography>
          )}

          {currentTab === 3 && (
            <Typography variant="h6" sx={{ color: '#424242' }}>
              Family reports and analytics - Coming soon
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Family Form Dialog */}
      <FamilyFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        family={editingFamily}
        onSave={handleSaveFamily}
      />

             {/* Family Member Form Dialog */}
             <FamilyMemberFormDialog
               open={isMemberFormOpen}
               onClose={() => setIsMemberFormOpen(false)}
               onSave={handleSaveMember}
               member={editingMember}
               families={families}
               currentFamilyId={currentFamilyId}
               onRefresh={refreshAllData}
             />

       {/* Pledge Form Dialog */}
       <PledgeFormDialog
         open={isPledgeFormOpen}
         onClose={() => setIsPledgeFormOpen(false)}
         onSave={handleSavePledge}
         pledge={editingPledge}
         familyMembers={familyMembers.filter(m => m.familyId === (currentFamilyForPledge?.id || ''))}
         familyName={currentFamilyForPledge?.familyName || ''}
       />

      {/* Enhanced Family Detail Dialog */}
      {viewingFamily && (
        <Dialog
          open={!!viewingFamily}
          onClose={() => setViewingFamily(null)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#6A1B9A', color: 'white' }}>
            {viewingFamily.familyName} - Family Details
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
                         <Tabs value={familyDetailTab} onChange={(_, newValue) => setFamilyDetailTab(newValue)} sx={{ mb: 3 }}>
               <Tab label="Overview" />
               <Tab label="Members" />
               <Tab label="Financial" />
               <Tab label="Events" />
               <Tab label="Family Tree" />
               <Tab label="Important Dates" />
               {(() => {
                 // Only show Yahrzeits tab if there are Yahrzeit entries
                 const hasYahrzeits = familyMembers
                   .filter(m => m.familyId === viewingFamily.id)
                   .some(m => m.memorialInstructions && m.memorialInstructions.trim())
                 
                 // If we're on the Yahrzeits tab but there are no Yahrzeits, reset to Overview
                 if (familyDetailTab === 6 && !hasYahrzeits) {
                   setTimeout(() => setFamilyDetailTab(0), 0)
                 }
                 
                 return hasYahrzeits ? <Tab label="Yahrzeits" /> : null
               })()}
             </Tabs>
            
            {/* Overview Tab */}
            {familyDetailTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
                    Family Information
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Hebrew Name
                    </Typography>
                    <Typography variant="body1">
                      {viewingFamily.hebrewFamilyName || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={viewingFamily.membershipStatus} 
                      color={getStatusColor(viewingFamily.membershipStatus) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Annual Pledge
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(viewingFamily.annualPledge, viewingFamily.currency)}
                    </Typography>
                  </Box>
                  
                  {viewingFamily.address && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {viewingFamily.address}, {viewingFamily.city}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
                    Quick Stats
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Members
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#6A1B9A' }}>
                      {familyMembers.filter(m => m.familyId === viewingFamily.id).length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Active Members
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4CAF50' }}>
                      {familyMembers.filter(m => m.familyId === viewingFamily.id && m.isActive).length}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
            
            {/* Members Tab */}
            {familyDetailTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#4A148C' }}>
                    Family Members ({familyMembers.filter(m => m.familyId === viewingFamily.id).length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    size="small"
                    onClick={() => handleAddMember(viewingFamily.id)}
                    sx={{ bgcolor: '#6A1B9A' }}
                  >
                    Add Member
                  </Button>
                </Box>
                
                {familyMembers.filter(m => m.familyId === viewingFamily.id).length > 0 ? (
                  <Grid container spacing={2}>
                    {(() => {
                      const filteredMembers = familyMembers.filter(m => m.familyId === viewingFamily.id)
                      
                      return filteredMembers.map((member) => (
                        <Grid item xs={12} md={6} key={member.id}>
                          <Card sx={{ 
                            border: '1px solid #E0E0E0',
                            bgcolor: member.isActive ? '#F8F9FA' : '#F5F5F5'
                          }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    {member.firstName} {member.lastName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.family?.familyName || 'Unknown Family'} - {member.relationshipInHouse}
                                  </Typography>
                                  
                                  {member.dateOfBirth && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 1 }}>
                                      🎂 {new Date(member.dateOfBirth).toLocaleDateString()}
                                      {member.hebrewBirthDate && ` (${member.hebrewBirthDate})`}
                                    </Typography>
                                  )}
                                  
                                  {member.email && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                      📧 {member.email}
                                    </Typography>
                                  )}
                                  
                                  {member.cellPhone && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                      📞 {member.cellPhone}
                                    </Typography>
                                  )}
                                  
                                  {member.cellPhone && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                      📱 {member.cellPhone}
                                    </Typography>
                                  )}
                                  
                                  {member.medicalNotes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 1, fontStyle: 'italic' }}>
                                      🏥 {member.medicalNotes}
                                    </Typography>
                                  )}
                                  
                                  {member.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 1, fontStyle: 'italic' }}>
                                      📝 {member.notes}
                                    </Typography>
                                  )}
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                                  {member.isPrimaryContact && (
                                    <Chip label="Primary" size="small" color="primary" />
                                  )}
                                  {!member.isActive && (
                                    <Chip label="Inactive" size="small" color="error" />
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                            
                            <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                              <Button
                                size="small"
                                startIcon={<Edit />}
                                onClick={() => {
                                  console.log('4) Edit button clicked for:', member.firstName, member.lastName)
                                  handleEditMember(member)
                                }}
                                sx={{ color: '#FFA726' }}
                              >
                                Edit
                              </Button>
                              
                              <Button
                                size="small"
                                startIcon={<Delete />}
                                onClick={() => handleDeleteMember(member)}
                                sx={{ color: '#f44336' }}
                                variant="outlined"
                              >
                                Delete
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))
                    })()}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No members added to this family yet.
                  </Typography>
                )}
              </Box>
            )}
            
                         {/* Financial Tab */}
             {familyDetailTab === 2 && (
               <Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                   <Typography variant="h6" sx={{ color: '#4A148C' }}>
                     Financial Information
                   </Typography>
                   <Button
                     variant="contained"
                     startIcon={<Add />}
                     size="small"
                     onClick={() => handleAddPledge(viewingFamily)}
                     sx={{ bgcolor: '#4CAF50' }}
                   >
                     Add Pledge
                   </Button>
                 </Box>
                 
                 <Grid container spacing={3}>
                   <Grid item xs={12} md={6}>
                     <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
                       Current Pledges
                     </Typography>
                     
                     {(() => {
                       const familyPledges = viewingFamily?.pledges || []
                       
                       console.log('💰 FINANCIAL TAB - Displaying pledges:', {
                         familyId: viewingFamily?.id,
                         pledgesCount: familyPledges.length,
                         pledges: familyPledges,
                         viewingFamilyExists: !!viewingFamily
                       })
                       
                       if (!viewingFamily) {
                         return (
                           <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                             Loading family data...
                           </Typography>
                         )
                       }
                       
                       if (familyPledges.length === 0) {
                         return (
                           <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                             No pledges recorded yet. Add a pledge to get started.
                           </Typography>
                         )
                       }
                       
                       return (
                         <Box>
                           {familyPledges.map((pledge: Pledge) => (
                                                            <Card key={pledge.id} sx={{ mb: 2, border: '1px solid #E0E0E0', bgcolor: '#F8F9FA' }}>
                                 <CardContent sx={{ p: 2 }}>
                                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                     <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#4A148C' }}>
                                       {formatCurrency(pledge.amount, pledge.currency)}
                                     </Typography>
                                       {pledge.isAnnualPledge && (
                                         <Chip 
                                           label="Annual" 
                                           size="small" 
                                           color="primary" 
                                           variant="outlined"
                                           sx={{ fontSize: '0.75rem', height: 20 }}
                                         />
                                       )}
                                     </Box>
                                     <IconButton
                                       size="small"
                                       onClick={() => handleEditPledge(pledge)}
                                       sx={{ color: '#6A1B9A', ml: 1 }}
                                     >
                                       <Edit />
                                     </IconButton>
                                   </Box>
                                   <Typography variant="body2" color="text.secondary">
                                     {pledge.description}
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                     Date: {new Date(pledge.date).toLocaleDateString()}
                                   </Typography>
                                   {pledge.dueDate && (
                                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                       Due: {new Date(pledge.dueDate).toLocaleDateString()}
                                     </Typography>
                                   )}
                                   {pledge.status && (
                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                       <Chip 
                                         label={pledge.status} 
                                         size="small" 
                                         color={pledge.status === 'fulfilled' ? 'success' : 
                                                pledge.status === 'partial' ? 'warning' :
                                                pledge.status === 'overdue' ? 'error' :
                                                pledge.status === 'cancelled' ? 'default' : 'primary'}
                                       />
                                       <IconButton
                                         size="small"
                                         onClick={() => handleQuickStatusUpdate(pledge)}
                                         sx={{ p: 0.5 }}
                                       >
                                         <Edit fontSize="small" />
                                       </IconButton>
                                     </Box>
                                   )}
                                   
                                   {/* Connected Events */}
                                   {pledge.connectedEvents && pledge.connectedEvents.length > 0 && (
                                     <Box sx={{ mt: 2 }}>
                                       <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                         Connected Events:
                                       </Typography>
                                       {pledge.connectedEvents.map((event, index) => (
                                         <Chip
                                           key={index}
                                           label={`${event.type}: ${event.description}`}
                                           size="small"
                                           variant="outlined"
                                           sx={{ mr: 0.5, mt: 0.5, fontSize: '0.7rem' }}
                                         />
                                       ))}
                                     </Box>
                                   )}
                                 </CardContent>
                               </Card>
                           ))}
                         </Box>
                       )
                     })()}
                   </Grid>
                   
                   <Grid item xs={12} md={6}>
                     <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
                       Financial Summary
                     </Typography>
                     
                     <Box sx={{ mb: 2 }}>
                       <Typography variant="body2" color="text.secondary">
                         Annual Pledges Pending
                       </Typography>
                       <Typography variant="h6" sx={{ color: '#FF9800' }} key={`annual-${viewingFamily?.id}-${viewingFamily?.pledges?.length || 0}`}>
                        {(() => {
                          console.log('🔄 FINANCIAL CALCULATION: Starting with viewingFamily:', {
                            hasViewingFamily: !!viewingFamily,
                            pledgesCount: viewingFamily?.pledges?.length || 0,
                            pledges: viewingFamily?.pledges?.map(p => ({ id: p.id, description: p.description, isAnnualPledge: p.isAnnualPledge })) || []
                          })
                          
                          const annualPledgesPending = (viewingFamily?.pledges || []).reduce((sum, pledge) => {
                            console.log('🔍 ANNUAL PLEDGE CHECK:', { 
                              pledge: pledge?.description, 
                              status: pledge?.status, 
                              isAnnualPledge: pledge?.isAnnualPledge, 
                              amount: pledge?.amount 
                            })
                            if (pledge && pledge.status === 'pending' && pledge.isAnnualPledge) {
                              const amount = typeof pledge.amount === 'string' ? parseFloat(pledge.amount) : pledge.amount
                              console.log('✅ ANNUAL PLEDGE FOUND:', { description: pledge.description, amount })
                              return sum + (isNaN(amount) ? 0 : amount)
                            }
                            return sum
                          }, 0)
                          const formatted = formatCurrency(annualPledgesPending, viewingFamily?.currency || 'NIS')
                          console.log('💰 ANNUAL PLEDGES PENDING TOTAL:', annualPledgesPending, 'FORMATTED:', formatted)
                          return formatted
                        })()}
                       </Typography>
                     </Box>
                     
                     <Box sx={{ mb: 2 }}>
                       <Typography variant="body2" color="text.secondary">
                         Total Donations Pending
                       </Typography>
                       <Typography variant="h6" sx={{ color: '#FF5722' }}>
                         {(() => {
                           const totalDonationsPending = (viewingFamily?.pledges || []).reduce((sum, pledge) => {
                             if (pledge && pledge.status === 'pending') {
                               const amount = typeof pledge.amount === 'string' ? parseFloat(pledge.amount) : pledge.amount
                               return sum + (isNaN(amount) ? 0 : amount)
                             }
                             return sum
                           }, 0)
                           return formatCurrency(totalDonationsPending, viewingFamily?.currency || 'NIS')
                         })()}
                       </Typography>
                     </Box>
                     
                     <Box sx={{ mb: 2 }}>
                       <Typography variant="body2" color="text.secondary">
                         Annual Donations Paid
                       </Typography>
                       <Typography variant="h6" sx={{ color: '#4CAF50' }}>
                         {(() => {
                           const annualDonationsPaid = (viewingFamily?.pledges || []).reduce((sum, pledge) => {
                             if (pledge && (pledge.status === 'fulfilled' || pledge.status === 'partial') && pledge.isAnnualPledge) {
                               const amount = typeof pledge.amount === 'string' ? parseFloat(pledge.amount) : pledge.amount
                               return sum + (isNaN(amount) ? 0 : amount)
                             }
                             return sum
                           }, 0)
                           return formatCurrency(annualDonationsPaid, viewingFamily?.currency || 'NIS')
                         })()}
                       </Typography>
                     </Box>
                     
                     <Box sx={{ mb: 2 }}>
                       <Typography variant="body2" color="text.secondary">
                         Total Donations Paid
                       </Typography>
                       <Typography variant="h6" sx={{ color: '#2196F3' }}>
                         {(() => {
                           const totalDonationsPaid = (viewingFamily?.pledges || []).reduce((sum, pledge) => {
                             if (pledge && (pledge.status === 'fulfilled' || pledge.status === 'partial')) {
                               const amount = typeof pledge.amount === 'string' ? parseFloat(pledge.amount) : pledge.amount
                               return sum + (isNaN(amount) ? 0 : amount)
                             }
                             return sum
                           }, 0)
                           return formatCurrency(totalDonationsPaid, viewingFamily?.currency || 'NIS')
                         })()}
                       </Typography>
                     </Box>
                   </Grid>
                 </Grid>
               </Box>
             )}
            
            {/* Events Tab */}
            {familyDetailTab === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, color: '#4A148C' }}>
                  Event Sponsorships
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Event sponsorship tracking coming soon...
                </Typography>
              </Box>
            )}
            
                         {/* Family Tree Tab */}
             {familyDetailTab === 4 && (
               <Box>
                 <Typography variant="h6" sx={{ mb: 3, color: '#4A148C' }}>
                   Family Tree
                 </Typography>
                 
                 <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                   Multi-generational family tree view coming soon...
                 </Typography>
               </Box>
             )}
             
             {/* Yahrzeits Tab */}
             {familyDetailTab === 6 && (
               <Box>
                 <Typography variant="h6" sx={{ mb: 3, color: '#4A148C' }}>
                   Family Yahrzeits
                 </Typography>
                 
                 {(() => {
                   // Get all Yahrzeit information from family members
                   const familyMembersWithYahrzeits = familyMembers
                     .filter(m => m.familyId === viewingFamily.id)
                     .filter(m => m.memorialInstructions && m.memorialInstructions.trim())
                   
                   if (familyMembersWithYahrzeits.length === 0) {
                     return (
                       <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                         No Yahrzeit information recorded for this family yet.
                       </Typography>
                     )
                   }
                   
                   return (
                     <Grid container spacing={2}>
                       {familyMembersWithYahrzeits.map((member) => {
                         const yahrzeitStrings = member.memorialInstructions!.split(';').map(s => s.trim()).filter(s => s)
                         
                         return yahrzeitStrings.map((yahrzeit, index) => {
                           // Parse Yahrzeit entry
                           const parts = yahrzeit.split(':').map(p => p.trim())
                           const nameAndRelationship = parts[0] || ''
                           const hebrewDate = parts[1] || ''
                           
                           // Extract name and relationship
                           const relationshipMatch = nameAndRelationship.match(/^(.+?)\s*\(([^)]+)\)$/)
                           const nameOfPerson = relationshipMatch ? relationshipMatch[1].trim() : nameAndRelationship
                           const relationship = relationshipMatch ? relationshipMatch[2].trim() : ''
                           
                           return (
                             <Grid item xs={12} md={6} key={`${member.id}-${index}`}>
                               <Card sx={{ 
                                 border: '1px solid #E0E0E0',
                                 bgcolor: '#F8F9FA'
                               }}>
                                 <CardContent>
                                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                     <Box sx={{ flexGrow: 1 }}>
                                       <Typography variant="h6" sx={{ fontWeight: 500, color: '#4A148C' }}>
                                         {nameOfPerson}
                                       </Typography>
                                       <Typography variant="body2" color="text.secondary">
                                         {relationship && `Relationship: ${formatYahrzeitRelationship(relationship)}`}
                                       </Typography>
                                       <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                         Hebrew Date: {hebrewDate}
                                       </Typography>
                                       <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                         Remembered by: {member.firstName} {member.lastName}
                                       </Typography>
                                     </Box>
                                   </Box>
                                 </CardContent>
                               </Card>
                             </Grid>
                           )
                         })
                       })}
                     </Grid>
                   )
                 })()}
               </Box>
             )}
             
                           {/* Important Dates Tab */}
              {familyDetailTab === 5 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, color: '#4A148C' }}>
                    Important Family Dates
                  </Typography>
                  
                  {/* Overall Empty State Message */}
                  {(() => {
                    const hasAnyDates = familyMembers
                      .filter(m => m.familyId === viewingFamily.id)
                      .some(m => m.dateOfBirth || m.aliyahDate) || 
                      savedAdditionalDates.length > 0 ||
                      viewingFamily.weddingAnniversary
                    
                    if (!hasAnyDates) {
                      return (
                        <Box sx={{ 
                          mb: 4, 
                          p: 4, 
                          border: '2px dashed #E0E0E0', 
                          borderRadius: 2, 
                          bgcolor: '#FAFAFA',
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" sx={{ mb: 2, color: '#6A1B9A' }}>
                            📅 No Important Dates Recorded Yet
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            This family doesn't have any important dates recorded yet. You can add:
                          </Typography>
                          <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              • Birth dates for family members
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              • Wedding anniversaries
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              • Aliyah dates
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              • Custom important dates
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                            Use the sections below to add important dates for this family.
                          </Typography>
                        </Box>
                      )
                    }
                    return null
                  })()}
                  
                  <Grid container spacing={3}>
                    
                    
                                                               {/* Family-Level Important Dates Section */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#6A1B9A', borderBottom: '1px solid #E0E0E0', pb: 1 }}>
                          Family-Level Important Dates
                        </Typography>
                        <Grid container spacing={2}>
                          {/* Wedding Anniversary - Family Level */}
                          {viewingFamily.weddingAnniversary && (
                            <Grid item xs={12} md={6} key="family-anniversary">
                              <Card sx={{ border: '1px solid #E0E0E0', bgcolor: '#F8F9FA' }}>
                                <CardContent>
                                  <Typography variant="h6" sx={{ fontWeight: 500, color: '#4A148C' }}>
                                    💒 Family Wedding Anniversary
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    English: {new Date(viewingFamily.weddingAnniversary).toLocaleDateString()}
                                  </Typography>
                                  {viewingFamily.hebrewWeddingAnniversary && (
                                    <Typography variant="body2" color="text.secondary">
                                      Hebrew: {viewingFamily.hebrewWeddingAnniversary}
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          )}
                          
                          {(() => {
                            const hasFamilyDates = viewingFamily.weddingAnniversary
                            
                            if (!hasFamilyDates) {
                              return (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No family-level important dates recorded yet.
                                  </Typography>
                                </Grid>
                              )
                            }
                            return null
                          })()}
                        </Grid>
                      </Grid>
                      
                      {/* Member-Level Important Dates Section */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#6A1B9A', borderBottom: '1px solid #E0E0E0', pb: 1 }}>
                          Member-Level Important Dates
                        </Typography>
                        <Grid container spacing={2}>
                          {/* Birthdays */}
                          {familyMembers
                            .filter(m => m.familyId === viewingFamily.id && m.dateOfBirth)
                            .map((member) => (
                              <Grid item xs={12} md={6} key={`birthday-${member.id}`}>
                                <Card sx={{ border: '1px solid #E0E0E0', bgcolor: '#F8F9FA' }}>
                                  <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 500, color: '#4A148C' }}>
                                      🎂 {member.firstName} {member.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      English: {new Date(member.dateOfBirth!).toLocaleDateString()}
                                    </Typography>
                                    {member.hebrewBirthDate && (
                                      <Typography variant="body2" color="text.secondary">
                                        Hebrew: {member.hebrewBirthDate}
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          
                          {/* Aliyah Dates */}
                          {familyMembers
                            .filter(m => m.familyId === viewingFamily.id && m.aliyahDate)
                            .map((member) => (
                              <Grid item xs={12} md={6} key={`aliyah-${member.id}`}>
                                <Card sx={{ border: '1px solid #E0E0E0', bgcolor: '#F8F9FA' }}>
                                  <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 500, color: '#4A148C' }}>
                                      🏠 {member.firstName} {member.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      English: {new Date(member.aliyahDate!).toLocaleDateString()}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          
                          {(() => {
                            const hasMemberDates = familyMembers
                              .filter(m => m.familyId === viewingFamily.id)
                              .some(m => m.dateOfBirth || m.aliyahDate)
                            
                            if (!hasMemberDates) {
                              return (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No member-level important dates recorded for this family yet.
                                  </Typography>
                                </Grid>
                              )
                            }
                            return null
                          })()}
                        </Grid>
                      </Grid>
                    
                    {/* Yahrzeits Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#6A1B9A', borderBottom: '1px solid #E0E0E0', pb: 1 }}>
                        Yahrzeits
                      </Typography>
                      <Grid container spacing={2}>
                        {(() => {
                          const familyMembersWithYahrzeits = familyMembers
                            .filter(m => m.familyId === viewingFamily.id)
                            .filter(m => m.memorialInstructions && m.memorialInstructions.trim())
                          
                          if (familyMembersWithYahrzeits.length === 0) {
                            return (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  No Yahrzeit information recorded for this family yet.
                                </Typography>
                              </Grid>
                            )
                          }
                          
                          return familyMembersWithYahrzeits.map((member) => {
                            const yahrzeitStrings = member.memorialInstructions!.split(';').map(s => s.trim()).filter(s => s)
                            
                            return yahrzeitStrings.map((yahrzeit, index) => {
                              const parts = yahrzeit.split(':').map(p => p.trim())
                              const nameAndRelationship = parts[0] || ''
                              const hebrewDate = parts[1] || ''
                              
                              const relationshipMatch = nameAndRelationship.match(/^(.+?)\s*\(([^)]+)\)$/)
                              const nameOfPerson = relationshipMatch ? relationshipMatch[1].trim() : nameAndRelationship
                              const relationship = relationshipMatch ? relationshipMatch[2].trim() : ''
                              
                              return (
                                <Grid item xs={12} md={6} key={`yahrzeit-${member.id}-${index}`}>
                                  <Card sx={{ border: '1px solid #E0E0E0', bgcolor: '#F8F9FA' }}>
                                    <CardContent>
                                      <Typography variant="h6" sx={{ fontWeight: 500, color: '#4A148C' }}>
                                        {nameOfPerson}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {relationship && `Relationship: ${formatYahrzeitRelationship(relationship)}`}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Hebrew Date: {hebrewDate}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                        Remembered by: {member.firstName} {member.lastName}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              )
                            })
                          })
                        })()}
                      </Grid>
                    </Grid>
                    
                    
                    
                    {/* Additional Important Dates Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#6A1B9A', borderBottom: '1px solid #E0E0E0', pb: 1 }}>
                        Additional Important Dates
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Add additional important dates that aren't captured in the standard fields above.
                      </Typography>
                      
                      {/* Add Additional Date Button */}
                      <Box sx={{ mb: 3 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={handleAddAdditionalDate}
                          sx={{ color: '#6A1B9A', borderColor: '#6A1B9A' }}
                        >
                          + Add Additional Date
                        </Button>
                      </Box>
                      
                                             {/* Display Saved Additional Dates */}
                      {savedAdditionalDates.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                           <Typography variant="h6" sx={{ mb: 2, color: '#6A1B9A', borderBottom: '1px solid #E0E0E0', pb: 1 }}>
                             Saved Additional Dates
                           </Typography>
                           <Grid container spacing={2}>
                            {savedAdditionalDates.map((date) => (
                               <Grid item xs={12} md={6} key={`saved-${date.id}`}>
                                 <Card sx={{ border: '1px solid #E0E0E0', bgcolor: '#F8F9FA' }}>
                                   <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                     <Typography variant="h6" sx={{ fontWeight: 500, color: '#4A148C' }}>
                                       {getDateTypeLabel(date.type)}
                                       {date.type === 'other' && date.description && `: ${date.description}`}
                                     </Typography>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleEditAdditionalDate(date)}
                                          sx={{ color: '#6A1B9A' }}
                                        >
                                          <Edit />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDeleteAdditionalDate(date.id)}
                                          sx={{ color: '#E53935' }}
                                        >
                                          <Delete />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                     {date.memberName && (
                                       <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                         Member: {date.memberName}
                                       </Typography>
                                     )}
                                     {date.englishDate && (
                                       <Typography variant="body2" color="text.secondary">
                                         English: {formatDateForDisplay(date.englishDate)}
                                       </Typography>
                                     )}
                                     {date.hebrewDate && (
                                       <Typography variant="body2" color="text.secondary">
                                         Hebrew: {date.hebrewDate}
                                       </Typography>
                                     )}
                                   </CardContent>
                                 </Card>
                               </Grid>
                             ))}
                           </Grid>
                         </Box>
                       )}
                      
                    </Grid>
                  </Grid>
                </Box>
              )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Button onClick={() => setViewingFamily(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewingFamily(null)
                handleEditFamily(viewingFamily)
              }}
              variant="contained"
              sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}
            >
              Edit Family
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Member Confirmation Dialog */}
      <Dialog
        open={isDeleteMemberDialogOpen}
        onClose={() => setIsDeleteMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Confirm Delete Member
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1">
            Are you sure you want to delete{' '}
            <strong>{memberToDelete?.firstName} {memberToDelete?.lastName}</strong>?
          </Typography>
          
          {memberToDelete?.isPrimaryContact && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This member is marked as the primary contact for the family. 
              Consider updating the family's primary contact before deletion.
            </Alert>
          )}
          
          {(() => {
            const familyMembersCount = familyMembers.filter(m => m.familyId === memberToDelete?.familyId).length
            if (familyMembersCount <= 1) {
              return (
                <Alert severity="error" sx={{ mt: 2 }}>
                  This is the last member in the family. You cannot delete the last member.
                </Alert>
              )
            }
            return null
          })()}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. All member data, including contact information, 
            dates, and notes will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setIsDeleteMemberDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteMember}
            variant="contained"
            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
          >
            Delete Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Additional Date Form Modal */}
      <AdditionalDateFormDialog
        open={isAdditionalDateModalOpen}
        onClose={handleCloseAdditionalDateModal}
        onSave={handleSaveAdditionalDate}
        date={editingAdditionalDate}
        familyMembers={familyMembers.filter(m => m.familyId === viewingFamily?.id)}
        familyName={viewingFamily?.familyName || ''}
      />
    </Box>
  )
}



export default FamiliesPage 