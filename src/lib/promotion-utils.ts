/**
 * Generates a random promotion code
 * @param length Length of the code (default: 8)
 * @returns Random alphanumeric code
 */
export function generateRandomCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like O, 0, 1, I
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Insert a dash in the middle for readability
  if (length >= 6) {
    const middle = Math.floor(result.length / 2);
    result = result.slice(0, middle) + '-' + result.slice(middle);
  }
  
  return result;
}

/**
 * Generates a unique code based on a base code
 * @param baseCode The base promotion code
 * @param uniqueIdentifier A unique identifier (e.g., customer ID or response ID)
 * @returns Unique promotion code
 */
export function generateUniqueCode(baseCode: string, uniqueIdentifier: string): string {
  // Remove any existing dash
  const cleanBaseCode = baseCode.replace('-', '');
  
  // Generate a hash from the unique identifier
  let hash = 0;
  for (let i = 0; i < uniqueIdentifier.length; i++) {
    hash = ((hash << 5) - hash) + uniqueIdentifier.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Use the hash to create a 4-character suffix
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  const positiveHash = Math.abs(hash);
  
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt((positiveHash >> (i * 5)) % chars.length);
  }
  
  // Combine base code with the unique suffix
  const uniqueCode = cleanBaseCode.slice(0, 4) + '-' + suffix;
  
  return uniqueCode;
}

/**
 * Formats a promotion code for display
 * @param code The promotion code
 * @returns Formatted code with proper spacing and capitalization
 */
export function formatPromotionCode(code: string): string {
  // Ensure uppercase
  const upperCode = code.toUpperCase();
  
  // Add dash if missing
  if (!upperCode.includes('-') && upperCode.length > 4) {
    const middle = Math.floor(upperCode.length / 2);
    return upperCode.slice(0, middle) + '-' + upperCode.slice(middle);
  }
  
  return upperCode;
}

/**
 * Validates if a promotion code is expired
 * @param expiryDate Optional expiry date
 * @returns Boolean indicating if the promotion is expired
 */
export function isPromotionExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
} 