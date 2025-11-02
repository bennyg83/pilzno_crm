import React from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { Home, ErrorOutline } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh' 
      }}
    >
      <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 500 }}>
        <ErrorOutline sx={{ fontSize: 100, color: '#4A148C', mb: 2 }} />
        <Typography variant="h1" sx={{ color: '#4A148C', fontWeight: 700, fontSize: '4rem', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: '#4A148C', fontWeight: 600, mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: '#7B1FA2', mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/dashboard')}
          sx={{
            bgcolor: '#4A148C',
            color: '#FFD700',
            '&:hover': {
              bgcolor: '#7B1FA2',
            },
          }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  )
}

export default NotFoundPage 