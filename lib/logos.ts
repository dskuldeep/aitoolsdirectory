/**
 * Utility functions for fetching tool logos
 * Uses multiple free services as fallbacks
 */

/**
 * Get logo URL from a website domain
 * Uses Clearbit Logo API (transparent backgrounds) with Google Favicon fallback
 */
export function getLogoUrl(website: string | null | undefined): string {
  if (!website) {
    return '/placeholder-logo.svg'
  }

  try {
    const url = new URL(website)
    const domain = url.hostname.replace('www.', '')
    
    // Use Clearbit Logo API - provides transparent PNG logos (free, no API key needed)
    // This gives much better quality logos with transparent backgrounds
    return `https://logo.clearbit.com/${domain}`
  } catch {
    return '/placeholder-logo.svg'
  }
}

/**
 * Get a better quality logo using Clearbit Logo API (free tier available)
 * Falls back to Google Favicon if Clearbit fails
 */
export async function getHighQualityLogo(website: string | null | undefined): Promise<string> {
  if (!website) {
    return '/placeholder-logo.svg'
  }

  try {
    const url = new URL(website)
    const domain = url.hostname.replace('www.', '')
    
    // Try Clearbit Logo API (free, no auth needed for public API)
    const clearbitUrl = `https://logo.clearbit.com/${domain}`
    
    // Test if Clearbit has the logo by checking if it returns a valid image
    try {
      const response = await fetch(clearbitUrl, { method: 'HEAD' })
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        return clearbitUrl
      }
    } catch {
      // Fall through to Google Favicon
    }
    
    // Fallback to Google Favicon
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return '/placeholder-logo.svg'
  }
}

/**
 * Get logo URL synchronously (for client components)
 * Uses Clearbit Logo API for transparent backgrounds
 */
export function getLogoUrlSync(website: string | null | undefined): string {
  return getLogoUrl(website)
}

