import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { Event } from '@mui/icons-material'

const EventsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, color: '#4A148C', fontWeight: 600 }}>
        Event Management
      </Typography>

      <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#FAFAFA', border: '2px dashed #4A148C' }}>
        <Event sx={{ fontSize: 80, color: '#4A148C', mb: 2 }} />
        <Typography variant="h5" sx={{ color: '#4A148C', fontWeight: 600, mb: 2 }}>
          Event Management Coming Soon
        </Typography>
        <Typography variant="body1" sx={{ color: '#7B1FA2', mb: 2 }}>
          Jewish lifecycle and community event management will be implemented in future phases.
        </Typography>
        <Typography variant="body2" sx={{ color: '#4A148C' }}>
          Features will include Bar/Bat Mitzvah, weddings, yahrzeits, holiday events, 
          and Hebrew calendar integration.
        </Typography>
      </Paper>
    </Box>
  )
}

export default EventsPage 