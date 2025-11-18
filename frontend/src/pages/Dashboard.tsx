import React, { useState, useEffect } from 'react'
import { Box, Typography, Grid, Card, CardContent, Alert, CircularProgress } from '@mui/material'
import { People, Person, Event, MonetizationOn } from '@mui/icons-material'
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
    </Box>
  )
}

export default Dashboard 