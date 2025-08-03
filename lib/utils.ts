import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to DD/MM/YYYY format consistently across the application
 * @param date - The date to format (can be Date object or date string)
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formats a date and time to DD/MM/YYYY HH:MM format
 * @param date - The date to format (can be Date object or date string)
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return `${dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })} at ${dateObj.toLocaleTimeString()}`
}

/**
 * Converts a Date object to YYYY-MM-DD string format while preserving local date
 * This prevents timezone issues when storing dates
 * @param date - The date to convert
 * @returns Date string in YYYY-MM-DD format
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converts a Date object to YYYY-MM-DDTHH:MM:SS string format while preserving local date and time
 * This prevents timezone issues when storing timestamps
 * @param date - The date to convert
 * @returns Date-time string in YYYY-MM-DDTHH:MM:SS format
 */
export function toLocalDateTimeString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}
