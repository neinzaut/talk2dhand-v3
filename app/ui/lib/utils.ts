import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines if a sign label is an alphabet or number
 * @param label - The sign label (e.g., "A", "1", "10")
 * @returns "alphabet" | "number" | null
 */
export function getExpectedType(label: string): "alphabet" | "number" | null {
  if (!label) return null
  
  const normalized = label.trim().toUpperCase()
  
  // Check if it's a number (0-9 or 10)
  if (/^\d+$/.test(normalized)) {
    return "number"
  }
  
  // Check if it's a single letter (A-Z)
  if (/^[A-Z]$/.test(normalized)) {
    return "alphabet"
  }
  
  return null
}

/**
 * Determines expected type from lesson title
 * @param lessonTitle - The lesson title
 * @returns "alphabet" | "number" | null
 */
export function getExpectedTypeFromLesson(lessonTitle: string): "alphabet" | "number" | null {
  if (!lessonTitle) return null
  
  const normalized = lessonTitle.toLowerCase()
  
  if (normalized.includes("alphabet") || normalized.includes("alpabeto")) {
    return "alphabet"
  }
  
  if (normalized.includes("number") || normalized.includes("numero")) {
    return "number"
  }
  
  return null
}