import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import FamiliesPage from './pages/FamiliesPage'
import MembersPage from './pages/MembersPage'
import EventsPage from './pages/EventsPage'
import DonationsPage from './pages/DonationsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <Box sx={{ height: '100vh', overflow: 'hidden' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/families"
            element={
              <PrivateRoute>
                <Layout>
                  <FamiliesPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/members"
            element={
              <PrivateRoute>
                <Layout>
                  <MembersPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Layout>
                  <EventsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <PrivateRoute>
                <Layout>
                  <DonationsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
    </AuthProvider>
  )
}

export default App 