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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material'
import {
  Add,
  Search,
  Email,
  Phone,
  Cake,
  Edit,
  Delete,
  People,
  Star,
  Work,
  Group,
  Church,
  Favorite,
  LocalHospital,
  Note,
  Visibility
} from '@mui/icons-material'
import { apiService } from '../services/apiService'
import { FamilyMember, Family } from '../types'
import FamilyMemberFormDialog from '../components/FamilyMemberFormDialog'
import MemberViewDialog from '../components/MemberViewDialog'
import toast from 'react-hot-toast'

const MembersPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRelationship, setFilterRelationship] = useState<string>('all')
  const [filterActiveStatus, setFilterActiveStatus] = useState<string>('true')

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null)
  
  // View dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingMember, setViewingMember] = useState<FamilyMember | null>(null)

  // Load families for the form
  const loadFamilies = async () => {
    try {
      const response = await apiService.families.getAll()
      setFamilies(response.families || [])
    } catch (error) {
      console.error('Error loading families:', error)
    }
  }

  // Load members from API
  const loadMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = {
        search: searchTerm || undefined,
        relationshipInHouse: filterRelationship !== 'all' ? filterRelationship : undefined,
        isActive: filterActiveStatus
      }
      
      const response = await apiService.familyMembers.getAll(params)
      setMembers(response.members || [])
      
      // Debug logging
      console.log('Loaded members from API:', response.members?.length || 0)
    } catch (error: any) {
      console.error('Error loading members:', error)
      setError('Failed to load members. Please try again.')
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    loadFamilies()
    loadMembers()
  }, [searchTerm, filterRelationship, filterActiveStatus])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const getAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getPriestlyStatus = (member: FamilyMember) => {
    if (member.isCohen) return { text: 'Cohen', color: '#FFD700' }
    if (member.isLevi) return { text: 'Levi', color: '#C0C0C0' }
    return null
  }

  const formatRelationship = (relationship: string) => {
    switch (relationship) {
      case 'husband':
        return 'Husband'
      case 'wife':
        return 'Wife'
      case 'son':
        return 'Son'
      case 'daughter':
        return 'Daughter'
      default:
        return relationship
    }
  }

  // Form dialog handlers
  const handleAddMember = () => {
    setEditingMember(null)
    setIsFormDialogOpen(true)
  }

  const handleViewMember = (member: FamilyMember) => {
    setViewingMember(member)
    setIsViewDialogOpen(true)
  }

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member)
    setIsFormDialogOpen(true)
  }

  const handleDeleteMember = (member: FamilyMember) => {
    setMemberToDelete(member)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return

    try {
      await apiService.familyMembers.delete(memberToDelete.id)
      setMembers(prev => prev.filter(m => m.id !== memberToDelete.id))
      setIsDeleteDialogOpen(false)
      setMemberToDelete(null)
    } catch (error) {
      console.error('Error deleting member:', error)
      setError('Failed to delete member. Please try again.')
    }
  }

  const handleSaveMember = async (savedMember: FamilyMember) => {
    try {
      if (editingMember) {
        // Update existing member
        const response = await apiService.familyMembers.update(editingMember.id, savedMember)
        setMembers(prev => prev.map(m => m.id === savedMember.id ? savedMember : m))
        toast.success(response.message || 'Member updated successfully!')
      } else {
        // Create new member
        const response = await apiService.familyMembers.create(savedMember)
        setMembers(prev => [...prev, savedMember])
        toast.success(response.message || 'Member added successfully!')
      }
      setIsFormDialogOpen(false)
      setEditingMember(null)
    } catch (error: any) {
      console.error('Error saving member:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save member. Please try again.'
      toast.error(errorMessage)
    }
  }

  const filteredMembers = members.filter(member => 
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.fullHebrewName?.includes(searchTerm) ||
    member.hebrewLastName?.includes(searchTerm) ||
            member.family?.familyName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#4A148C', fontWeight: 600 }}>
          Member Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddMember}
          sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}
        >
          Add Member
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E8F5E8', borderLeft: '4px solid #4CAF50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                    {members.filter(m => m.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Members
                  </Typography>
                </Box>
                <Group sx={{ fontSize: 40, color: '#4CAF50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#FF9800' }}>
                    {/* birthdaysThisMonth.length */}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Birthdays This Month
                  </Typography>
                </Box>
                <Cake sx={{ fontSize: 40, color: '#FF9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#F3E5F5', borderLeft: '4px solid #9C27B0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#9C27B0' }}>
                    {/* yahrzeitsThisMonth.length */}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yahrzeits This Month
                  </Typography>
                </Box>
                                 <Favorite sx={{ fontSize: 40, color: '#9C27B0' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E3F2FD', borderLeft: '4px solid #2196F3' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#2196F3' }}>
                    {/* upcomingBnaiMitzvah.length */}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming B'nai Mitzvah
                  </Typography>
                </Box>
                <Star sx={{ fontSize: 40, color: '#2196F3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ bgcolor: '#FFFFFF', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: '1px solid #E0E0E0', bgcolor: '#F8F9FA' }}
        >
          <Tab label="All Members" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && (
            <>
              {/* Search and filters */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Relationship</InputLabel>
                      <Select
                        value={filterRelationship}
                        label="Relationship"
                        onChange={(e) => setFilterRelationship(e.target.value)}
                      >
                        <MenuItem value="all">All Relationships</MenuItem>
                        <MenuItem value="husband">Husband</MenuItem>
                        <MenuItem value="wife">Wife</MenuItem>
                        <MenuItem value="son">Son</MenuItem>
                        <MenuItem value="daughter">Daughter</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterActiveStatus}
                        label="Status"
                        onChange={(e) => setFilterActiveStatus(e.target.value)}
                      >
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Inactive</MenuItem>
                        <MenuItem value="all">All</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm('')
                        setFilterRelationship('all')
                        setFilterActiveStatus('true')
                      }}
                    >
                      Clear
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Members grid */}
              {isLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              ) : filteredMembers.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredMembers.map((member) => (
                    <Grid item key={member.id} xs={12} sm={6} md={4} lg={3}>
                      <Card elevation={3} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <IconButton
                              size="small"
                              sx={{ 
                                bgcolor: '#6A1B9A', 
                                color: 'white', 
                                mr: 2,
                                '&:hover': { bgcolor: '#9C4DCC' }
                              }}
                            >
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </IconButton>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {member.firstName} {member.lastName}
                              </Typography>
                              {(member.fullHebrewName || member.hebrewLastName) && (
                                <Typography variant="body2" color="text.secondary">
                                  Hebrew Name: {member.fullHebrewName} {member.hebrewLastName}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {!member.isActive && (
                                <Chip label="Inactive" size="small" color="error" />
                              )}
                            </Box>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <People sx={{ fontSize: 16, mr: 1 }} />
                              {member.family?.familyName || 'Unknown Family'} - {formatRelationship(member.relationshipInHouse)}
                            </Typography>
                            
                            {member.email && (
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Email sx={{ fontSize: 16, mr: 1 }} />
                                {member.email}
                              </Typography>
                            )}
                            
                            {member.cellPhone && (
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Phone sx={{ fontSize: 16, mr: 1 }} />
                                {member.cellPhone}
                              </Typography>
                            )}
                            
                            {member.dateOfBirth && (
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Cake sx={{ fontSize: 16, mr: 1 }} />
                                Age {getAge(member.dateOfBirth)}
                              </Typography>
                            )}
                            
                            {member.medicalNotes && (
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, fontStyle: 'italic' }}>
                                <LocalHospital sx={{ fontSize: 16, mr: 1 }} />
                                {member.medicalNotes}
                              </Typography>
                            )}
                            
                            {member.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, fontStyle: 'italic' }}>
                                <Note sx={{ fontSize: 16, mr: 1 }} />
                                {member.notes}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {member.isPrimaryContact && (
                              <Chip label="Primary Contact" size="small" color="primary" />
                            )}
                            {getPriestlyStatus(member) && (
                              <Chip 
                                label={getPriestlyStatus(member)!.text} 
                                size="small" 
                                sx={{ bgcolor: getPriestlyStatus(member)!.color, color: 'black' }}
                              />
                            )}
                            {member.profession && (
                              <Tooltip title={member.profession}>
                                <Chip label="Professional" size="small" icon={<Work />} />
                              </Tooltip>
                            )}
                            {member.synagogueRoles && (
                              <Tooltip title={member.synagogueRoles}>
                                <Chip label="Synagogue Role" size="small" icon={<Church />} />
                              </Tooltip>
                            )}
                          </Box>
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button size="small" startIcon={<Visibility />} onClick={() => handleViewMember(member)}>
                            View
                          </Button>
                          <Button size="small" startIcon={<Edit />} onClick={() => handleEditMember(member)}>
                            Edit
                          </Button>
                          <IconButton size="small" color="error" onClick={() => handleDeleteMember(member)}>
                            <Delete />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" minHeight="200px" justifyContent="center">
                  <People sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No members found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {members.length === 0 ? 'No members have been added yet.' : 'No members match your search criteria.'}
                  </Typography>
                </Box>
              )}

              {!isLoading && !error && filteredMembers.length === 0 && members.length > 0 && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  No members found matching your search criteria.
                </Alert>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* Member View Dialog */}
      <MemberViewDialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        member={viewingMember}
      />

      {/* Family Member Form Dialog */}
      <FamilyMemberFormDialog
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSave={handleSaveMember}
        member={editingMember}
        families={families}
        onRefresh={async () => {
          // Refresh members list to ensure data is up to date
          await loadMembers()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {memberToDelete?.firstName} {memberToDelete?.lastName}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MembersPage 