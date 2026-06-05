// API base — override via EXPO_PUBLIC_API_URL env variable for production
// Android emulator loopback: 10.0.2.2 maps to host machine's localhost
const BASE = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.10.48.105:8000"
).replace(/\/$/, "");

export const AUTH_ENDPOINTS = {
  REGISTER: `${BASE}/api/accounts/register/`,
  VERIFY_OTP: `${BASE}/api/accounts/verify-otp/`,
} as const;

export const ROLE = "SHOP_OWNER" as const;
