import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  IconButton,
  Box,
  FormHelperText
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { Delete } from '@mui/icons-material'
import { HDate } from '@hebcal/core'

import { FamilyMember, FamilyMemberFormData, RelationshipInHouse, Title } from '../types'
import { apiService } from '../services/apiService'

interface FamilyMemberFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (member: FamilyMember) => void
  member?: FamilyMember | null
  families: Array<{ id: string; familyName: string; hebrewFamilyName?: string }>
  currentFamilyId?: string
  onRefresh?: () => void // Callback to refresh parent component data
}

interface YahrzeitEntry {
  id: string
  nameOfPerson: string
  dateOfPassing: any
  hebrewDeathDate: string
  reminderEnabled: boolean
  relationship: string
}

interface ValidationErrors {
  [key: string]: string
}

interface DuplicateEmailInfo {
  memberId: string
  memberName: string
  familyName: string
}

const FamilyMemberFormDialog: React.FC<FamilyMemberFormDialogProps> = ({ 
  open, 
  onClose, 
  onSave, 
  member, 
  families, 
  currentFamilyId 
}) => {
  // Generate unique instance ID to track multiple instances
  const instanceId = useRef(Math.random().toString(36).substr(2, 9)).current
  
  // 🔍 BUILD TEST: Track if FamilyMemberFormDialog component is being processed
  useEffect(() => {
    console.log('🔍 BUILD TEST: FamilyMemberFormDialog component definition - build system is processing this file')
  }, [])
  
  // Only log when dialog opens/closes, not on every render
  useEffect(() => {
    if (open) {
      console.log(`🔵 DIALOG OPENED: ${instanceId} - props:`, { member: member?.id, currentFamilyId })
    }
  }, [open, member?.id, currentFamilyId, instanceId])

  useEffect(() => {
    console.log(`🟢 DIALOG MOUNT: ${instanceId}`)
    return () => {
      console.log(`🔴 DIALOG UNMOUNT: ${instanceId}`)
    }
  }, [instanceId])
  
  // State management
  const [formData, setFormData] = useState<Partial<FamilyMemberFormData>>({
    firstName: '',
    lastName: '',
    fullHebrewName: '',
    hebrewLastName: '',
    email: '',
    cellPhone: '',
    whatsappNumber: '',
    dateOfBirth: null,
    hebrewBirthDate: '',
    relationshipInHouse: undefined,
    familyId: '',
    isPrimaryContact: false,
    isActive: true,
    mothersHebrewName: '',
    fathersHebrewName: '',
    isCohen: false,
    isLevi: false,
    isYisroel: false,
    aliyahDate: null,
    dateOfDeath: null,
    hebrewDeathDate: '',
    memorialInstructions: '',
    education: '',
    profession: '',
    synagogueRoles: '',
    skills: '',
    interests: '',
    receiveEmails: true,
    receiveTexts: false,
    emergencyContact: false,
    medicalNotes: '',
    accessibilityNeeds: '',
    notes: '',
    parentMemberId: undefined,
    title: undefined
  })

  const [yahrzeitEntries, setYahrzeitEntries] = useState<YahrzeitEntry[]>([
    {
      id: '1',
      nameOfPerson: '',
      dateOfPassing: null,
      hebrewDeathDate: '',
      reminderEnabled: false,
      relationship: ''
    }
  ])

  // 🔒 REF-BASED SUBMISSION GUARD (ChatGPT's suggestion)
  const hasSubmittedRef = useRef(false)
  const isSubmittingRef = useRef(false)

  // Hebrew date override states
  const [hebrewBirthDateOverride, setHebrewBirthDateOverride] = useState(false)
  const [yahrzeitHebrewDateOverrides, setYahrzeitHebrewDateOverrides] = useState<{ [key: string]: boolean }>({})
  
  // Parent Hebrew name auto-population state
  const [autoPopulatedParents, setAutoPopulatedParents] = useState<{father: boolean, mother: boolean}>({father: false, mother: false})

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [duplicateEmailInfo, setDuplicateEmailInfo] = useState<DuplicateEmailInfo | null>(null)
  const [showDuplicateEmailAlert, setShowDuplicateEmailAlert] = useState(false)

  // Track dialog instances to prevent duplicates
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)
  
  // Simplified const date storage - these are immutable once set
  const [gregorianDate, setGregorianDate] = useState<string>('')
  const [hebrewDate, setHebrewDate] = useState<string>('')
  
  // Date edit mode - dates are read-only by default to prevent drift
  const [isDateOfBirthEditing, setIsDateOfBirthEditing] = useState<boolean>(false)

  // Reset form function - extracted to prevent recreation on every render
  const resetForm = useCallback(() => {
    console.log('🔄 RESETTING FORM - clearing all state')
    
    setFormData({
      firstName: '',
      lastName: '',
      fullHebrewName: '',
      hebrewLastName: '',
      email: '',
      cellPhone: '',
      whatsappNumber: '',
      dateOfBirth: null,
      hebrewBirthDate: '',
      relationshipInHouse: undefined,
      familyId: '',
      isPrimaryContact: false,
      isActive: true,
      mothersHebrewName: '',
      fathersHebrewName: '',
      isCohen: false,
      isLevi: false,
      isYisroel: false,
      aliyahDate: null,
      dateOfDeath: null,
      hebrewDeathDate: '',
      memorialInstructions: '',
      education: '',
      profession: '',
      synagogueRoles: '',
      skills: '',
      interests: '',
      receiveEmails: true,
      receiveTexts: false,
      emergencyContact: false,
      medicalNotes: '',
      accessibilityNeeds: '',
      notes: '',
      parentMemberId: undefined,
      title: undefined
    })
    
    setYahrzeitEntries([{
      id: '1',
      nameOfPerson: '',
      dateOfPassing: null,
      hebrewDeathDate: '',
      reminderEnabled: false,
      relationship: ''
    }])
    
    setHebrewBirthDateOverride(false)
    setYahrzeitHebrewDateOverrides({})
    setAutoPopulatedParents({father: false, mother: false})
    setError(null)
    setValidationErrors({})
    setDuplicateEmailInfo(null)
    setShowDuplicateEmailAlert(false)
    setHasSubmitted(false)
    setGregorianDate('')
    setHebrewDate('')
    setIsDateOfBirthEditing(false)
    
    // 🔒 RESET REF-BASED SUBMISSION GUARDS
    hasSubmittedRef.current = false
    isSubmittingRef.current = false
    
    console.log('🔄 FORM RESET COMPLETE - hasSubmitted reset to false')
  }, [])

  // Initialize form data when member prop changes - only when dialog opens or member changes
  useEffect(() => {
    if (!open) return // Don't process if dialog is closed
    
    console.log('useEffect triggered with:', { member: member?.id, currentFamilyId })
    
    // Reset submission flag when dialog opens, member changes, or family changes
    setHasSubmitted(false)
    
    if (member) {
      // Safely convert dates with validation
      const safeDateOfBirth = member.dateOfBirth ? dayjs(member.dateOfBirth) : null
      const safeAliyahDate = member.aliyahDate ? dayjs(member.aliyahDate) : null
      
      // Log any invalid dates for debugging
      if (safeDateOfBirth && !safeDateOfBirth.isValid()) {
        console.warn('Invalid dateOfBirth from member:', member.dateOfBirth, 'converted to:', safeDateOfBirth)
      }
      if (safeAliyahDate && !safeAliyahDate.isValid()) {
        console.warn('Invalid aliyahDate from member:', member.aliyahDate, 'converted to:', safeAliyahDate)
      }
      
      setFormData({
        ...member,
        dateOfBirth: safeDateOfBirth,
        aliyahDate: safeAliyahDate
      })
      
      // Initialize const dates to prevent drift when editing existing members
      if (safeDateOfBirth && safeDateOfBirth.isValid()) {
        const datePair = convertToHebrewDate(safeDateOfBirth)
        setGregorianDate(datePair.gregorianDate)
        setHebrewDate(datePair.hebrewDate)
      } else {
        setGregorianDate('')
        setHebrewDate('')
      }
      
      // Initialize Yahrzeit entries from existing data
      if (member.memorialInstructions) {
        // Parse memorialInstructions which contains multiple Yahrzeit entries separated by semicolons
        const yahrzeitStrings = member.memorialInstructions.split(';').map(s => s.trim()).filter(s => s)
        
        if (yahrzeitStrings.length > 0) {
          const entries = yahrzeitStrings.map((instruction, index) => {
            // Parse each Yahrzeit entry in format "Name (relationship): Hebrew Date"
            const parts = instruction.split(':').map(p => p.trim())
            const nameAndRelationship = parts[0] || ''
            const hebrewDeathDate = parts[1] || ''
            
            // Extract name and relationship from "Name (relationship)" format
            const relationshipMatch = nameAndRelationship.match(/^(.+?)\s*\(([^)]+)\)$/)
            let nameOfPerson = nameAndRelationship
            let relationship = ''
            
            if (relationshipMatch) {
              nameOfPerson = relationshipMatch[1].trim()
              relationship = relationshipMatch[2].trim().replace(/\s+/g, '_')
            }
            
            return {
              id: (index + 1).toString(),
              nameOfPerson,
              dateOfPassing: null,
              hebrewDeathDate,
              reminderEnabled: false,
              relationship
            }
          })
          setYahrzeitEntries(entries)
        } else {
          // Fallback to single entry if parsing fails
          setYahrzeitEntries([{
            id: '1',
            nameOfPerson: '',
            dateOfPassing: null,
            hebrewDeathDate: '',
            reminderEnabled: false,
            relationship: ''
          }])
        }
      } else {
        // No memorial instructions, start with empty entry
        setYahrzeitEntries([{
          id: '1',
          nameOfPerson: '',
          dateOfPassing: null,
          hebrewDeathDate: '',
          reminderEnabled: false,
          relationship: ''
        }])
      }
    } else {
      // Get family name for auto-populating last name and Hebrew last name
      // Only do this if we have a currentFamilyId and it's different from what we already have
      if (currentFamilyId && currentFamilyId !== formData.familyId) {
        const selectedFamily = families.find(f => f.id === currentFamilyId)
        // Extract family name without "Family" suffix for lastName
        const familyLastName = selectedFamily?.familyName?.replace(/\s+Family\s*$/i, '') || ''
        const familyHebrewLastName = selectedFamily?.hebrewFamilyName || ''
        
        // Reset form for new member
        setFormData({
          firstName: '',
          lastName: familyLastName,
          fullHebrewName: '',
          hebrewLastName: familyHebrewLastName, // Auto-populate Hebrew last name from family's Hebrew name
          email: '',
          cellPhone: '',
          whatsappNumber: '',
          dateOfBirth: null,
          hebrewBirthDate: '',
          relationshipInHouse: undefined,
          familyId: currentFamilyId || '',
          isPrimaryContact: false,
          isActive: true,
          mothersHebrewName: '',
          fathersHebrewName: '',
          isCohen: false,
          isLevi: false,
          isYisroel: false,
          aliyahDate: null,
          memorialInstructions: '',
          education: '',
          profession: '',
          synagogueRoles: '',
          skills: '',
          interests: '',
          receiveEmails: true,
          receiveTexts: false,
          emergencyContact: false,
          medicalNotes: '',
          accessibilityNeeds: '',
          notes: '',
          parentMemberId: undefined,
          title: undefined
        })
        
        // Reset const dates for new member
        setGregorianDate('')
        setHebrewDate('')
        setIsDateOfBirthEditing(false)
        
        // Reset Yahrzeit entries
        setYahrzeitEntries([
          {
            id: '1',
            nameOfPerson: '',
            dateOfPassing: null,
            hebrewDeathDate: '',
            reminderEnabled: false,
            relationship: ''
          }
        ])
        
        // Reset Hebrew date override states for new member
        setHebrewBirthDateOverride(false)
        setYahrzeitHebrewDateOverrides({})
      }
    }
    
    // Clear all errors and validation when dialog opens or member changes
    setError(null)
    setValidationErrors({})
    setDuplicateEmailInfo(null)
    setShowDuplicateEmailAlert(false)
    
    // Reset Hebrew date override states
    setHebrewBirthDateOverride(false)
    setYahrzeitHebrewDateOverrides({})
    
    // Reset parent auto-population state
    setAutoPopulatedParents({father: false, mother: false})
  }, [open, member, currentFamilyId, families, resetForm])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Small delay to ensure dialog is fully closed before resetting
      const timer = setTimeout(() => {
        resetForm()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open, resetForm])



  // Handle parent Hebrew name auto-population when relationship changes
  const autoPopulationInProgress = useRef(false)
  
  useEffect(() => {
    if (open && formData.relationshipInHouse && (formData.relationshipInHouse === 'son' || formData.relationshipInHouse === 'daughter')) {
      // Only auto-populate if we have a family selected and this is a new member (not editing existing)
      if (formData.familyId && !member?.id && !autoPopulationInProgress.current) {
        console.log('Auto-population effect triggered for relationship:', formData.relationshipInHouse, 'familyId:', formData.familyId)
        
        // Prevent duplicate API calls
        autoPopulationInProgress.current = true
        
        // Get existing family members to find parents
        const loadFamilyMembers = async () => {
          try {
            const response = await apiService.familyMembers.getAll({ familyId: formData.familyId })
            const familyMembers = response.members || []
            
            // Find husband and wife in the family
            const husband = familyMembers.find(m => m.relationshipInHouse === 'husband')
            const wife = familyMembers.find(m => m.relationshipInHouse === 'wife')
            
            // Auto-populate parent Hebrew names if they exist
            const updatedFormData = {
              fathersHebrewName: husband?.fullHebrewName || '',
              mothersHebrewName: wife?.fullHebrewName || ''
            }
            
            setFormData(prev => ({
              ...prev,
              ...updatedFormData
            }))
            
            // Track which fields were auto-populated
            setAutoPopulatedParents({
              father: !!husband?.fullHebrewName,
              mother: !!wife?.fullHebrewName
            })
            
            console.log('Auto-populated parent Hebrew names via effect:', updatedFormData)
          } catch (error) {
            console.error('Error loading family members for auto-population:', error)
          } finally {
            // Reset the flag when done
            autoPopulationInProgress.current = false
          }
        }
        
        loadFamilyMembers()
      }
    } else if (formData.relationshipInHouse && formData.relationshipInHouse !== 'son' && formData.relationshipInHouse !== 'daughter') {
      // If relationship is not a child, clear parent Hebrew names
      setFormData(prev => ({
        ...prev,
        fathersHebrewName: '',
        mothersHebrewName: ''
      }))
      setAutoPopulatedParents({ father: false, mother: false })
    }
  }, [open, formData.relationshipInHouse, formData.familyId, member?.id])

  // 🔍 BUILD TEST START - useEffect for dialog state reset
  useEffect(() => {
    console.log('🔍 BUILD TEST: About to define useEffect for dialog state reset')
  }, [])
  
  // Simplified error clearing - only clear when dialog opens or form is submitted
  useEffect(() => {
    if (open) {
      console.log('🚪 DIALOG OPENED - resetting all state')
      // Clear all validation errors when dialog opens
      setValidationErrors({})
      setError(null)
      setShowDuplicateEmailAlert(false)
      setDuplicateEmailInfo(null)
      setHasSubmitted(false) // Reset submission flag when dialog opens
      console.log('🚪 DIALOG STATE RESET COMPLETE')
    }
  }, [open])
  
  useEffect(() => {
    console.log('🔍 BUILD TEST: Finished defining useEffect for dialog state reset')
  }, [])
  // 🔍 BUILD TEST END - useEffect for dialog state reset

  // Reset submission flag when family changes
  useEffect(() => {
    if (currentFamilyId) {
      console.log('🏠 FAMILY CHANGED - resetting submission flag')
      setHasSubmitted(false)
    }
  }, [currentFamilyId])

  // Reset submission flag when member changes
  useEffect(() => {
    if (member) {
      console.log('👤 MEMBER CHANGED - resetting submission flag')
      setHasSubmitted(false)
    } else {
      console.log('🆕 NEW MEMBER - resetting submission flag')
      setHasSubmitted(false)
    }
  }, [member])

  const handleInputChange = useCallback((field: keyof FamilyMemberFormData, value: any) => {
    // Simple state update
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-calculate Hebrew birthday when English birthday changes (only if not overridden)
    if (field === 'dateOfBirth' && value && !hebrewBirthDateOverride) {
      if (value && value.isValid()) {
        const datePair = convertToHebrewDate(value)
        setGregorianDate(datePair.gregorianDate)
        setHebrewDate(datePair.hebrewDate)
        setFormData(prev => ({
          ...prev,
          [field]: value,
          hebrewBirthDate: datePair.hebrewDate
        }))
        // Exit edit mode after date is selected
        setIsDateOfBirthEditing(false)
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: null,
          hebrewBirthDate: ''
        }))
        setGregorianDate('')
        setHebrewDate('')
      }
    }
     
    // Auto-populate last name fields when family changes
    if (field === 'familyId' && value) {
      const selectedFamily = families.find(f => f.id === value)
      if (selectedFamily) {
        // Extract family name without "Family" suffix for lastName
        const familyNameWithoutSuffix = selectedFamily.familyName.replace(/\s+Family\s*$/i, '')
        setFormData(prev => ({
          ...prev,
          lastName: familyNameWithoutSuffix,
          hebrewLastName: selectedFamily.hebrewFamilyName || ''
        }))
      }
    }
    
    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [families, hebrewBirthDateOverride, validationErrors])

  const handleYahrzeitChange = useCallback((id: string, field: keyof YahrzeitEntry, value: any) => {
    setYahrzeitEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value }
        
                         // Auto-calculate Hebrew death date when English death date changes (only if not overridden)
        if (field === 'dateOfPassing' && value && !yahrzeitHebrewDateOverrides[entry.id]) {
          if (value && value.isValid()) {
            const datePair = convertToHebrewDate(value)
            updatedEntry.hebrewDeathDate = datePair.hebrewDate
          } else {
            console.warn('Invalid dateOfPassing value received:', value)
            updatedEntry.hebrewDeathDate = ''
          }
        }
        
        return updatedEntry
      }
      return entry
    }))
    
    // Note: Yahrzeit validation error clearing is now handled in useEffect
  }, [yahrzeitHebrewDateOverrides])

  const addYahrzeitEntry = useCallback(() => {
    const newId = (yahrzeitEntries.length + 1).toString()
    setYahrzeitEntries(prev => [...prev, {
      id: newId,
      nameOfPerson: '',
      dateOfPassing: null,
      hebrewDeathDate: '',
      reminderEnabled: false,
      relationship: ''
    }])
  }, [])

     const removeYahrzeitEntry = useCallback((id: string) => {
       if (yahrzeitEntries.length > 1) {
         setYahrzeitEntries(prev => prev.filter(entry => entry.id !== id))
         // Clean up override state
         setYahrzeitHebrewDateOverrides(prev => {
           const newOverrides = { ...prev }
           delete newOverrides[id]
           return newOverrides
         })
       }
     }, [])

   // Toggle Hebrew date override for birth date
   const toggleHebrewBirthDateOverride = useCallback(() => {
     setHebrewBirthDateOverride(prev => !prev)
   }, [])

   // Toggle Hebrew date override for wedding anniversary
   

   // Toggle Hebrew date override for Yahrzeit entry
   const toggleYahrzeitHebrewDateOverride = useCallback((entryId: string) => {
     setYahrzeitHebrewDateOverrides(prev => ({
       ...prev,
       [entryId]: !prev[entryId]
     }))
   }, [])

   // Handle manual Hebrew date input
   const handleHebrewDateInput = useCallback((field: 'hebrewBirthDate' | 'hebrewDeathDate', value: string, entryId?: string) => {
     if (field === 'hebrewBirthDate') {
       setFormData(prev => ({
         ...prev,
         hebrewBirthDate: value
       }))
     
     } else if (field === 'hebrewDeathDate' && entryId) {
       setYahrzeitEntries(prev => prev.map(entry => 
         entry.id === entryId 
           ? { ...entry, hebrewDeathDate: value }
           : entry
       ))
     }
   }, [])

  // Format Yahrzeit relationship for display
  const formatYahrzeitRelationship = useCallback((relationship: string): string => {
    switch (relationship) {
      case 'child_of': return 'Child of'
      case 'sibling_of': return 'Sibling of'
      case 'parent_of': return 'Parent of'
      case 'grandchild_of': return 'Grandchild of'
      case 'grandparent_of': return 'Grandparent of'
      default: return relationship
    }
  }, [])

  // Convert English date to Hebrew date using @hebcal/core library
  // This function creates IMMUTABLE date pairs to prevent drift
  const convertToHebrewDate = useCallback((date: dayjs.Dayjs): { gregorianDate: string; hebrewDate: string } => {
    try {
      // Check if date is valid
      if (!date) {
        console.warn('No date provided to convertToHebrewDate')
        return { gregorianDate: '', hebrewDate: '' }
      }
      
      if (!date.isValid()) {
        console.warn('Invalid date provided to convertToHebrewDate:', date, 'type:', typeof date, 'value:', date.valueOf())
        return { gregorianDate: '', hebrewDate: '' }
      }
      
      // Additional validation to ensure the date is within reasonable bounds
      const year = date.year()
      if (year < 1850 || year > new Date().getFullYear()) {
        console.warn('Date year out of reasonable range:', year, 'full date:', date.format('MM-DD-YYYY'))
        return { gregorianDate: '', hebrewDate: '' }
      }
      
      // Store the EXACT Gregorian date as a constant string (MM-DD-YYYY format)
      const gregorianDate = date.format('MM-DD-YYYY')
      
      // Create Hebrew date using the correct HDate constructor
      // HDate constructor with a Date object converts from Gregorian to Hebrew
      const hebrewDate = new HDate(date.toDate())
      
      // Debug: Log the exact values being passed to HDate
      console.log('🔍 DEBUG: Converting date:', {
        originalDate: date.format('MM-DD-YYYY'),
        dayjsYear: date.year(),
        dayjsMonth: date.month(), // 0-indexed
        dayjsDate: date.date(),
        adjustedMonth: date.month() + 1, // 1-indexed for HDate
        dateToDate: date.toDate() // JavaScript Date object
      })
      
      // Debug: Log the HDate object
      console.log('🔍 DEBUG: HDate object created:', {
        hebrewDate: hebrewDate,
        hebrewYear: hebrewDate.getFullYear(),
        hebrewMonth: hebrewDate.getMonth(),
        hebrewDay: hebrewDate.getDate(),
        monthName: hebrewDate.getMonthName()
      })
      
      // Format: "5 Adar II 5744" using HDate methods
      const hebrewDateString = `${hebrewDate.getDate()} ${hebrewDate.getMonthName()} ${hebrewDate.getFullYear()}`
      
      console.log('🔍 DEBUG: Final Hebrew date string:', hebrewDateString)
      
      // Return IMMUTABLE date pair - these values should never change unless user explicitly updates
      return { 
        gregorianDate, 
        hebrewDate: hebrewDateString 
      }
    } catch (error) {
      console.error('Error converting to Hebrew date:', error, 'input date:', date)
      return { gregorianDate: '', hebrewDate: '' }
    }
  }, [])

  // Comprehensive validation function
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {}
    
    // Required field validation
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required'
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    }
    
    if (!formData.relationshipInHouse) {
      errors.relationshipInHouse = 'Relationship in family is required'
    }
    
    if (!formData.familyId) {
      errors.familyId = 'Family selection is required'
    }
    
    // Validate parent Hebrew names for children
    if (formData.relationshipInHouse === 'son' || formData.relationshipInHouse === 'daughter') {
      if (!formData.fathersHebrewName?.trim()) {
        errors.fathersHebrewName = 'Father\'s Hebrew name is required for children'
      }
      if (!formData.mothersHebrewName?.trim()) {
        errors.mothersHebrewName = 'Mother\'s Hebrew name is required for children'
      }
    }
    
    // Clear parent Hebrew name validation errors if relationship is not a child
    if (formData.relationshipInHouse !== 'son' && formData.relationshipInHouse !== 'daughter') {
      delete errors.fathersHebrewName
      delete errors.mothersHebrewName
    }
    
    // Email validation
    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }
    }
    
    // Date validation - more robust validation
    if (formData.dateOfBirth) {
      if (!formData.dateOfBirth.isValid()) {
        errors.dateOfBirth = 'Please enter a valid birth date'
      } else {
        const year = formData.dateOfBirth.year()
        const currentYear = new Date().getFullYear()
        
        // More reasonable year range - allow for very old and very young people
        if (year < 1850 || year > currentYear + 1) {
          errors.dateOfBirth = `Birth year must be between 1850 and ${currentYear + 1}`
        }
        
        // Additional validation to ensure the date makes sense
        const month = formData.dateOfBirth.month() + 1 // dayjs months are 0-indexed
        const day = formData.dateOfBirth.date()
        
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          errors.dateOfBirth = 'Please enter a valid date'
        }
      }
    }
    

    
         // Yahrzeit validation
     yahrzeitEntries.forEach((entry, index) => {
       if (entry.nameOfPerson.trim()) {
         if (!entry.hebrewDeathDate.trim()) {
           errors[`yahrzeit_${index}`] = `Hebrew date is required for Yahrzeit entry ${index + 1}`
         }
         if (!entry.relationship.trim()) {
           errors[`yahrzeit_${index}`] = `Relationship is required for Yahrzeit entry ${index + 1}`
         }
       }
     })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, yahrzeitEntries])



  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    console.log('🚀 HANDLE SUBMIT CALLED:', new Date().toISOString())
    console.log('🚀 Event type:', e.type)
    console.log('🚀 Current hasSubmitted state:', hasSubmitted)
    console.log('🚀 Current isSubmitting state:', isSubmitting)
    
    e.preventDefault()
    
    // 🔒 REF-BASED DUPLICATE PREVENTION (ChatGPT's suggestion)
    if (hasSubmittedRef.current || isSubmittingRef.current) {
      console.log('🔒 PREVENTING DUPLICATE SUBMISSION - ref guards active')
      return
    }
    
    // Prevent duplicate submissions within the same form session
    if (hasSubmitted) {
      console.log('🔒 PREVENTING DUPLICATE SUBMISSION - already submitted')
      return
    }
    
    if (isSubmitting) {
      console.log('Already submitting, please wait...')
      return
    }
    
    // Clear previous errors
    setError(null)
    setValidationErrors({})
    setDuplicateEmailInfo(null)
    setShowDuplicateEmailAlert(false)
    
    // Validate form
    if (!validateForm()) {
      console.log('Form validation failed')
      console.log('Validation errors:', validationErrors)
      return
    }
    
    console.log('Form validation passed')
    
    // 🔒 SET REF GUARDS IMMEDIATELY (before any async operations)
    hasSubmittedRef.current = true
    isSubmittingRef.current = true
    
    // Set submission flag after validation passes
    setHasSubmitted(true)
    console.log('🔒 SUBMISSION FLAG SET - preventing duplicates')
    
    console.log('Starting form submission, formData:', formData)
    console.log('Relationship in formData:', formData.relationshipInHouse)
    console.log('Parent Hebrew names in formData:', { father: formData.fathersHebrewName, mother: formData.mothersHebrewName })
    setIsSubmitting(true)

    try {
      // Combine Yahrzeit entries into memorialInstructions
      const yahrzeitText = yahrzeitEntries
        .filter(entry => entry.nameOfPerson.trim())
        .map(entry => {
          const relationshipText = entry.relationship ? ` (${formatYahrzeitRelationship(entry.relationship)})` : ''
          return `${entry.nameOfPerson}${relationshipText}: ${entry.hebrewDeathDate || 'Date TBD'}`
        })
        .join('; ')
      
      // Use const date values if available, otherwise use form data
      const apiData = {
        ...formData,
        memorialInstructions: yahrzeitText,
        dateOfBirth: gregorianDate || (formData.dateOfBirth ? formData.dateOfBirth.format('MM-DD-YYYY') : undefined),
        hebrewBirthDate: hebrewDate || formData.hebrewBirthDate,
        aliyahDate: formData.aliyahDate ? formData.aliyahDate.format('MM-DD-YYYY') : undefined
      }

      let savedMember: FamilyMember

      if (member) {
        console.log('🔄 UPDATE MEMBER: Calling backend API for member update...')
        console.log('🔄 UPDATE MEMBER: API payload:', JSON.stringify(apiData, null, 2))
        const response = await apiService.familyMembers.update(member.id, apiData)
        console.log('✅ UPDATE MEMBER: Backend API call completed successfully')
        console.log('✅ UPDATE MEMBER: Response:', response)
        savedMember = response.member
      } else {
        console.log('🔄 CREATE MEMBER: Calling backend API for member creation...')
        console.log('🔄 CREATE MEMBER: API payload:', JSON.stringify(apiData, null, 2))
        const response = await apiService.familyMembers.create(apiData)
        console.log('✅ CREATE MEMBER: Backend API call completed successfully')
        console.log('✅ CREATE MEMBER: Response:', response)
        savedMember = response.member
      }

      // Success! Call onSave (this will trigger the parent component to refresh)
      console.log('🔄 ABOUT TO CALL onSave: Starting parent component callback...')
      console.log('🔄 onSave call details:', { memberId: savedMember.id, memberName: `${savedMember.firstName} ${savedMember.lastName}` })
      onSave(savedMember)
      console.log('✅ onSave called successfully - parent component callback completed')
      
      // Close the dialog
      console.log('🔄 ABOUT TO CLOSE DIALOG: Starting dialog close process...')
      onClose()
      console.log('✅ Dialog closed successfully')
      
      // Show success message (optional)
      console.log('🎉 MEMBER SAVE COMPLETE: All operations finished successfully')
      console.log('🎉 Final member details:', { id: savedMember.id, name: `${savedMember.firstName} ${savedMember.lastName}`, familyId: savedMember.familyId })
      
    } catch (error: any) {
      console.error('Error saving member:', error)
      
      if (error.response?.status === 409 && error.response?.data?.message?.includes('email')) {
        // Handle duplicate email error with better information
        const errorData = error.response.data
        if (errorData.existingMember) {
          setDuplicateEmailInfo({
            memberId: errorData.existingMember.id,
            memberName: `${errorData.existingMember.firstName} ${errorData.existingMember.lastName}`,
            familyName: errorData.existingMember.family?.familyName || 'Unknown Family'
          })
          setShowDuplicateEmailAlert(true)
          setError(`A member with this email address already exists: ${errorData.existingMember.firstName} ${errorData.existingMember.lastName} in family ${errorData.existingMember.family?.familyName || 'Unknown Family'}`)
        } else {
          setError('A member with this email address already exists. Please use a different email or search for the existing member.')
        }
      } else {
        let errorMessage = error.response?.data?.message || 'Failed to save member. Please try again.'
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [hasSubmitted, isSubmitting, validateForm, formData, yahrzeitEntries, gregorianDate, hebrewDate, member, onSave, onClose, formatYahrzeitRelationship])

  // 🔍 BUILD TEST START - handleClose function change
  useEffect(() => {
    console.log('🔍 BUILD TEST: About to define handleClose function with submission flag reset')
  }, [])
  
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      // Reset form immediately when closing
      resetForm()
      // Force reset submission flag to ensure it's cleared
      setHasSubmitted(false)
      console.log('🔒 SUBMISSION FLAG RESET - dialog closing')
      onClose()
    }
  }, [isSubmitting, resetForm, onClose, setHasSubmitted])
  
  useEffect(() => {
    console.log('🔍 BUILD TEST: Finished defining handleClose function with submission flag reset')
  }, [])
  // 🔍 BUILD TEST END - handleClose function change

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#6A1B9A', color: 'white' }}>
        {member ? 'Edit Family Member' : 'Add New Family Member'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Duplicate Email Alert with Link */}
            {showDuplicateEmailAlert && duplicateEmailInfo && (
              <Alert 
                severity="warning" 
                sx={{ mb: 3 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => {
                      // Open existing member in new tab
                      window.open(`/members/${duplicateEmailInfo.memberId}`, '_blank')
                    }}
                  >
                    View Existing Member
                  </Button>
                }
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Duplicate Email Detected:</strong>
                </Typography>
                <Typography variant="body2">
                  Email is already used by: <strong>{duplicateEmailInfo.memberName}</strong> 
                  in family: <strong>{duplicateEmailInfo.familyName}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Please use a different email address or update the existing member.
                </Typography>
              </Alert>
            )}

            {/* Validation Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Please fix the following issues:</strong>
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {Object.entries(validationErrors).map(([field, message]) => (
                    <li key={field}>
                      <strong>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {message}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Basic Information */}
            <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
              Basic Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Title</InputLabel>
                  <Select
                    value={formData.title || ''}
                    label="Title"
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value={Title.RABBI}>Rabbi</MenuItem>
                    <MenuItem value={Title.REBBETZIN}>Rebbetzin</MenuItem>
                    <MenuItem value={Title.DR}>Dr.</MenuItem>
                    <MenuItem value={Title.MR}>Mr.</MenuItem>
                    <MenuItem value={Title.MRS}>Mrs.</MenuItem>
                    <MenuItem value={Title.MS}>Ms.</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName || ''}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  helperText={validationErrors.lastName || "Auto-populated from family name, but can be edited"}
                  error={!!validationErrors.lastName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hebrew First Name"
                  value={formData.fullHebrewName || ''}
                  onChange={(e) => handleInputChange('fullHebrewName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hebrew Last Name"
                  value={formData.hebrewLastName || ''}
                  onChange={(e) => handleInputChange('hebrewLastName', e.target.value)}
                  helperText="Auto-populated from family name, but can be edited"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Family & Relationship */}
            <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
              Family & Relationship
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!validationErrors.familyId}>
                  <InputLabel>Family *</InputLabel>
                  <Select
                    value={formData.familyId || ''}
                    label="Family *"
                    onChange={(e) => handleInputChange('familyId', e.target.value)}
                  >
                    {families.map((family) => (
                      <MenuItem key={family.id} value={family.id}>
                        {family.familyName}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.familyId && (
                    <FormHelperText error>{validationErrors.familyId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!validationErrors.relationshipInHouse}>
                  <InputLabel>Relationship in Family *</InputLabel>
                  <Select
                    value={formData.relationshipInHouse || ''}
                    label="Relationship in Family *"
                    onChange={(e) => handleInputChange('relationshipInHouse', e.target.value)}
                  >
                    <MenuItem value="">-- Select --</MenuItem>
                    <MenuItem value={RelationshipInHouse.HUSBAND}>Husband</MenuItem>
                    <MenuItem value={RelationshipInHouse.WIFE}>Wife</MenuItem>
                     <MenuItem value={RelationshipInHouse.SON}>Son</MenuItem>
                   <MenuItem value={RelationshipInHouse.DAUGHTER}>Daughter</MenuItem>
                   <MenuItem value={RelationshipInHouse.SINGLE}>Single</MenuItem>
                  </Select>
                  {validationErrors.relationshipInHouse && (
                    <FormHelperText error>{validationErrors.relationshipInHouse}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Contact Information */}
            <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
              Contact Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  helperText={validationErrors.email || "Email must be unique across all members"}
                  error={!!validationErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.cellPhone || ''}
                  onChange={(e) => handleInputChange('cellPhone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="WhatsApp Number"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

                     {/* Dates & Lifecycle */}
            <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
              Dates & Lifecycle
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
                         <Grid item xs={12} sm={6}>
               {isDateOfBirthEditing ? (
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                   <DatePicker
                     label="Date of Birth"
                     value={formData.dateOfBirth}
                     onChange={(date) => handleInputChange('dateOfBirth', date)}
                     format="MM/DD/YYYY"
                     slotProps={{
                       textField: {
                         fullWidth: true,
                         error: !!validationErrors.dateOfBirth,
                         helperText: validationErrors.dateOfBirth || ''
                       }
                     }}
                   />
                   <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                     <Button
                       size="small"
                       onClick={() => setIsDateOfBirthEditing(false)}
                       sx={{ color: '#666' }}
                     >
                       Cancel
                     </Button>
                   </Box>
                 </Box>
               ) : (
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                   <TextField
                     fullWidth
                     label="Date of Birth"
                     value={gregorianDate || (formData.dateOfBirth ? formData.dateOfBirth.format('MM/DD/YYYY') : '')}
                     InputProps={{ 
                       readOnly: true,
                       endAdornment: (
                         <Button
                           size="small"
                           onClick={() => setIsDateOfBirthEditing(true)}
                           sx={{ 
                             minWidth: 'auto', 
                             px: 1,
                             color: '#1976d2'
                           }}
                         >
                           Edit
                         </Button>
                       )
                     }}
                     helperText="Click 'Edit' to modify the date"
                   />
                 </Box>
               )}
             </Grid>
             
             <Grid item xs={12} sm={6}>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                 <TextField
                   fullWidth
                   label="Hebrew Birth Date"
                   value={formData.hebrewBirthDate || ''}
                   onChange={(e) => handleHebrewDateInput('hebrewBirthDate', e.target.value)}
                   InputProps={{ 
                     readOnly: !hebrewBirthDateOverride,
                     endAdornment: (
                       <Button
                         size="small"
                         onClick={toggleHebrewBirthDateOverride}
                         sx={{ 
                           minWidth: 'auto', 
                           px: 1,
                           color: hebrewBirthDateOverride ? '#d32f2f' : '#1976d2'
                         }}
                       >
                         {hebrewBirthDateOverride ? 'Auto' : 'Manual'}
                       </Button>
                     )
                   }}
                   helperText={
                     hebrewBirthDateOverride 
                       ? "Manual entry mode - Hebrew date won't be auto-calculated"
                       : "Auto-calculated from English date (click 'Manual' to override for sundown timing)"
                   }
                 />
               </Box>
             </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Parents' Hebrew Names */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
            Parents' Hebrew Names (for Tefillah, Aliyah to Torah, etc.)
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mother's Hebrew Name"
                value={formData.mothersHebrewName || ''}
                onChange={(e) => handleInputChange('mothersHebrewName', e.target.value)}
                placeholder="e.g., Sarah bat Rivka"
                helperText={
                  autoPopulatedParents.mother 
                    ? "Auto-populated from family member. You can edit this if needed."
                    : "Enter the mother's Hebrew name for religious purposes"
                }
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: autoPopulatedParents.mother ? '#1976d2' : 'inherit'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Father's Hebrew Name"
                value={formData.fathersHebrewName || ''}
                onChange={(e) => handleInputChange('fathersHebrewName', e.target.value)}
                placeholder="e.g., Yosef ben Avraham"
                helperText={
                  autoPopulatedParents.father 
                    ? "Auto-populated from family member. You can edit this if needed."
                    : "Enter the father's Hebrew name for religious purposes"
                }
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: autoPopulatedParents.father ? '#1976d2' : 'inherit'
                  }
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Jewish Heritage */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
            Jewish Heritage
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isCohen || false}
                    onChange={(e) => handleInputChange('isCohen', e.target.checked)}
                  />
                }
                label="Cohen"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isLevi || false}
                    onChange={(e) => handleInputChange('isLevi', e.target.checked)}
                  />
                }
                label="Levi"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isYisroel || false}
                    onChange={(e) => handleInputChange('isYisroel', e.target.checked)}
                  />
                }
                label="Yisroel"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

                     {/* Yahrzeit Information */}
            <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
              Yahrzeit Information
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Hebrew Date Note:</strong> Yahrzeit dates are calculated from sundown to sundown. 
                Use the "Manual" button to override auto-calculated dates if needed for accuracy.
              </Typography>
            </Alert>

          {yahrzeitEntries.map((entry, index) => (
            <Box key={entry.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#4A148C', fontWeight: 500 }}>
                  {index === 0 ? 'Primary Yahrzeit' : `Additional Yahrzeit ${index + 1}`}
                </Typography>
                {yahrzeitEntries.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeYahrzeitEntry(entry.id)}
                    sx={{ ml: 1 }}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>

                                                           <Grid container spacing={2}>
                                     <Grid item xs={12} sm={6}>
                     <TextField
                       fullWidth
                       label="Name of Person for Yahrzeit"
                       value={entry.nameOfPerson}
                       onChange={(e) => handleYahrzeitChange(entry.id, 'nameOfPerson', e.target.value)}
                       placeholder="e.g., Father, Mother, Grandparent"
                     />
                   </Grid>
                   <Grid item xs={12} sm={6}>
                     <FormControl fullWidth error={!!validationErrors[`yahrzeit_${index}`]}>
                       <InputLabel>Relationship to Member</InputLabel>
                       <Select
                         value={entry.relationship || ''}
                         label="Relationship to Member"
                         onChange={(e) => handleYahrzeitChange(entry.id, 'relationship', e.target.value)}
                       >
                         <MenuItem value="">-- Select --</MenuItem>
                         <MenuItem value="child_of">Child of</MenuItem>
                         <MenuItem value="sibling_of">Sibling of</MenuItem>
                         <MenuItem value="parent_of">Parent of</MenuItem>
                         <MenuItem value="grandchild_of">Grandchild of</MenuItem>
                         <MenuItem value="grandparent_of">Grandparent of</MenuItem>
                       </Select>
                       {validationErrors[`yahrzeit_${index}`] && (
                         <FormHelperText error>{validationErrors[`yahrzeit_${index}`]}</FormHelperText>
                       )}
                     </FormControl>
                   </Grid>
                                     <Grid item xs={12} sm={6}>
                     <DatePicker
                       label="Date of Passing"
                       value={entry.dateOfPassing}
                       onChange={(date) => handleYahrzeitChange(entry.id, 'dateOfPassing', date)}
                       format="MM/DD/YYYY"
                       slotProps={{
                         textField: {
                           fullWidth: true,
                           placeholder: "Select date of passing"
                         }
                       }}
                     />
                   </Grid>
                                     <Grid item xs={12} sm={6}>
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                       <TextField
                         fullWidth
                         label="Hebrew Date of Passing (Yahrzeit Date)"
                         value={entry.hebrewDeathDate}
                         onChange={(e) => handleHebrewDateInput('hebrewDeathDate', e.target.value, entry.id)}
                         placeholder="e.g., 15 Nissan 5740"
                         InputProps={{ 
                           readOnly: !yahrzeitHebrewDateOverrides[entry.id],
                           endAdornment: (
                             <Button
                               size="small"
                               onClick={() => toggleYahrzeitHebrewDateOverride(entry.id)}
                               sx={{ 
                                 minWidth: 'auto', 
                                 px: 1,
                                 color: yahrzeitHebrewDateOverrides[entry.id] ? '#d32f2f' : '#1976d2'
                               }}
                             >
                               {yahrzeitHebrewDateOverrides[entry.id] ? 'Auto' : 'Manual'}
                             </Button>
                           )
                         }}
                         helperText={
                           yahrzeitHebrewDateOverrides[entry.id]
                             ? "Manual entry mode - Hebrew date won't be auto-calculated"
                             : "Auto-calculated from English date (click 'Manual' to override for sundown timing)"
                         }
                         error={!!validationErrors[`yahrzeit_${index}`]}
                       />
                     </Box>
                   </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={entry.reminderEnabled}
                          onChange={(e) => handleYahrzeitChange(entry.id, 'reminderEnabled', e.target.checked)}
                        />
                      }
                      label="Would you like a reminder one week in advance of Hebrew date?"
                    />
                  </Grid>
                </Grid>
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={addYahrzeitEntry}
              sx={{ 
                borderColor: '#6A1B9A', 
                color: '#6A1B9A',
                '&:hover': { 
                  borderColor: '#9C4DCC', 
                  backgroundColor: 'rgba(106, 27, 156, 0.04)' 
                }
              }}
            >
              Add Additional Yahrzeit
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Professional & Community */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
            Professional & Community
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Education"
                multiline
                rows={2}
                value={formData.education || ''}
                onChange={(e) => handleInputChange('education', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Profession"
                value={formData.profession || ''}
                onChange={(e) => handleInputChange('profession', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Synagogue Roles"
                multiline
                rows={2}
                value={formData.synagogueRoles || ''}
                onChange={(e) => handleInputChange('synagogueRoles', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Skills"
                multiline
                rows={2}
                value={formData.skills || ''}
                onChange={(e) => handleInputChange('skills', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interests"
                multiline
                rows={2}
                value={formData.interests || ''}
                onChange={(e) => handleInputChange('interests', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Preferences & Status */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
            Preferences & Status
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPrimaryContact || false}
                    onChange={(e) => handleInputChange('isPrimaryContact', e.target.checked)}
                  />
                }
                label="Primary Contact"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive || false}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                }
                label="Active Member"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.receiveEmails || false}
                    onChange={(e) => handleInputChange('receiveEmails', e.target.checked)}
                  />
                }
                label="Receive Emails"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.receiveTexts || false}
                    onChange={(e) => handleInputChange('receiveTexts', e.target.checked)}
                  />
                }
                label="Receive Texts"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.emergencyContact || false}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.checked)}
                  />
                }
                label="Emergency Contact"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Additional Information */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4A148C' }}>
            Additional Information
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Notes"
                multiline
                rows={2}
                value={formData.medicalNotes || ''}
                onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
                placeholder="Any medical information or allergies..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Accessibility Needs"
                multiline
                rows={2}
                value={formData.accessibilityNeeds || ''}
                onChange={(e) => handleInputChange('accessibilityNeeds', e.target.value)}
                placeholder="Any accessibility requirements..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="General Notes"
                multiline
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information about this member..."
              />
            </Grid>
          </Grid>
        </Box>
      </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault()
            // Manually trigger form submission since button is outside the form
            const form = document.querySelector('form')
            if (form) {
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
            } else {
              // Fallback: call handleSubmit directly
              handleSubmit(e as any)
            }
          }}
          variant="contained"
          disabled={isSubmitting || Object.keys(validationErrors).length > 0}
          sx={{ bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#4A148C' } }}
        >
          {isSubmitting ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FamilyMemberFormDialog

