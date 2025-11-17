import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '../services/apiService'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('synagogue_token'))
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔍 AuthContext: Initializing authentication state...')
      const storedToken = localStorage.getItem('synagogue_token')
      
      if (storedToken) {
        console.log('🔑 Found stored token, verifying with backend...')
        try {
          apiService.setAuthToken(storedToken)
          const response = await apiService.auth.verify()
          console.log('✅ Token verified successfully:', { userId: response.user.id, email: response.user.email })
          setUser(response.user)
          setToken(storedToken)
        } catch (error: any) {
          console.error('❌ Token verification failed:', error)
          console.error('   Error details:', {
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            url: error?.config?.url
          })
          console.log('🧹 Clearing invalid token from localStorage')
          localStorage.removeItem('synagogue_token')
          setToken(null)
          setUser(null)
        }
      } else {
        console.log('ℹ️ No stored token found, user needs to log in')
      }
      
      setIsLoading(false)
      console.log('✅ AuthContext: Initialization complete')
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log('🔐 Attempting login for:', email)
      
      const response = await apiService.auth.login(email, password)
      console.log('✅ Login successful:', response)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('synagogue_token', response.token)
      apiService.setAuthToken(response.token)
      
      console.log('🔑 Token stored:', response.token)
      console.log('👤 User set:', response.user)
      console.log('🔒 isAuthenticated will be:', !!(response.user && response.token))
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      const response = await apiService.auth.register(userData)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('synagogue_token', response.token)
      apiService.setAuthToken(response.token)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('synagogue_token')
    apiService.clearAuthToken()
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 