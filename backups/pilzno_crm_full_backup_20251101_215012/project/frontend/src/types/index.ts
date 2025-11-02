// Shared types for the Pilzno CRM application

// Enums
export enum RelationshipInHouse {
  HUSBAND = 'husband',
  WIFE = 'wife',
  SON = 'son',
  DAUGHTER = 'daughter',
  SINGLE = 'single'
}

export enum Title {
  RABBI = 'rabbi',
  REBBETZIN = 'rebbetzin',
  DR = 'dr',
  MR = 'mr',
  MRS = 'mrs',
  MS = 'ms'
}

export enum YahrzeitRelationship {
  CHILD_OF = 'child_of',
  SIBLING_OF = 'parent_of',
  PARENT_OF = 'parent_of',
  GRANDCHILD_OF = 'grandchild_of',
  GRANDPARENT_OF = 'grandparent_of'
}

export enum AdditionalDateType {
  WEDDING_ANNIVERSARY = 'wedding_anniversary',
  ALIYAH_ANNIVERSARY = 'aliyah_anniversary',
  OTHER = 'other'
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface Family {
  id: string
  familyName: string
  hebrewFamilyName?: string
  primaryEmail?: string
  phone?: string
  address?: string
  city?: string
  membershipStatus: 'member' | 'prospective' | 'visitor' | 'former'
  familyHealth: string
  totalDonations: number
  annualPledge: number
  currency: 'NIS' | 'USD' | 'GBP'
  isFoundingFamily: boolean
  isBoardFamily: boolean
  memberCount: number
  createdAt: string
  // Contact and follow-up
  lastContactDate?: string
  nextFollowUpDate?: string

  // Wedding anniversary
  weddingAnniversary?: string
  hebrewWeddingAnniversary?: string

  // Family health and engagement
  
  // Financial data
  pledges?: Pledge[]
}

export interface AdditionalImportantDate {
  id: string
  familyId: string
  type: AdditionalDateType
  description?: string
  englishDate: string
  hebrewDate?: string
  memberId?: string
  memberName?: string
  createdAt: string
  updatedAt: string
}

export interface FamilyMember {
  id: string
  title?: Title
  firstName: string
  lastName: string
  fullHebrewName?: string
  hebrewLastName?: string
  email?: string
  cellPhone?: string
  whatsappNumber?: string
  dateOfBirth?: string
  hebrewBirthDate?: string
  weddingAnniversary?: string
  hebrewWeddingAnniversary?: string
  relationshipInHouse: RelationshipInHouse
  isActive: boolean
  isPrimaryContact: boolean
  // Hebrew names for parents (for tefillin, etc.)
  mothersHebrewName?: string
  fathersHebrewName?: string
  // Jewish Heritage
  isCohen: boolean
  isLevi: boolean
  isYisroel: boolean
  aliyahDate?: string
  // Yahrzeit information
  dateOfDeath?: string
  hebrewDeathDate?: string
  memorialInstructions?: string
  // Professional & Community
  education?: string
  profession?: string
  synagogueRoles?: string
  skills?: string
  interests?: string
  // Preferences & Status
  receiveEmails: boolean
  receiveTexts: boolean
  emergencyContact: boolean
  medicalNotes?: string
  accessibilityNeeds?: string
  notes?: string
  familyId: string
  family?: {
    id: string
    familyName: string
  }
  // New fields for multi-generational support
  parentMemberId?: string
  parentMember?: {
    id: string
    firstName: string
    lastName: string
  }
  children?: FamilyMember[]
  grandchildren?: FamilyMember[]
}

export interface FamilyFormData {
  // Basic Information
  familyName: string
  hebrewFamilyName?: string
  membershipStatus: 'member' | 'prospective' | 'visitor' | 'former'
  
  // Contact Information
  primaryEmail?: string
  secondaryEmail?: string
  phone?: string
  emergencyContact?: string
  receiveNewsletter: boolean
  receiveEventNotifications: boolean
  
  // Address Information
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  
  // Financial Information
  currency: 'NIS' | 'USD' | 'GBP'
  annualPledge: number
  membershipStartDate?: string
  membershipEndDate?: string
  
  // Pledges
  pledges: Array<{
    amount: number
    currency: 'NIS' | 'USD' | 'GBP'
    description: string
    date: string
    pledgedBy: string // Family member who made the pledge
    isAnonymous: boolean // Whether the pledge should be anonymous
  }>
  
  // Special Information
  dietaryRestrictions?: string
  specialNeeds?: string
  familyNotes?: string
  isFoundingFamily: boolean
  isBoardFamily: boolean
  weddingAnniversary?: string
  hebrewWeddingAnniversary?: string
}

// New types for enhanced functionality
export interface EventSponsorship {
  id: string
  eventType: 'kiddush' | 'seudah' | 'other'
  eventName: string
  eventDate: string
  description?: string
  amount?: number
  currency: 'NIS' | 'USD' | 'GBP'
  familyId: string
  sponsoredBy: string // Member name who sponsored
  status: 'planned' | 'completed' | 'cancelled'
  notes?: string
}

export interface PledgeHistory {
  id: string
  familyId: string
  amount: number
  currency: 'NIS' | 'USD' | 'GBP'
  description: string
  pledgeDate: string
  dueDate?: string
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  pledgedBy: string // Family member who made the pledge
  isAnonymous: boolean // Whether the pledge should be anonymous
  payments: Payment[]
  notes?: string
}

export interface Payment {
  id: string
  pledgeId: string
  amount: number
  currency: 'NIS' | 'USD' | 'GBP'
  paymentDate: string
  paymentMethod: 'cash' | 'check' | 'credit' | 'bank_transfer' | 'other'
  referenceNumber?: string
  notes?: string
}

export interface FamilyTree {
  familyId: string
  familyName: string
  members: FamilyMember[]
  children: FamilyTree[]
  grandchildren: FamilyTree[]
}

// Form-specific types that allow dayjs objects for date fields
export interface FamilyMemberFormData extends Omit<FamilyMember, 'dateOfBirth' | 'aliyahDate' | 'dateOfDeath' | 'weddingAnniversary'> {
  dateOfBirth?: any // dayjs object or null
  aliyahDate?: any // dayjs object or null
  dateOfDeath?: any // dayjs object or null
  weddingAnniversary?: any // dayjs object or null
}

// Pledge data
export interface Pledge {
  id: string
  familyId: string
  amount: number
  currency: 'NIS' | 'USD' | 'GBP'
  description: string
  date: string
  pledgedBy: string
  isAnonymous: boolean
  dueDate?: string
  donationDate?: string
  isAnnualPledge?: boolean
  notes?: string
  status: 'pending' | 'partial' | 'fulfilled' | 'overdue' | 'cancelled'
  fulfilledAmount?: number
  fulfilledDate?: string
  // Event connections
  connectedEvents?: {
    type: 'yahrzeit' | 'birthday' | 'anniversary' | 'siyum' | 'other'
    description: string
    date?: string
    dateType?: 'gregorian' | 'hebrew' | 'family_event'
    hebrewDate?: string
    familyEventId?: string
    memberId?: string
  }[]
  createdAt: string
  updatedAt: string
}

// Pledge form data
export interface PledgeFormData {
  amount: number
  currency: 'NIS' | 'USD' | 'GBP'
  description: string
  customDescription?: string
  date: string
  isAnonymous: boolean
  dueDate?: string
  donationDate?: string
  isAnnualPledge?: boolean
  status?: 'pending' | 'partial' | 'fulfilled' | 'overdue' | 'cancelled'
  fulfilledAmount?: number
  fulfilledDate?: string
  notes?: string
  // Event connections
  connectedEvents?: {
    type: 'yahrzeit' | 'birthday' | 'anniversary' | 'siyum' | 'other'
    description: string
    date?: string
    dateType?: 'gregorian' | 'hebrew' | 'family_event'
    hebrewDate?: string
    familyEventId?: string
    memberId?: string
  }[]
}

// Settings Management Types
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum Permission {
  // Family Management
  VIEW_FAMILIES = 'view_families',
  CREATE_FAMILIES = 'create_families',
  EDIT_FAMILIES = 'edit_families',
  DELETE_FAMILIES = 'delete_families',
  
  // Member Management
  VIEW_MEMBERS = 'view_members',
  CREATE_MEMBERS = 'create_members',
  EDIT_MEMBERS = 'edit_members',
  DELETE_MEMBERS = 'delete_members',
  
  // Financial Management
  VIEW_FINANCIAL = 'view_financial',
  CREATE_PLEDGES = 'create_pledges',
  EDIT_PLEDGES = 'edit_pledges',
  DELETE_PLEDGES = 'delete_pledges',
  VIEW_DONATIONS = 'view_donations',
  
  // Settings Management
  VIEW_SETTINGS = 'view_settings',
  MANAGE_USERS = 'manage_users',
  MANAGE_EMAIL_TEMPLATES = 'manage_email_templates',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  
  // Reports and Analytics
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',
  
  // Email Management
  SEND_EMAILS = 'send_emails',
  VIEW_EMAIL_HISTORY = 'view_email_history'
}

export interface UserPermissions {
  userId: string
  permissions: Permission[]
  grantedBy: string
  grantedAt: Date
}

export interface SystemUser extends User {
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[] // Available template variables
  category: 'reminder' | 'notification' | 'announcement' | 'custom'
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface EmailTemplateVariable {
  name: string
  description: string
  example: string
  category: 'family' | 'member' | 'system' | 'custom'
}

export interface SystemSettings {
  id: string
  key: string
  value: string
  description: string
  category: 'general' | 'email' | 'notifications' | 'security' | 'custom'
  isEditable: boolean
  updatedBy: string
  updatedAt: Date
}

export interface UserInvitation {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: Permission[]
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  isAccepted: boolean
  acceptedAt?: Date
}

// Form data types for settings
export interface UserFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
}

export interface EmailTemplateFormData {
  name: string
  subject: string
  body: string
  category: 'reminder' | 'notification' | 'announcement' | 'custom'
  isActive: boolean
}

export interface SystemSettingFormData {
  key: string
  value: string
  description: string
  category: 'general' | 'email' | 'notifications' | 'security' | 'custom'
}

export interface UserInvitationFormData {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: Permission[]
  expiresInDays: number
}

// Donation tracking system
export interface Donation {
  id: string
  familyId: string
  familyName: string
  amount: number
  currency: 'NIS' | 'USD' | 'GBP'
  donationType: 'annual_pledge' | 'one_time_pledge' | 'event_sponsorship' | 'memorial' | 'general' | 'other'
  description: string
  donationDate: string
  hebrewDate?: string
  isAnonymous: boolean
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other'
  checkNumber?: string
  referenceNumber?: string
  notes?: string
  // Event connections
  connectedEventId?: string
  connectedEventName?: string
  // Memorial connections
  memorialPersonName?: string
  memorialPersonHebrewName?: string
  // Pledge connections
  connectedPledgeId?: string
  pledgeDescription?: string
  // Status tracking
  status: 'pending' | 'confirmed' | 'processed' | 'cancelled'
  processedBy?: string
  processedDate?: string
  createdAt: string
  updatedAt: string
}

// Donation form data
export interface DonationFormData {
  familyId: string
  amount: number
  currency: 'NIS' | 'USD' | 'GBP'
  donationType: 'annual_pledge' | 'one_time_pledge' | 'event_sponsorship' | 'memorial' | 'general' | 'other'
  description: string
  donationDate: string
  isAnonymous: boolean
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other'
  checkNumber?: string
  referenceNumber?: string
  notes?: string
  connectedEventId?: string
  memorialPersonName?: string
  memorialPersonHebrewName?: string
  connectedPledgeId?: string
}

// Donation summary for reporting
export interface DonationSummary {
  totalDonations: number
  totalAmount: number
  currency: 'NIS' | 'USD' | 'GBP'
  byType: {
    annual_pledge: number
    one_time_pledge: number
    event_sponsorship: number
    memorial: number
    general: number
    other: number
  }
  byMonth: Array<{
    month: string
    year: number
    amount: number
    count: number
  }>
  byFamily: Array<{
    familyId: string
    familyName: string
    totalAmount: number
    donationCount: number
  }>
  recentDonations: Donation[]
}
