import { makeAutoObservable, runInAction } from 'mobx';
import { AUTH_ENDPOINTS, ROLE } from '../Constants/api';

// ── Storage abstraction ─────────────────────────────────────────────────────
interface KVStore {
  getBoolean(key: string): boolean | undefined;
  getString(key: string): string | undefined;
  setBoolean(key: string, value: boolean): void;
  setString(key: string, value: string): void;
  delete(key: string): void;
}

function createKVStore(): KVStore {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv');
    const mmkv = new MMKV({ id: 'shopkeeper-session' });
    return {
      getBoolean: (k) => mmkv.getBoolean(k),
      getString: (k) => mmkv.getString(k),
      setBoolean: (k, v) => mmkv.set(k, v),
      setString: (k, v) => mmkv.set(k, v),
      delete: (k) => mmkv.delete(k),
    };
  } catch {
    const map = new Map<string, unknown>();
    return {
      getBoolean: (k) => map.get(k) as boolean | undefined,
      getString: (k) => map.get(k) as string | undefined,
      setBoolean: (k, v) => map.set(k, v),
      setString: (k, v) => map.set(k, v),
      delete: (k) => { map.delete(k); },
    };
  }
}

const kv = createKVStore();

// ── Helper: safe JSON parse ─────────────────────────────────────────────────
async function parseJSON(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function errorMessage(body: Record<string, unknown> | null, fallback: string): string {
  if (!body) return fallback;
  // Support both `message` and `detail` (DRF default)
  return (body.message as string) ?? (body.detail as string) ?? fallback;
}

// ── Types ───────────────────────────────────────────────────────────────────
export type OTPState = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

// ── SessionStore ────────────────────────────────────────────────────────────
export class SessionStore {
  isAuthenticated: boolean = false;
  accessToken: string | null = null;
  refreshToken: string | null = null;

  phone: string = '';
  countryCode: string = '+91';
  fullName: string = '';
  storeName: string = '';
  email: string = '';
  storeCategory: string = '';
  storeAddress: string = '';

  otpState: OTPState = 'idle';
  otpError: string | null = null;
  isNewUser: boolean = false;
  isCreatingAccount: boolean = false;

  constructor() {
    makeAutoObservable(this);
    this.isAuthenticated = kv.getBoolean('isAuthenticated') ?? false;
    this.accessToken = kv.getString('accessToken') ?? null;
    this.refreshToken = kv.getString('refreshToken') ?? null;
  }

  // ── Setters ──────────────────────────────────────────────────────────────
  setPhone(phone: string) { this.phone = phone.replace(/\D/g, '').slice(0, 10); }
  setFullName(v: string) { this.fullName = v; }
  setStoreName(v: string) { this.storeName = v; }
  setEmail(v: string) { this.email = v; }
  setStoreCategory(v: string) { this.storeCategory = v; }
  setStoreAddress(v: string) { this.storeAddress = v; }

  get phoneValid(): boolean {
    return this.phone.length === 10 && /^[6-9]/.test(this.phone);
  }

  get fullPhoneNumber(): string {
    return `+91${this.phone}`;
  }

  // ── Send OTP — POST /api/accounts/register/ ───────────────────────────────
  // Returns true ONLY when the server confirms OTP was sent (200 or 409).
  // Any network failure or API error sets otpState='error' and returns false.
  async sendOTP(): Promise<boolean> {
    runInAction(() => { this.otpState = 'sending'; this.otpError = null; });

    // ① Make the request — catch only genuine network failures
    let res: Response;
    try {
      res = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: this.fullPhoneNumber,
          full_name: this.fullName.trim(),
          role: ROLE,
        }),
      });
    } catch (networkErr) {
      // Device has no connectivity or the server host is unreachable
      runInAction(() => {
        this.otpState = 'error';
        this.otpError = 'Unable to connect. Please check your internet connection and try again.';
      });
      return false;
    }

    // ② Parse the response body (might be HTML on a 500)
    const body = await parseJSON(res);

    // ③ Route by HTTP status
    switch (res.status) {
      case 200:
        // New user — OTP sent successfully
        runInAction(() => { this.otpState = 'sent'; this.isNewUser = true; });
        return true;

      case 409:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = errorMessage(body, 'This phone number is already registered. Please sign in.');
        });
        return false;

      case 400:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = errorMessage(body, 'Invalid details. Please check your name and number.');
        });
        return false;

      case 429:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = 'Too many requests. Please wait a few minutes and try again.';
        });
        return false;

      case 500:
      case 502:
      case 503:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = 'Server error. Please try again later.';
        });
        return false;

      default:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = errorMessage(body, 'Failed to send OTP. Please try again.');
        });
        return false;
    }
  }

  // ── Verify OTP — POST /api/accounts/verify-otp/ ──────────────────────────
  // Returns { success: true } ONLY on HTTP 201 with valid tokens.
  async verifyOTP(otp: string): Promise<{ success: boolean; isNewUser: boolean }> {
    runInAction(() => { this.otpState = 'verifying'; this.otpError = null; });

    // ① Make the request
    let res: Response;
    try {
      res = await fetch(AUTH_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: this.fullPhoneNumber,
          role: ROLE,
          otp,
        }),
      });
    } catch {
      runInAction(() => {
        this.otpState = 'error';
        this.otpError = 'Unable to connect. Please check your internet connection and try again.';
      });
      return { success: false, isNewUser: false };
    }

    // ② Parse body
    const body = await parseJSON(res);

    // ③ Route by status
    if (res.status === 201) {
      const data = body?.data as { access: string; refresh: string } | undefined;
      if (!data?.access || !data?.refresh) {
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = 'Unexpected server response. Please try again.';
        });
        return { success: false, isNewUser: false };
      }

      runInAction(() => {
        this.otpState = 'verified';
        this.accessToken = data.access;
        this.refreshToken = data.refresh;
        this.isAuthenticated = true;
      });
      kv.setString('accessToken', data.access);
      kv.setString('refreshToken', data.refresh);
      kv.setBoolean('isAuthenticated', true);
      return { success: true, isNewUser: this.isNewUser };
    }

    // Handle every error status explicitly
    switch (res.status) {
      case 400:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = errorMessage(body, 'OTP must contain 6 digits.');
        });
        break;
      case 404:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = errorMessage(body, 'OTP expired or not found. Request a new one.');
        });
        break;
      case 429:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = 'Maximum attempts reached. Please request a new OTP.';
        });
        break;
      default:
        runInAction(() => {
          this.otpState = 'error';
          this.otpError = errorMessage(body, 'Incorrect OTP. Try again.');
        });
    }
    return { success: false, isNewUser: false };
  }

  // ── Create Account (local — onboarding API not yet integrated) ───────────
  async createAccount(): Promise<boolean> {
    runInAction(() => { this.isCreatingAccount = true; });
    await delay(600);
    runInAction(() => { this.isCreatingAccount = false; this.isAuthenticated = true; });
    kv.setBoolean('isAuthenticated', true);
    return true;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  resetOTPState() {
    this.otpState = 'idle';
    this.otpError = null;
  }

  logout() {
    runInAction(() => {
      this.isAuthenticated = false;
      this.accessToken = null;
      this.refreshToken = null;
      this.phone = '';
      this.fullName = '';
      this.otpState = 'idle';
      this.otpError = null;
      this.isNewUser = false;
      this.storeName = '';
      this.email = '';
      this.storeCategory = '';
      this.storeAddress = '';
    });
    kv.delete('isAuthenticated');
    kv.delete('accessToken');
    kv.delete('refreshToken');
  }
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
