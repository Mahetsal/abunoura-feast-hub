// Utility to convert Arabic/Persian numerals to Western numerals
export function normalizePhoneNumber(phone: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  let normalized = phone;
  
  // Convert Arabic numerals to Western
  arabicNumerals.forEach((char, index) => {
    normalized = normalized.replace(new RegExp(char, 'g'), index.toString());
  });
  
  // Convert Persian numerals to Western
  persianNumerals.forEach((char, index) => {
    normalized = normalized.replace(new RegExp(char, 'g'), index.toString());
  });
  
  return normalized;
}

// Validate Saudi phone number format
export function isValidSaudiPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone).replace(/\D/g, '');
  // Saudi mobile: 05XXXXXXXX (10 digits starting with 05)
  // Or with country code: 9665XXXXXXXX (12 digits)
  return /^05\d{8}$/.test(normalized) || /^9665\d{8}$/.test(normalized);
}
