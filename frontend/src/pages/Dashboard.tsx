import React, { useState, useEffect } from 'react'
import { Box, Typography, Grid, Card, CardContent, Paper, Alert, CircularProgress } from '@mui/material'
import { People, Person, Event, MonetizationOn, Construction } from '@mui/icons-material'
import { apiService } from '../services/apiService'

interface DashboardStats {
  totalFamilies: number
  totalMembers: number
  upcomingEvents: number
  monthlyDonations: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalFamilies: 0,
    totalMembers: 0,
    upcomingEvents: 0,
    monthlyDonations: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch families and members
        const familiesResponse = await apiService.families.getAll()
        const membersResponse = await apiService.familyMembers.getAll()
        
        setStats({
          totalFamilies: familiesResponse.families?.length || 0,
          totalMembers: membersResponse.members?.length || 0,
          upcomingEvents: 0, // TODO: Implement when events are added
          monthlyDonations: 0 // TODO: Implement when donations are added
        })
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Community Dashboard
      </Typography>

      {/* Phase 1 Complete Notice */}
      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Phase 1 Complete! 🎉
        </Typography>
        <Typography variant="body2">
          Authentication system, database setup, and beautiful UI with authentic Pilzno emblem are all working perfectly.
        </Typography>
      </Alert>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#6A1B9A' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <People sx={{ fontSize: 40, mr: 2, color: '#FFFFFF' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {stats.totalFamilies}
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>Total Families</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFA726' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ fontSize: 40, mr: 2, color: '#FFFFFF' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {stats.totalMembers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>Community Members</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#43A047' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ fontSize: 40, mr: 2, color: '#FFFFFF' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {stats.upcomingEvents}
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>Upcoming Events</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FB8C00' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <MonetizationOn sx={{ fontSize: 40, mr: 2, color: '#FFFFFF' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {stats.monthlyDonations}
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>Monthly Donations</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Development Progress */}
      <Paper sx={{ p: 4, bgcolor: '#F8F9FA', border: '1px solid #E0E0E0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Construction sx={{ fontSize: 32, color: '#6A1B9A', mr: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#424242' }}>
            Development Progress
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#43A047', fontWeight: 600, mb: 1 }}>
                ✅ Phase 1 Complete
              </Typography>
              <ul style={{ color: '#424242', lineHeight: 1.6 }}>
                <li>Authentication system with JWT</li>
                <li>Beautiful UI with authentic Pilzno emblem</li>
                <li>PostgreSQL database setup</li>
                <li>Docker containerization</li>
                <li>Responsive design with Material-UI</li>
              </ul>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FB8C00', fontWeight: 600, mb: 1 }}>
                🚧 Coming in Phase 2
              </Typography>
              <ul style={{ color: '#424242', lineHeight: 1.6 }}>
                <li>Family Management with Hebrew names</li>
                <li>Member lifecycle tracking</li>
                <li>Bar/Bat Mitzvah & Yahrzeit tracking</li>
                <li>Advanced search and filtering</li>
                <li>Community health metrics</li>
              </ul>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, p: 3, bgcolor: '#E3F2FD', borderRadius: 2, border: '1px solid #BBDEFB' }}>
          <Typography variant="body1" sx={{ color: '#1565C0', fontWeight: 500, textAlign: 'center' }}>
            The comprehensive synagogue dashboard will display real family metrics, member lifecycle tracking, 
            donation analytics, and community engagement insights once Phase 2 is implemented.
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Dashboard 