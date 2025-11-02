/**
 * Date Persistence Utility
 * 
 * This module provides utilities for ensuring Hebrew and English dates
 * remain synchronized and never shift when editing existing records.
 * 
 * CRITICAL RULES:
 * 1. When CREATING a new record: Calculate Hebrew date from English date
 * 2. When EDITING an existing record: Use STORED Hebrew date, NEVER recalculate
 * 3. Dates stored in database are IMMUTABLE - they should only change when user explicitly updates them
 * 
 * @author Pilzno CRM Development Team
 * @version 1.0.0
 */

import { HDate } from '@hebcal/core'
import dayjs, { Dayjs } from 'dayjs'

/**
 * Date Pair Interface
 * 
 * Represents a synchronized pair of Gregorian and Hebrew dates
 * that should always be stored and retrieved together.
 */
export interface DatePair {
  gregorianDate: string  // Format: MM-DD-YYYY
  hebrewDate: string     // Format: "5 Adar II 5744"
}

/**
 * Convert a Gregorian date to Hebrew date format
 * 
 * This function creates an IMMUTABLE date pair for NEW entries.
 * For existing entries, always use the stored Hebrew date from the database.
 * 
 * @param {Dayjs} date - The Gregorian date to convert
 * @returns {DatePair} Object containing both Gregorian and Hebrew dates
 */
export const convertToHebrewDate = (date: Dayjs): DatePair => {
  try {
    // Validate input
    if (!date || !date.isValid()) {
      console.warn('Invalid date provided to convertToHebrewDate:', date)
      return { gregorianDate: '', hebrewDate: '' }
    }
    
    // Validate date range
    const year = date.year()
    if (year < 1850 || year > new Date().getFullYear()) {
      console.warn('Date year out of reasonable range:', year)
      return { gregorianDate: '', hebrewDate: '' }
    }
    
    // Store the EXACT Gregorian date as a constant string (MM-DD-YYYY format)
    const gregorianDate = date.format('MM-DD-YYYY')
    
    // Create Hebrew date using HDate constructor with JavaScript Date object
    // This ensures consistent conversion from Gregorian to Hebrew
    const hebrewDate = new HDate(date.toDate())
    
    // Format: "5 Adar II 5744" using HDate methods
    const hebrewDateString = `${hebrewDate.getDate()} ${hebrewDate.getMonthName()} ${hebrewDate.getFullYear()}`
    
    // Return IMMUTABLE date pair - these values should never change unless user explicitly updates
    return { 
      gregorianDate, 
      hebrewDate: hebrewDateString 
    }
  } catch (error) {
    console.error('Error converting to Hebrew date:', error)
    return { gregorianDate: '', hebrewDate: '' }
  }
}

/**
 * Load date pair from stored data (for editing existing records)
 * 
 * CRITICAL: This function uses the STORED Hebrew date from the database.
 * It does NOT recalculate the Hebrew date, preventing date shifts.
 * 
 * @param {string} storedGregorianDate - The stored Gregorian date (any format)
 * @param {string} storedHebrewDate - The stored Hebrew date from database
 * @returns {DatePair} Object containing both dates as stored
 */
export const loadStoredDatePair = (
  storedGregorianDate: string | Date | null | undefined,
  storedHebrewDate: string | null | undefined
): DatePair => {
  try {
    // If no Gregorian date, return empty
    if (!storedGregorianDate) {
      return { gregorianDate: '', hebrewDate: storedHebrewDate || '' }
    }
    
    // Parse and format the Gregorian date consistently
    const date = dayjs(storedGregorianDate)
    if (!date.isValid()) {
      console.warn('Invalid stored Gregorian date:', storedGregorianDate)
      return { gregorianDate: '', hebrewDate: storedHebrewDate || '' }
    }
    
    // Use stored Hebrew date if available (CRITICAL for preventing date shifts)
    // Only fall back to calculation if Hebrew date is completely missing
    let hebrewDate = storedHebrewDate || ''
    
    if (!hebrewDate) {
      // Fallback: Calculate if Hebrew date is missing (for backwards compatibility)
      // This should only happen for very old records that don't have Hebrew dates
      console.warn('No stored Hebrew date found, calculating from Gregorian date')
      const calculated = convertToHebrewDate(date)
      hebrewDate = calculated.hebrewDate
    }
    
    return {
      gregorianDate: date.format('MM-DD-YYYY'),
      hebrewDate: hebrewDate
    }
  } catch (error) {
    console.error('Error loading stored date pair:', error)
    return { gregorianDate: '', hebrewDate: '' }
  }
}

/**
 * Validate that a stored date pair matches the calculated conversion
 * 
 * This is used for debugging and detecting date drift issues.
 * 
 * @param {string} storedGregorianDate - The stored Gregorian date
 * @param {string} storedHebrewDate - The stored Hebrew date
 * @returns {boolean} True if dates match, false if there's a discrepancy
 */
export const validateDatePair = (
  storedGregorianDate: string | Date,
  storedHebrewDate: string
): boolean => {
  try {
    const date = dayjs(storedGregorianDate)
    if (!date.isValid()) {
      return false
    }
    
    const calculated = convertToHebrewDate(date)
    const matches = calculated.hebrewDate === storedHebrewDate
    
    if (!matches) {
      console.warn('Date pair validation failed:', {
        storedGregorianDate,
        storedHebrewDate,
        calculatedHebrewDate: calculated.hebrewDate
      })
    }
    
    return matches
  } catch (error) {
    console.error('Error validating date pair:', error)
    return false
  }
}

