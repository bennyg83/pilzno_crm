import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material'
import {
  Close,
  Email,
  Phone,
  Cake,
  People,
  Work,
  Church,
  LocalHospital,
  Note,
  Star,
  Person
} from '@mui/icons-material'
import { FamilyMember } from '../types'
import dayjs from 'dayjs'

interface MemberViewDialogProps {
  open: boolean
  onClose: () => void
  member: FamilyMember | null
}

/**
 * MemberViewDialog - A read-only dialog for viewing member details
 * 
 * This component provides a comprehensive view of member information without
 * allowing editing. It displays all member data in an organized, easy-to-read format
 * that mirrors the tile view used in family details.
 * 
 * @param {boolean} open - Controls dialog visibility
 * @param {() => void} onClose - Callback when dialog is closed
 * @param {FamilyMember | null} member - The member to display (null when closed)
 */
const MemberViewDialog: React.FC<MemberViewDialogProps> = ({ open, onClose, member }) => {
  if (!member) return null

  /**
   * Calculate member's age from date of birth
   * @param {string} dateOfBirth - ISO date string
   * @returns {number | null} Age in years or null if invalid date
   */
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

  /**
   * Get priestly status information for display
   * @param {FamilyMember} member - The member to check
   * @returns {object | null} Status info with text and color
   */
  const getPriestlyStatus = (member: FamilyMember) => {
    if (member.isCohen) return { text: 'Cohen', color: '#FFD700' }
    if (member.isLevi) return { text: 'Levi', color: '#C0C0C0' }
    return null
  }

  /**
   * Format relationship for display
   * @param {string} relationship - The relationship string
   * @returns {string} Formatted relationship
   */
  const formatRelationship = (relationship: string) => {
    switch (relationship) {
      case 'husband': return 'Husband'
      case 'wife': return 'Wife'
      case 'son': return 'Son'
      case 'daughter': return 'Daughter'
      default: return relationship
    }
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    return dayjs(dateString).format('MMMM D, YYYY')
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: '#F8F9FA',
        borderBottom: '1px solid #E0E0E0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            size="large"
            sx={{ 
              bgcolor: '#6A1B9A', 
              color: 'white',
              '&:hover': { bgcolor: '#9C4DCC' }
            }}
          >
            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#4A148C' }}>
              {member.firstName} {member.lastName}
            </Typography>
            {(member.fullHebrewName || member.hebrewLastName) && (
              <Typography variant="body1" color="text.secondary">
                Hebrew Name: {member.fullHebrewName} {member.hebrewLastName}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#4A148C', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 20 }} />
                  Basic Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Family:</strong> {member.family?.familyName || 'Unknown Family'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Relationship:</strong> {formatRelationship(member.relationshipInHouse)}
                    </Typography>
                  </Box>

                  {member.dateOfBirth && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cake sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Date of Birth:</strong> {formatDate(member.dateOfBirth)}
                        {getAge(member.dateOfBirth) && ` (Age ${getAge(member.dateOfBirth)})`}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong> 
                      <Chip 
                        label={member.isActive ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={member.isActive ? 'success' : 'error'}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>

                  {member.isPrimaryContact && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star sx={{ fontSize: 16, color: '#FF9800' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Primary Contact</strong>
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#4A148C', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 20 }} />
                  Contact Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {member.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Email:</strong> {member.email}
                      </Typography>
                    </Box>
                  )}
                  
                  {member.cellPhone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Phone:</strong> {member.cellPhone}
                      </Typography>
                    </Box>
                  )}

                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Professional & Religious Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#4A148C', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work sx={{ fontSize: 20 }} />
                  Professional & Religious
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {member.profession && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Profession:</strong> {member.profession}
                      </Typography>
                    </Box>
                  )}

                  {member.synagogueRoles && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Church sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Synagogue Role:</strong> {member.synagogueRoles}
                      </Typography>
                    </Box>
                  )}

                  {getPriestlyStatus(member) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Church sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Priestly Status:</strong> 
                        <Chip 
                          label={getPriestlyStatus(member)!.text} 
                          size="small" 
                          sx={{ 
                            bgcolor: getPriestlyStatus(member)!.color, 
                            color: 'black',
                            ml: 1
                          }} 
                        />
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes & Additional Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#4A148C', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Note sx={{ fontSize: 20 }} />
                  Notes & Additional Info
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {member.medicalNotes && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocalHospital sx={{ fontSize: 16, color: '#666', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Medical Notes:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {member.medicalNotes}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {member.notes && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Note sx={{ fontSize: 16, color: '#666', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          General Notes:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {member.notes}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {!member.medicalNotes && !member.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No additional notes available
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#F8F9FA', borderTop: '1px solid #E0E0E0' }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#9C4DCC' } }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MemberViewDialog
