export type AuthFlowScreen = 'welcome' | 'login' | 'otp' | 'create-account' | 'store-details' | 'success';
export type OTPState = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

// Authenticated user profile — returned by GET /accounts/me/.
// This is the single source of truth for "who is logged in"; never trust
// locally-derived/cached fields over a fresh response from this endpoint.
export interface UserProfile {
  id: string;
  phone_number: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  shop_id: string | null;
}

export interface PhoneValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateIndianPhone(phone: string): PhoneValidationResult {
  if (!phone) return { valid: false, error: 'Please enter your mobile number' };
  if (phone.length < 10) return { valid: false, error: 'Mobile number must contain 10 digits' };
  if (!/^[6-9]/.test(phone)) return { valid: false, error: 'Enter a valid mobile number' };
  return { valid: true, error: null };
}
