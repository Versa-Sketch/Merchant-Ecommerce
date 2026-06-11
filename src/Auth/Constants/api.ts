// API base — override via EXPO_PUBLIC_API_URL env variable for production
// Android emulator loopback: 10.0.2.2 maps to host machine's localhost
const BASE = (
  process.env.EXPO_PUBLIC_API_URL ??
  "https://local-ecommerce-backend-production.up.railway.app/api"
).replace(/\/$/, "");

export const API_BASE = BASE;

export const AUTH_ENDPOINTS = {
  REGISTER: `${BASE}/accounts/register/`,
  VERIFY_OTP: `${BASE}/accounts/verify-otp/`,
  LOGIN: `${BASE}/accounts/login/`,
  ME: `${BASE}/accounts/me/`,
} as const;

export const SHOP_ENDPOINTS = {
  ONBOARDING_STATUS: `${BASE}/shops/onboarding/status/`,
  ONBOARDING_STEP_SHOP_DETAILS: `${BASE}/shops/onboarding/step/shop-details/`,
  ONBOARDING_STEP_BUSINESS_TYPE: `${BASE}/shops/onboarding/step/business-type/`,
  ONBOARDING_STEP_IDENTITY_DOCS: `${BASE}/shops/onboarding/step/identity-docs/`,
  ONBOARDING_STEP_COMPLIANCE_DOCS: `${BASE}/shops/onboarding/step/compliance-docs/`,
  ONBOARDING_STEP_BUSINESS_REGISTRATION: `${BASE}/shops/onboarding/step/business-registration/`,
  ONBOARDING_STEP_INCORPORATION_DOCS: `${BASE}/shops/onboarding/step/incorporation-docs/`,
  ONBOARDING_STEP_DIRECTORS_KYC: `${BASE}/shops/onboarding/step/directors-kyc/`,
  ONBOARDING_STEP_BANK_DETAILS: `${BASE}/shops/onboarding/step/bank-details/`,
  ONBOARDING_STEP_ADDRESS_PROOF: `${BASE}/shops/onboarding/step/address-proof/`,
  ONBOARDING_STEP_STORE_PHOTOS: `${BASE}/shops/onboarding/step/store-photos/`,
  ONBOARDING_SUBMIT: `${BASE}/shops/onboarding/submit/`,
  SHOP_TYPES_BROWSE: `${BASE}/shops/shop-owner/shop-types/`,
  MY_SHOP_TYPES: `${BASE}/shops/shop-owner/my-shop/shop-types/`,
  SHOP_TYPE_CATEGORY_SUGGESTIONS: `${BASE}/shops/shop-owner/shop-types/category-suggestions/`,
} as const;

export const ROLE = "SHOP_OWNER" as const;
