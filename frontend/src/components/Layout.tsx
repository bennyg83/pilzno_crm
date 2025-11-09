import React from 'react'
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Chip } from '@mui/material'
import { Dashboard, People, Person, Event, MonetizationOn, Settings, Logout } from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 280

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', available: true },
    { text: 'Families', icon: <People />, path: '/families', available: true },
    { text: 'Members', icon: <Person />, path: '/members', available: true },
    { text: 'Events', icon: <Event />, path: '/events', available: false, phase: 'Phase 3' },
    { text: 'Donations', icon: <MonetizationOn />, path: '/donations', available: true },
    { text: 'Settings', icon: <Settings />, path: '/settings', available: true },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavigation = (item: any) => {
    if (item.available) {
      navigate(item.path)
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: 'white' }}>
            Pilzno Synagogue Management
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
            Welcome, {user?.firstName} {user?.lastName}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Logo Section */}
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #E0E0E0' }}>
          <img 
            src={`${import.meta.env.BASE_URL || '/'}pilzno_logo.png`}
            alt="Pilzno Synagogue" 
            style={{ width: '80px', height: '80px', marginBottom: '8px' }}
          />
          <Typography variant="h6" sx={{ color: '#6A1B9A', fontWeight: 600, fontSize: '1rem' }}>
            בית הכנסת פילזנו
          </Typography>
          <Typography variant="body2" sx={{ color: '#424242', fontSize: '0.875rem' }}>
            Management System
          </Typography>
        </Box>

        {/* Navigation Menu */}
        <List sx={{ flexGrow: 1, pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path && item.available}
                onClick={() => handleNavigation(item)}
                disabled={!item.available}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: '#E8F5E8',
                    color: '#2E7D32',
                    '& .MuiListItemIcon-root': {
                      color: '#2E7D32',
                    },
                  },
                  '&:hover': {
                    bgcolor: item.available ? '#F3E5F5' : 'transparent',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path && item.available ? '#2E7D32' : '#6A1B9A',
                  opacity: item.available ? 1 : 0.5
                }}>
                  {item.icon}
                </ListItemIcon>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiTypography-root': { 
                        fontWeight: location.pathname === item.path && item.available ? 600 : 400,
                        color: item.available ? 'inherit' : '#9E9E9E'
                      } 
                    }} 
                  />
                  {!item.available && item.phase && (
                    <Chip 
                      label={item.phase}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: '20px',
                        bgcolor: '#FFF3E0',
                        color: '#E65100',
                        '& .MuiChip-label': {
                          px: 1,
                        }
                      }}
                    />
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Phase Information */}
        <Box sx={{ p: 2, borderTop: '1px solid #E0E0E0', bgcolor: '#F8F9FA' }}>
          <Typography variant="caption" sx={{ color: '#616161', fontWeight: 500 }}>
            Current: Phase 2 Complete ✓
          </Typography>
          <Typography variant="caption" sx={{ color: '#616161', display: 'block', mt: 0.5 }}>
            Next: Events & Donations
          </Typography>
        </Box>

        {/* Logout Button */}
        <Box sx={{ p: 2, borderTop: '1px solid #E0E0E0' }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: '#D32F2F',
              '&:hover': {
                bgcolor: '#FFEBEE',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#D32F2F' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#FAFAFA',
          p: 3,
          mt: 8, // Account for AppBar height
          height: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout 