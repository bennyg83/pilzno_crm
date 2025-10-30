/**
 * Pledge Calculation Utilities
 * 
 * This module provides utilities for calculating pledge totals,
 * including annual pledges and one-time pledges within the current
 * Hebrew calendar year.
 * 
 * @author Pilzno CRM Development Team
 * @version 1.0.0
 */

import { Pledge } from '../types'
import { isWithinCurrentHebrewYear } from './hebrewCalendar'

/**
 * Pledge Totals Interface
 * 
 * Represents the calculated totals for different types of pledges
 * within the current Hebrew calendar year.
 */
export interface PledgeTotals {
  annualPledges: number
  oneTimePledges: number
  totalPledges: number
  annualPledgesPending: number
  annualPledgesPaid: number
  oneTimePledgesPending: number
  oneTimePledgesPaid: number
  totalPending: number
  totalPaid: number
  currency: 'NIS' | 'USD' | 'GBP'
}

/**
 * Calculate pledge totals for the current Hebrew year
 * 
 * This function analyzes a family's pledges and calculates totals
 * for annual pledges and one-time pledges within the current
 * Hebrew calendar year.
 * 
 * @param {Pledge[]} pledges - Array of pledges for the family
 * @param {string} currency - The family's currency
 * @returns {PledgeTotals} Calculated pledge totals
 */
export const calculatePledgeTotals = (pledges: Pledge[] = [], currency: 'NIS' | 'USD' | 'GBP' = 'NIS'): PledgeTotals => {
  // const hebrewYearRange = getCurrentHebrewYearRange() // TODO: Use for Hebrew year filtering
  
  // Initialize totals
  let annualPledges = 0
  let oneTimePledges = 0
  let annualPledgesPending = 0
  let annualPledgesPaid = 0
  let oneTimePledgesPending = 0
  let oneTimePledgesPaid = 0
  
  // Process each pledge
  pledges.forEach(pledge => {
    if (!pledge) return
    
    // Check if pledge is within current Hebrew year
    const isWithinHebrewYear = isWithinCurrentHebrewYear(pledge.date)
    
    if (!isWithinHebrewYear) return
    
    const amount = typeof pledge.amount === 'string' ? parseFloat(pledge.amount) : pledge.amount
    const validAmount = isNaN(amount) ? 0 : amount
    
    if (pledge.isAnnualPledge) {
      // Annual pledge
      annualPledges += validAmount
      
      if (pledge.status === 'pending' || pledge.status === 'partial') {
        annualPledgesPending += validAmount
      } else if (pledge.status === 'fulfilled') {
        annualPledgesPaid += validAmount
      }
    } else {
      // One-time pledge
      oneTimePledges += validAmount
      
      if (pledge.status === 'pending' || pledge.status === 'partial') {
        oneTimePledgesPending += validAmount
      } else if (pledge.status === 'fulfilled') {
        oneTimePledgesPaid += validAmount
      }
    }
  })
  
  // Calculate totals
  const totalPledges = annualPledges + oneTimePledges
  const totalPending = annualPledgesPending + oneTimePledgesPending
  const totalPaid = annualPledgesPaid + oneTimePledgesPaid
  
  return {
    annualPledges,
    oneTimePledges,
    totalPledges,
    annualPledgesPending,
    annualPledgesPaid,
    oneTimePledgesPending,
    oneTimePledgesPaid,
    totalPending,
    totalPaid,
    currency
  }
}

/**
 * Format pledge totals for display
 * 
 * @param {PledgeTotals} totals - The calculated pledge totals
 * @returns {string} Formatted display string
 */
export const formatPledgeTotals = (totals: PledgeTotals): string => {
  const { annualPledges, oneTimePledges, totalPledges, currency } = totals
  
  if (totalPledges === 0) {
    return `₪0`
  }
  
  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '₪'
  
  if (annualPledges > 0 && oneTimePledges > 0) {
    return `${currencySymbol}${totalPledges.toLocaleString()} (Annual: ${currencySymbol}${annualPledges.toLocaleString()}, One-time: ${currencySymbol}${oneTimePledges.toLocaleString()})`
  } else if (annualPledges > 0) {
    return `${currencySymbol}${annualPledges.toLocaleString()} (Annual)`
  } else {
    return `${currencySymbol}${oneTimePledges.toLocaleString()} (One-time)`
  }
}

/**
 * Get detailed pledge breakdown for display
 * 
 * @param {PledgeTotals} totals - The calculated pledge totals
 * @returns {object} Detailed breakdown object
 */
export const getPledgeBreakdown = (totals: PledgeTotals) => {
  const { annualPledges, oneTimePledges, totalPledges, currency } = totals
  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '₪'
  
  return {
    total: `${currencySymbol}${totalPledges.toLocaleString()}`,
    annual: annualPledges > 0 ? `${currencySymbol}${annualPledges.toLocaleString()}` : null,
    oneTime: oneTimePledges > 0 ? `${currencySymbol}${oneTimePledges.toLocaleString()}` : null,
    hasBoth: annualPledges > 0 && oneTimePledges > 0,
    isEmpty: totalPledges === 0
  }
}
