import React from 'react'
import { Container, Paper, Box, Typography, TextField, Button, Alert } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = React.useState<string>('')

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      console.log('🚀 LoginPage: Starting login process')
      
      await login(data.email, data.password)
      console.log('✅ LoginPage: Login successful, navigating to dashboard')
      
      toast.success('Welcome to Pilzno Synagogue Management!')
      navigate('/dashboard')
    } catch (err: any) {
      console.error('❌ LoginPage: Login failed:', err)
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6A1B9A 0%, #9C4DCC 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: 'center',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(106, 27, 154, 0.3)',
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ mb: 4 }}>
            <img 
              src="/pilzno_logo.png" 
              alt="Pilzno Synagogue" 
              style={{ width: '120px', height: '120px', marginBottom: '16px' }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
              Pilzno Synagogue
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#6A1B9A' }}>
              בית הכנסת פילזנו
            </Typography>
            <Typography variant="body1" sx={{ color: '#424242' }}>
              Management System
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            <TextField
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              fullWidth
              label="Email Address"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 3 }}
            />

            <TextField
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              fullWidth
              label="Password"
              type="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                bgcolor: '#6A1B9A',
                '&:hover': {
                  bgcolor: '#9C4DCC',
                },
                '&:disabled': {
                  bgcolor: '#E0E0E0',
                  color: '#9E9E9E',
                },
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E0E0E0' }}>
            <Typography variant="body2" sx={{ color: '#616161' }}>
              Authorized access only. Contact the synagogue office for assistance.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default LoginPage 