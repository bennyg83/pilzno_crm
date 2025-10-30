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
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Settings,
  People,
  Email,
  Security,
  Refresh
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { apiService } from '../services/apiService'
import {
  UserRole,
  Permission,
  SystemUser,
  EmailTemplate,
  SystemSettings,
  UserInvitation,
  UserFormData,
  EmailTemplateFormData,
  SystemSettingFormData,
  UserInvitationFormData
} from '../types'

const SettingsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [users, setUsers] = useState<SystemUser[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings[]>([])
  const [userInvitations, setUserInvitations] = useState<UserInvitation[]>([])
  
  // Dialog states
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isEmailTemplateDialogOpen, setIsEmailTemplateDialogOpen] = useState(false)
  const [isSystemSettingDialogOpen, setIsSystemSettingDialogOpen] = useState(false)
  const [isUserInvitationDialogOpen, setIsUserInvitationDialogOpen] = useState(false)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  
  // Editing states
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null)
  const [editingSystemSetting, setEditingSystemSetting] = useState<SystemSettings | null>(null)
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null)
  
  // Form states
  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.USER,
    permissions: [],
    isActive: true
  })
  
  const [emailTemplateFormData, setEmailTemplateFormData] = useState<EmailTemplateFormData>({
    name: '',
    subject: '',
    body: '',
    category: 'custom',
    isActive: true
  })
  
  const [systemSettingFormData, setSystemSettingFormData] = useState<SystemSettingFormData>({
    key: '',
    value: '',
    description: '',
    category: 'general'
  })
  
  const [userInvitationFormData, setUserInvitationFormData] = useState<UserInvitationFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.USER,
    permissions: [],
    expiresInDays: 7
  })

  // Load all data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load data with error handling for each endpoint
      const promises = []
      
      // Try to load users (requires MANAGE_USERS permission)
      promises.push(
        apiService.users.getAll().catch(error => {
          console.warn('Users API not accessible (permission required):', error)
          return { users: [] }
        })
      )
      
      // Try to load email templates
      promises.push(
        apiService.emailTemplates.getAll().catch(error => {
          console.warn('Email templates API error:', error)
          return { templates: [] }
        })
      )
      
      // Try to load system settings
      promises.push(
        apiService.systemSettings.getAll().catch(error => {
          console.warn('System settings API error:', error)
          return { settings: [] }
        })
      )
      
      // Try to load user invitations
      promises.push(
        apiService.userInvitations.getAll().catch(error => {
          console.warn('User invitations API error:', error)
          return { invitations: [] }
        })
      )
      
      const [usersData, templatesData, settingsData, invitationsData] = await Promise.all(promises)
      
      setUsers((usersData as any).users || [])
      setEmailTemplates((templatesData as any).templates || [])
      setSystemSettings((settingsData as any).settings || [])
      setUserInvitations((invitationsData as any).invitations || [])
      
    } catch (error: any) {
      console.error('Error loading settings data:', error)
      setError('Failed to load settings data. Some features may not be available due to insufficient permissions.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  // User Management Functions
  const handleAddUser = () => {
    setEditingUser(null)
    setUserFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: UserRole.USER,
      permissions: [],
      isActive: true
    })
    setIsUserDialogOpen(true)
  }

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user)
    setUserFormData({
      email: user.email,
      password: '', // Don't populate password for editing
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions || [],
      isActive: user.isActive
    })
    setIsUserDialogOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await apiService.users.update(editingUser.id, userFormData)
        toast.success('User updated successfully!')
      } else {
        await apiService.users.create(userFormData)
        toast.success('User created successfully!')
      }
      
      setIsUserDialogOpen(false)
      await loadAllData()
      
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error.response?.data?.message || 'Failed to save user')
    }
  }

  const handleDeleteUser = (user: SystemUser) => {
    setUserToDelete(user)
    setIsDeleteUserDialogOpen(true)
  }

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await apiService.users.delete(userToDelete.id)
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
      setIsDeleteUserDialogOpen(false)
      setUserToDelete(null)
      toast.success('User deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  // Email Template Management Functions
  const handleAddEmailTemplate = () => {
    setEditingEmailTemplate(null)
    setEmailTemplateFormData({
      name: '',
      subject: '',
      body: '',
      category: 'custom',
      isActive: true
    })
    setIsEmailTemplateDialogOpen(true)
  }

  const handleEditEmailTemplate = (template: EmailTemplate) => {
    setEditingEmailTemplate(template)
    setEmailTemplateFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      isActive: template.isActive
    })
    setIsEmailTemplateDialogOpen(true)
  }

  const handleSaveEmailTemplate = async () => {
    try {
      if (editingEmailTemplate) {
        await apiService.emailTemplates.update(editingEmailTemplate.id, emailTemplateFormData)
        toast.success('Email template updated successfully!')
      } else {
        await apiService.emailTemplates.create(emailTemplateFormData)
        toast.success('Email template created successfully!')
      }
      
      setIsEmailTemplateDialogOpen(false)
      await loadAllData()
      
    } catch (error: any) {
      console.error('Error saving email template:', error)
      toast.error(error.response?.data?.message || 'Failed to save email template')
    }
  }

  // System Settings Management Functions
  const handleAddSystemSetting = () => {
    setEditingSystemSetting(null)
    setSystemSettingFormData({
      key: '',
      value: '',
      description: '',
      category: 'general'
    })
    setIsSystemSettingDialogOpen(true)
  }

  const handleEditSystemSetting = (setting: SystemSettings) => {
    setEditingSystemSetting(setting)
    setSystemSettingFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description || '',
      category: setting.category
    })
    setIsSystemSettingDialogOpen(true)
  }

  const handleSaveSystemSetting = async () => {
    try {
      if (editingSystemSetting) {
        await apiService.systemSettings.update(editingSystemSetting.id, systemSettingFormData)
        toast.success('System setting updated successfully!')
      } else {
        await apiService.systemSettings.create(systemSettingFormData)
        toast.success('System setting created successfully!')
      }
      
      setIsSystemSettingDialogOpen(false)
      await loadAllData()
      
    } catch (error: any) {
      console.error('Error saving system setting:', error)
      toast.error(error.response?.data?.message || 'Failed to save system setting')
    }
  }

  // User Invitation Functions
  const handleAddUserInvitation = () => {
    setUserInvitationFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: UserRole.USER,
      permissions: [],
      expiresInDays: 7
    })
    setIsUserInvitationDialogOpen(true)
  }

  const handleSaveUserInvitation = async () => {
    try {
      await apiService.userInvitations.create(userInvitationFormData)
      toast.success('User invitation sent successfully!')
      setIsUserInvitationDialogOpen(false)
      await loadAllData()
      
    } catch (error: any) {
      console.error('Error sending user invitation:', error)
      toast.error(error.response?.data?.message || 'Failed to send user invitation')
    }
  }

  // Helper functions
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'error'
      case UserRole.ADMIN: return 'warning'
      case UserRole.MANAGER: return 'info'
      case UserRole.USER: return 'success'
      case UserRole.VIEWER: return 'default'
      default: return 'default'
    }
  }

  const getPermissionLabel = (permission: Permission) => {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reminder': return 'warning'
      case 'notification': return 'info'
      case 'announcement': return 'success'
      case 'custom': return 'default'
      default: return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading settings...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={loadAllData} size="small" sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          System Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadAllData}
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Users" icon={<People />} />
          <Tab label="Email Templates" icon={<Email />} />
          <Tab label="System Settings" icon={<Settings />} />
          <Tab label="User Invitations" icon={<Security />} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Users Tab */}
          {currentTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#4A148C' }}>
                  System Users ({users.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddUser}
                  sx={{ bgcolor: '#6A1B9A' }}
                >
                  Add User
                </Button>
              </Box>

              <Grid container spacing={2}>
                {users.map((user) => (
                  <Grid item xs={12} md={6} lg={4} key={user.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                          <Chip
                            label={user.role.replace('_', ' ')}
                            color={getRoleColor(user.role) as any}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Permissions:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {user.permissions?.slice(0, 3).map((permission) => (
                              <Chip
                                key={permission}
                                label={getPermissionLabel(permission)}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {user.permissions && user.permissions.length > 3 && (
                              <Chip
                                label={`+${user.permissions.length - 3} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                          />
                          {user.lastLoginAt && (
                            <Typography variant="caption" color="text.secondary">
                              Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditUser(user)}
                          sx={{ color: '#FFA726' }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteUser(user)}
                          sx={{ 
                            color: '#f44336',
                            borderColor: '#f44336',
                            '&:hover': {
                              backgroundColor: '#f44336',
                              color: 'white'
                            }
                          }}
                          variant="outlined"
                          disabled={user.id === 'f73fecb6-b366-49b7-b873-5bceb10deb07'} // Disable for main admin
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Email Templates Tab */}
          {currentTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#4A148C' }}>
                  Email Templates ({emailTemplates.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddEmailTemplate}
                  sx={{ bgcolor: '#6A1B9A' }}
                >
                  Add Template
                </Button>
              </Box>

              <Grid container spacing={2}>
                {emailTemplates.map((template) => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {template.name}
                          </Typography>
                          <Chip
                            label={template.category}
                            color={getCategoryColor(template.category) as any}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {template.subject}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Variables:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {template.variables?.slice(0, 3).map((variable) => (
                              <Chip
                                key={variable}
                                label={`{{${variable}}}`}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {template.variables && template.variables.length > 3 && (
                              <Chip
                                label={`+${template.variables.length - 3} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={template.isActive ? 'Active' : 'Inactive'}
                            color={template.isActive ? 'success' : 'error'}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(template.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditEmailTemplate(template)}
                          sx={{ color: '#FFA726' }}
                        >
                          Edit
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* System Settings Tab */}
          {currentTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#4A148C' }}>
                  System Settings ({systemSettings.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddSystemSetting}
                  sx={{ bgcolor: '#6A1B9A' }}
                >
                  Add Setting
                </Button>
              </Box>

              <Grid container spacing={2}>
                {systemSettings.map((setting) => (
                  <Grid item xs={12} md={6} lg={4} key={setting.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {setting.key}
                          </Typography>
                          <Chip
                            label={setting.category}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {setting.description}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Value:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            bgcolor: '#f5f5f5', 
                            p: 1, 
                            borderRadius: 1,
                            wordBreak: 'break-all'
                          }}>
                            {setting.value}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={setting.isEditable ? 'Editable' : 'Read-only'}
                            color={setting.isEditable ? 'success' : 'default'}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Updated: {new Date(setting.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>

                      {setting.isEditable && (
                        <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleEditSystemSetting(setting)}
                            sx={{ color: '#FFA726' }}
                          >
                            Edit
                          </Button>
                        </CardActions>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* User Invitations Tab */}
          {currentTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#4A148C' }}>
                  User Invitations ({userInvitations.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddUserInvitation}
                  sx={{ bgcolor: '#6A1B9A' }}
                >
                  Invite User
                </Button>
              </Box>

              <Grid container spacing={2}>
                {userInvitations.map((invitation) => (
                  <Grid item xs={12} md={6} lg={4} key={invitation.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {invitation.firstName} {invitation.lastName}
                          </Typography>
                          <Chip
                            label={invitation.role.replace('_', ' ')}
                            color={getRoleColor(invitation.role) as any}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {invitation.email}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Permissions:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {invitation.permissions?.slice(0, 3).map((permission) => (
                              <Chip
                                key={permission}
                                label={getPermissionLabel(permission)}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {invitation.permissions && invitation.permissions.length > 3 && (
                              <Chip
                                label={`+${invitation.permissions.length - 3} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={invitation.isAccepted ? 'Accepted' : 'Pending'}
                            color={invitation.isAccepted ? 'success' : 'warning'}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* User Dialog */}
      <Dialog
        open={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userFormData.firstName}
                onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userFormData.lastName}
                onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                required={!editingUser}
                helperText={editingUser ? "Leave blank to keep current password" : "Set initial password for the user"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userFormData.role}
                  label="Role"
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                >
                  {Object.values(UserRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userFormData.isActive}
                    onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  multiple
                  value={userFormData.permissions}
                  label="Permissions"
                  onChange={(e) => setUserFormData({ ...userFormData, permissions: e.target.value as Permission[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getPermissionLabel(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(Permission).map((permission) => (
                    <MenuItem key={permission} value={permission}>
                      {getPermissionLabel(permission)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Template Dialog */}
      <Dialog
        open={isEmailTemplateDialogOpen}
        onClose={() => setIsEmailTemplateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editingEmailTemplate ? 'Edit Email Template' : 'Add New Email Template'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={emailTemplateFormData.name}
                onChange={(e) => setEmailTemplateFormData({ ...emailTemplateFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={emailTemplateFormData.category}
                  label="Category"
                  onChange={(e) => setEmailTemplateFormData({ ...emailTemplateFormData, category: e.target.value as any })}
                >
                  <MenuItem value="reminder">Reminder</MenuItem>
                  <MenuItem value="notification">Notification</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={emailTemplateFormData.subject}
                onChange={(e) => setEmailTemplateFormData({ ...emailTemplateFormData, subject: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Body"
                multiline
                rows={8}
                value={emailTemplateFormData.body}
                onChange={(e) => setEmailTemplateFormData({ ...emailTemplateFormData, body: e.target.value })}
                required
                helperText="Use {{variable}} syntax for dynamic content"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailTemplateFormData.isActive}
                    onChange={(e) => setEmailTemplateFormData({ ...emailTemplateFormData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEmailTemplateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEmailTemplate} variant="contained">
            {editingEmailTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* System Setting Dialog */}
      <Dialog
        open={isSystemSettingDialogOpen}
        onClose={() => setIsSystemSettingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSystemSetting ? 'Edit System Setting' : 'Add New System Setting'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Setting Key"
                value={systemSettingFormData.key}
                onChange={(e) => setSystemSettingFormData({ ...systemSettingFormData, key: e.target.value })}
                required
                disabled={!!editingSystemSetting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={systemSettingFormData.category}
                  label="Category"
                  onChange={(e) => setSystemSettingFormData({ ...systemSettingFormData, category: e.target.value as any })}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="notifications">Notifications</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Value"
                value={systemSettingFormData.value}
                onChange={(e) => setSystemSettingFormData({ ...systemSettingFormData, value: e.target.value })}
                required
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={systemSettingFormData.description}
                onChange={(e) => setSystemSettingFormData({ ...systemSettingFormData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSystemSettingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSystemSetting} variant="contained">
            {editingSystemSetting ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Invitation Dialog */}
      <Dialog
        open={isUserInvitationDialogOpen}
        onClose={() => setIsUserInvitationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userInvitationFormData.firstName}
                onChange={(e) => setUserInvitationFormData({ ...userInvitationFormData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userInvitationFormData.lastName}
                onChange={(e) => setUserInvitationFormData({ ...userInvitationFormData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userInvitationFormData.email}
                onChange={(e) => setUserInvitationFormData({ ...userInvitationFormData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userInvitationFormData.role}
                  label="Role"
                  onChange={(e) => setUserInvitationFormData({ ...userInvitationFormData, role: e.target.value as UserRole })}
                >
                  {Object.values(UserRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expires In (Days)"
                type="number"
                value={userInvitationFormData.expiresInDays}
                onChange={(e) => setUserInvitationFormData({ ...userInvitationFormData, expiresInDays: parseInt(e.target.value) })}
                required
                inputProps={{ min: 1, max: 30 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  multiple
                  value={userInvitationFormData.permissions}
                  label="Permissions"
                  onChange={(e) => setUserInvitationFormData({ ...userInvitationFormData, permissions: e.target.value as Permission[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getPermissionLabel(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(Permission).map((permission) => (
                    <MenuItem key={permission} value={permission}>
                      {getPermissionLabel(permission)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUserInvitationDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveUserInvitation} variant="contained">
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={isDeleteUserDialogOpen}
        onClose={() => setIsDeleteUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#d32f2f' }}>
          Confirm Delete User
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong> ({userToDelete?.email})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. The user will be permanently removed from the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDeleteUser} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SettingsPage
