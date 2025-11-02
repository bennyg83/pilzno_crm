import React from 'react'
import { Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, token } = useAuth()

  console.log('🛡️ PrivateRoute check:', { isAuthenticated, isLoading, hasUser: !!user, hasToken: !!token })

  if (isLoading) {
    console.log('⏳ PrivateRoute: Still loading...')
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="#FAFAFA"
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: '#4A148C',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
      </Box>
    )
  }

  if (!isAuthenticated) {
    console.log('❌ PrivateRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('✅ PrivateRoute: Authenticated, rendering children')
  return <>{children}</>
} 