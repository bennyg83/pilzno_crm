/**
 * Hebrew Calendar Utility Functions
 * 
 * This module provides utilities for working with Hebrew calendar dates,
 * particularly for calculating the current Hebrew year and determining
 * which pledges and donations fall within the current Hebrew calendar year.
 * 
 * @author Pilzno CRM Development Team
 * @version 1.0.0
 */

import { HDate } from '@hebcal/core'
import dayjs from 'dayjs'

/**
 * Hebrew Year Range Interface
 * 
 * Represents the start and end dates of a Hebrew calendar year
 * along with the Hebrew year number.
 */
export interface HebrewYearRange {
  start: string // Gregorian start date (YYYY-MM-DD)
  end: string   // Gregorian end date (YYYY-MM-DD)
  hebrewYear: number // Hebrew year (e.g., 5785)
}

/**
 * Get the current Hebrew year range
 * 
 * This function calculates the current Hebrew calendar year based on
 * the current Gregorian date. The Hebrew year runs from Rosh Hashana
 * to the day before the next Rosh Hashana.
 * 
 * @returns {HebrewYearRange} Object containing start date, end date, and Hebrew year
 */
export const getCurrentHebrewYearRange = (): HebrewYearRange => {
  const today = new HDate()
  const currentYear = today.getFullYear()
  
  // For 2025, we know Rosh Hashana 5786 is September 22, 2025
  // and Rosh Hashana 5785 was September 15, 2024
  const currentDate = new Date()
  
  // Check if we're in 2025 and before September 22 (Rosh Hashana 5786)
  if (currentDate.getFullYear() === 2025 && 
      (currentDate.getMonth() < 8 || (currentDate.getMonth() === 8 && currentDate.getDate() < 22))) {
    // We're still in Hebrew year 5785
    return {
      start: '2024-09-15', // Rosh Hashana 5785
      end: '2025-09-22',   // Rosh Hashana 5786
      hebrewYear: 5785
    }
  } else if (currentDate.getFullYear() === 2025 && 
             (currentDate.getMonth() > 8 || (currentDate.getMonth() === 8 && currentDate.getDate() >= 22))) {
    // We're in Hebrew year 5786
    return {
      start: '2025-09-22', // Rosh Hashana 5786
      end: '2026-09-11',   // Rosh Hashana 5787
      hebrewYear: 5786
    }
  } else {
    // Fallback to HDate calculation for other years
    const roshHashana = new HDate(1, 1, currentYear)
    const roshHashanaGregorian = roshHashana.greg()
    
    const nextRoshHashana = new HDate(1, 1, currentYear + 1)
    const nextRoshHashanaGregorian = nextRoshHashana.greg()
    
    return {
      start: dayjs(roshHashanaGregorian).format('YYYY-MM-DD'),
      end: dayjs(nextRoshHashanaGregorian).format('YYYY-MM-DD'),
      hebrewYear: currentYear
    }
  }
}

/**
 * Check if a date falls within the current Hebrew year
 * 
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date falls within the current Hebrew year
 */
export const isWithinCurrentHebrewYear = (dateString: string): boolean => {
  if (!dateString) return false
  
  const hebrewYearRange = getCurrentHebrewYearRange()
  const date = dayjs(dateString)
  
  return date.isAfter(hebrewYearRange.start) && date.isBefore(hebrewYearRange.end)
}

/**
 * Get the Hebrew year for a given Gregorian date
 * 
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {number} The Hebrew year for the given date
 */
export const getHebrewYearForDate = (dateString: string): number => {
  if (!dateString) return 0
  
  try {
    const date = dayjs(dateString).toDate()
    const hebrewDate = new HDate(date)
    return hebrewDate.getFullYear()
  } catch (error) {
    console.error('Error calculating Hebrew year for date:', dateString, error)
    return 0
  }
}

/**
 * Format Hebrew year for display
 * 
 * @param {number} hebrewYear - The Hebrew year number
 * @returns {string} Formatted Hebrew year (e.g., "5785 (2024-2025)")
 */
export const formatHebrewYear = (hebrewYear: number): string => {
  if (!hebrewYear) return ''
  
  // Calculate approximate Gregorian years
  const gregorianStart = hebrewYear - 3760
  const gregorianEnd = gregorianStart + 1
  
  return `${hebrewYear} (${gregorianStart}-${gregorianEnd})`
}
