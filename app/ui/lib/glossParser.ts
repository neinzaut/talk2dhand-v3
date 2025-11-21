/**
 * Gloss Parser Utility
 * Parses ASL gloss strings into structured token arrays for animation
 */

export interface GlossToken {
  word: string
  isPunctuation: boolean
  originalIndex: number
}

export interface ParsedGloss {
  tokens: GlossToken[]
  totalWords: number
}

/**
 * Parse a gloss string into tokens
 * @param gloss - ASL gloss string (e.g., "YOU HUNGRY? WANT FRENCH FRIES?")
 * @returns ParsedGloss object with token array
 */
export function parseGloss(gloss: string): ParsedGloss {
  if (!gloss || typeof gloss !== 'string') {
    return { tokens: [], totalWords: 0 }
  }

  // Split by whitespace and filter empty strings
  const words = gloss
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)

  const tokens: GlossToken[] = []

  words.forEach((word, index) => {
    // Check if word ends with punctuation
    const punctuationMatch = word.match(/^(.*?)([?.!,;]+)$/)
    
    if (punctuationMatch) {
      const [, wordPart, punctPart] = punctuationMatch
      
      // Add the word part if it exists
      if (wordPart.length > 0) {
        tokens.push({
          word: wordPart.toUpperCase(),
          isPunctuation: false,
          originalIndex: index,
        })
      }
      
      // Add punctuation as separate token
      tokens.push({
        word: punctPart,
        isPunctuation: true,
        originalIndex: index,
      })
    } else {
      // Regular word token
      tokens.push({
        word: word.toUpperCase(),
        isPunctuation: false,
        originalIndex: index,
      })
    }
  })

  return {
    tokens,
    totalWords: tokens.length,
  }
}

/**
 * Get display duration for a token based on type
 * @param token - GlossToken
 * @param baseSpeed - Base duration in milliseconds (default 1500ms)
 * @returns Duration in milliseconds
 */
export function getTokenDuration(token: GlossToken, baseSpeed: number = 1500): number {
  if (token.isPunctuation) {
    // Punctuation gets 1.5x longer pause
    return baseSpeed * 1.5
  }
  return baseSpeed
}

/**
 * Normalize gloss text for display
 * @param gloss - Raw gloss string
 * @returns Normalized gloss string
 */
export function normalizeGloss(gloss: string): string {
  return gloss
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

/**
 * Calculate total animation duration
 * @param tokens - Array of GlossToken
 * @param baseSpeed - Base speed in milliseconds
 * @returns Total duration in milliseconds
 */
export function calculateTotalDuration(tokens: GlossToken[], baseSpeed: number = 1500): number {
  return tokens.reduce((total, token) => {
    return total + getTokenDuration(token, baseSpeed)
  }, 0)
}
