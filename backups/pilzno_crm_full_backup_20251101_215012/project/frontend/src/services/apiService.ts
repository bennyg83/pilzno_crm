import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { User, Family, FamilyMember, AuthResponse, RegisterData } from '../types'
import { BACKEND_CONFIG } from '../config/backend-config'

const API_BASE_URL = BACKEND_CONFIG.API_BASE_URL

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.clearAuthToken()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  clearAuthToken() {
    delete this.api.defaults.headers.common['Authorization']
  }

  // Authentication endpoints
  auth = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
        email,
        password,
      })
      return response.data
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData)
      return response.data
    },

    verify: async (): Promise<{ message: string; user: User }> => {
      const response = await this.api.get('/auth/verify')
      return response.data
    },
  }

  // Family management endpoints (placeholder - will be implemented in PROMPT 3)
  families = {
    getAll: async (params?: any): Promise<{ families: Family[]; total: number }> => {
      const response = await this.api.get('/families', { params })
      return response.data
    },

    getById: async (id: string): Promise<Family> => {
      const response = await this.api.get(`/families/${id}`)
      return response.data
    },

    create: async (familyData: any): Promise<Family> => {
      const response = await this.api.post('/families', familyData)
      return response.data
    },

    update: async (id: string, familyData: any): Promise<Family> => {
      const response = await this.api.put(`/families/${id}`, familyData)
      return response.data
    },

    delete: async (id: string): Promise<void> => {
      await this.api.delete(`/families/${id}`)
    },

    getStatistics: async (): Promise<any> => {
      const response = await this.api.get('/families/statistics')
      return response.data
    },
  }

  // Family member management endpoints
  familyMembers = {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      familyId?: string;
      search?: string;
      isActive?: string;
      relationshipInHouse?: string;
    }): Promise<{ members: FamilyMember[]; total: number }> => {
      const response = await this.api.get('/family-members', { params })
      return response.data
    },

    getById: async (id: string): Promise<FamilyMember> => {
      const response = await this.api.get(`/family-members/${id}`)
      return response.data
    },

    create: async (memberData: any): Promise<{ message: string; member: FamilyMember }> => {
      const response = await this.api.post('/family-members', memberData)
      return response.data
    },

    update: async (id: string, memberData: any): Promise<{ message: string; member: FamilyMember }> => {
      const response = await this.api.put(`/family-members/${id}`, memberData)
      return response.data
    },

    delete: async (id: string): Promise<void> => {
      await this.api.delete(`/family-members/${id}`)
    },

    getBirthdaysThisMonth: async (): Promise<{
      birthdays: FamilyMember[];
      month: number;
      total: number;
    }> => {
      const response = await this.api.get('/family-members/special/birthdays-this-month');
      return response.data;
    },

    getYahrzeitsThisMonth: async (): Promise<{
      yahrzeits: FamilyMember[];
      month: number;
      total: number;
    }> => {
      const response = await this.api.get('/family-members/special/yahrzeits-this-month');
      return response.data;
    },

    getUpcomingBnaiMitzvah: async (): Promise<{
      upcomingBnaiMitzvah: FamilyMember[];
      total: number;
    }> => {
      const response = await this.api.get('/family-members/special/upcoming-bnai-mitzvah');
      return response.data;
    },
  }

  // Pledge management endpoints
  pledges = {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      familyId?: string;
      status?: string;
    }): Promise<{ pledges: any[]; total: number }> => {
      const response = await this.api.get('/pledges', { params })
      return response.data
    },

    getById: async (id: string): Promise<any> => {
      const response = await this.api.get(`/pledges/${id}`)
      return response.data
    },

    create: async (pledgeData: any): Promise<{ message: string; pledge: any }> => {
      const response = await this.api.post('/pledges', pledgeData)
      return response.data
    },

    update: async (id: string, pledgeData: any): Promise<{ message: string; pledge: any }> => {
      const response = await this.api.put(`/pledges/${id}`, pledgeData)
      return response.data
    },

    delete: async (id: string): Promise<void> => {
      await this.api.delete(`/pledges/${id}`)
    },
  }

  // Additional important dates management endpoints
  additionalDates = {
    getByFamily: async (familyId: string): Promise<{ additionalDates: any[]; total: number; message: string }> => {
      const response = await this.api.get(`/additional-dates/family/${familyId}`)
      return response.data
    },

    create: async (dateData: any): Promise<{ additionalDate: any; message: string }> => {
      const response = await this.api.post('/additional-dates', dateData)
      return response.data
    },

    update: async (id: string, dateData: any): Promise<{ additionalDate: any; message: string }> => {
      const response = await this.api.put(`/additional-dates/${id}`, dateData)
      return response.data
    },

    delete: async (id: string): Promise<{ message: string }> => {
      const response = await this.api.delete(`/additional-dates/${id}`)
      return response.data
    },
  }

  // Settings management endpoints
  users = {
    getAll: async (): Promise<{ users: any[] }> => {
      const response = await this.api.get('/users')
      return response.data
    },

    getById: async (id: string): Promise<any> => {
      const response = await this.api.get(`/users/${id}`)
      return response.data
    },

    create: async (userData: any): Promise<any> => {
      const response = await this.api.post('/users', userData)
      return response.data
    },

    update: async (id: string, userData: any): Promise<any> => {
      const response = await this.api.put(`/users/${id}`, userData)
      return response.data
    },

    delete: async (id: string): Promise<void> => {
      await this.api.delete(`/users/${id}`)
    },
  }

  emailTemplates = {
    getAll: async (): Promise<{ templates: any[] }> => {
      const response = await this.api.get('/email-templates')
      return response.data
    },

    getById: async (id: string): Promise<any> => {
      const response = await this.api.get(`/email-templates/${id}`)
      return response.data
    },

    create: async (templateData: any): Promise<any> => {
      const response = await this.api.post('/email-templates', templateData)
      return response.data
    },

    update: async (id: string, templateData: any): Promise<any> => {
      const response = await this.api.put(`/email-templates/${id}`, templateData)
      return response.data
    },

    delete: async (id: string): Promise<void> => {
      await this.api.delete(`/email-templates/${id}`)
    },
  }

  systemSettings = {
    getAll: async (): Promise<{ settings: any[] }> => {
      const response = await this.api.get('/system-settings')
      return response.data
    },

    getByKey: async (key: string): Promise<any> => {
      const response = await this.api.get(`/system-settings/key/${key}`)
      return response.data
    },

    create: async (settingData: any): Promise<any> => {
      const response = await this.api.post('/system-settings', settingData)
      return response.data
    },

    update: async (id: string, settingData: any): Promise<any> => {
      const response = await this.api.put(`/system-settings/${id}`, settingData)
      return response.data
    },

    delete: async (id: string): Promise<void> => {
      await this.api.delete(`/system-settings/${id}`)
    },
  }

  userInvitations = {
    getAll: async (): Promise<{ invitations: any[] }> => {
      const response = await this.api.get('/user-invitations')
      return response.data
    },

    getById: async (id: string): Promise<any> => {
      const response = await this.api.get(`/user-invitations/${id}`)
      return response.data
    },

    create: async (invitationData: any): Promise<any> => {
      const response = await this.api.post('/user-invitations', invitationData)
      return response.data
    },

    update: async (id: string, invitationData: any): Promise<any> => {
      const response = await this.api.put(`/user-invitations/${id}`, invitationData)
      return response.data
    },

    delete: async (id: string): Promise<void> => {
      await this.api.delete(`/user-invitations/${id}`)
    },

    accept: async (id: string, token: string): Promise<any> => {
      const response = await this.api.post(`/user-invitations/${id}/accept`, { token })
      return response.data
    },
  }

  // Health check
  health = {
    check: async (): Promise<{ status: string; service: string; timestamp: string }> => {
      const response = await this.api.get('/health')
      return response.data
    },
  }
}

export const apiService = new ApiService() 