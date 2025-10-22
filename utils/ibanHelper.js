// Saudi bank codes and their corresponding logos
const SAUDI_BANK_CODES = {
  // Al Rajhi Bank
  "80": "alrajhi",
  
  // Saudi National Bank (SNB) - formerly NCB
  "10": "snb",
  "45": "snb", // Alternative code
  
  // Riyad Bank
  "20": "riyad",
  
  // Alinma Bank
  "05": "alinma",
  
  // Bank AlJazira
  "30": "aljazira",
  
  // Saudi British Bank (SABB)
  "40": "sabb",
  
  // Arab National Bank (ANB)
  "15": "anb",
  
  // Banque Saudi Fransi
  "55": "bsf",
  
  // Saudi Investment Bank (SAIB)
  "25": "saib",
  
  // Bank AlBilad
  "50": "albilad",
};

/**
 * Detects the bank type from a Saudi IBAN
 * @param {string} iban - The IBAN string (with or without SA prefix)
 * @returns {string|null} - Bank code or null if not detected
 */
export const detectBankFromIBAN = (iban) => {
  if (!iban || typeof iban !== "string") {
    return null;
  }

  // Remove spaces and convert to uppercase
  const cleanIBAN = iban.replace(/\s/g, "").toUpperCase();
  
  // Check if it's a Saudi IBAN (starts with SA)
  if (!cleanIBAN.startsWith("SA")) {
    return null;
  }

  // Saudi IBAN format: SA + 2 check digits + 2 bank code + 18 account number
  // Extract bank code (positions 4-5 after SA)
  if (cleanIBAN.length >= 6) {
    const bankCode = cleanIBAN.substring(4, 6);
    return SAUDI_BANK_CODES[bankCode] || null;
  }

  return null;
};

/**
 * Formats IBAN with spaces for better readability
 * @param {string} iban - The IBAN string
 * @returns {string} - Formatted IBAN with spaces
 */
export const formatIBAN = (iban) => {
  if (!iban) return "";
  
  // Remove all non-alphanumeric characters
  const cleaned = iban.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  
  // Add spaces every 4 characters
  return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
};

/**
 * Validates Saudi IBAN format
 * @param {string} iban - The IBAN string
 * @returns {boolean} - True if valid Saudi IBAN format
 */
export const validateSaudiIBAN = (iban) => {
  if (!iban) return false;
  
  const cleanIBAN = iban.replace(/\s/g, "").toUpperCase();
  
  // Must start with SA
  if (!cleanIBAN.startsWith("SA")) return false;
  
  // Must be exactly 24 characters
  if (cleanIBAN.length !== 24) return false;
  
  // Characters after SA must be digits
  const digits = cleanIBAN.substring(2);
  return /^\d{22}$/.test(digits);
};
