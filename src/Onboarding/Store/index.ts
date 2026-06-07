import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";
import { Platform } from "react-native";
import { SHOP_ENDPOINTS } from "../../Auth/Constants/api";
import type { OnboardingStep, SessionStore } from "../../Auth/Store";

export type StepState = "idle" | "submitting" | "error";

export interface DirectorEntry {
  name: string;
  designation: "director" | "partner";
  panFile: { uri: string; name: string; type: string } | null;
  aadhaarFile: { uri: string; name: string; type: string } | null;
}

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  // Populated on web only — the picker returns a real File/Blob there,
  // which is what FormData.append needs (the {uri,name,type} shape is RN-only).
  file?: Blob;
}

function parseStepResponse(
  body: Record<string, unknown> | null,
  sessionStore: SessionStore,
) {
  const data = body?.data as
    | {
        current_step?: OnboardingStep;
        completed_steps?: OnboardingStep[];
        business_type?: string;
      }
    | undefined;
  if (!data) return;
  runInAction(() => {
    if (data.current_step)
      sessionStore.onboardingCurrentStep = data.current_step;
    if (data.completed_steps)
      sessionStore.onboardingCompletedSteps = data.completed_steps;
    if (data.business_type)
      sessionStore.onboardingBusinessType = data.business_type;
  });
}

async function parseJSON(
  res: Response,
): Promise<Record<string, unknown> | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Append a local file to FormData.
// Web: FormData needs a real Blob/File (the picker provides one via `file`).
// Native: use the RN { uri, name, type } pattern — DO NOT use fetch().blob()
// here, Expo SDK 56 Winter fetch does not support ArrayBuffer-backed blobs.
function appendFile(fd: FormData, key: string, file: PickedFile): void {
  if (Platform.OS === "web" && file.file) {
    fd.append(key, file.file, file.name);
    return;
  }
  fd.append(key, { uri: file.uri, name: file.name, type: file.type } as any);
}
export class OnboardingStore {
  stepState: StepState = "idle";
  stepError: string | null = null;

  private sessionStore: SessionStore;

  constructor(sessionStore: SessionStore) {
    this.sessionStore = sessionStore;
    makeAutoObservable(this);
  }

  private get authHeader() {
    return { Authorization: `Bearer ${this.sessionStore.accessToken}` };
  }

  // JSON-only POST — uses fetch (fine for non-file requests)
  private async post(
    url: string,
    body: string,
    isJSON = true,
  ): Promise<boolean> {
    runInAction(() => {
      this.stepState = "submitting";
      this.stepError = null;
    });
    console.log(
      "[OnboardingStore] POST",
      url,
      "token present:",
      !!this.sessionStore.accessToken,
    );
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { ...this.authHeader, "Content-Type": "application/json" },
        body,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[OnboardingStore] fetch failed:", msg);
      runInAction(() => {
        this.stepState = "error";
        this.stepError = msg || "No internet connection. Please try again.";
      });
      return false;
    }
    const parsed = await parseJSON(res);
    if (res.ok) {
      parseStepResponse(parsed, this.sessionStore);
      runInAction(() => {
        this.stepState = "idle";
      });
      return true;
    }
    const msg =
      (parsed?.message as string) ?? "Something went wrong. Please try again.";
    runInAction(() => {
      this.stepState = "error";
      this.stepError = msg;
    });
    return false;
  }

  // Multipart/FormData POST — uses axios (XHR-based) because Expo SDK 56's
  // Winter fetch does NOT support { uri, name, type } FormData parts.
  private async postFormData(url: string, fd: FormData): Promise<boolean> {
    runInAction(() => {
      this.stepState = "submitting";
      this.stepError = null;
    });
    console.log(
      "[OnboardingStore] POST (axios/multipart)",
      url,
      "token present:",
      !!this.sessionStore.accessToken,
    );
    try {
      const res = await axios.post<Record<string, unknown>>(url, fd, {
        headers: {
          ...this.authHeader,
          "Content-Type": "multipart/form-data",
        },
      });
      parseStepResponse(res.data, this.sessionStore);
      runInAction(() => {
        this.stepState = "idle";
      });
      return true;
    } catch (err: unknown) {
      let msg = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        msg =
          (err.response?.data as Record<string, unknown>)?.message as string ??
          err.message ??
          msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      console.error("[OnboardingStore] axios multipart failed:", msg);
      runInAction(() => {
        this.stepState = "error";
        this.stepError = msg;
      });
      return false;
    }
  }

  // ── Step 1: Shop Details ──────────────────────────────────────────────────
  async submitShopDetails(fields: {
    shop_name: string;
    address_line1: string;
    address_line2?: string;
    state: string;
    pincode: string;
    shop_phone_number?: string;
    shop_description?: string;
  }): Promise<boolean> {
    return this.post(
      SHOP_ENDPOINTS.ONBOARDING_STEP_SHOP_DETAILS,
      JSON.stringify(fields),
      true,
    );
  }

  // ── Step 2: Business Type ─────────────────────────────────────────────────
  async submitBusinessType(
    business_type: "individual" | "company" | "partnership",
  ): Promise<boolean> {
    return this.post(
      SHOP_ENDPOINTS.ONBOARDING_STEP_BUSINESS_TYPE,
      JSON.stringify({ business_type }),
      true,
    );
  }

  // ── Step: Identity Docs (individual) ─────────────────────────────────────
  async submitIdentityDocs(
    panFile: PickedFile,
    aadhaarFile: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    appendFile(fd, "pan_card", panFile);
    appendFile(fd, "aadhaar_card", aadhaarFile);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_IDENTITY_DOCS, fd);
  }

  // ── Step: Compliance Docs (individual) ───────────────────────────────────
  async submitComplianceDocs(files: {
    gst_certificate?: PickedFile;
    msme_certificate?: PickedFile;
    trade_license?: PickedFile;
  }): Promise<boolean> {
    const fd = new FormData();
    if (files.gst_certificate)
      appendFile(fd, "gst_certificate", files.gst_certificate);
    if (files.msme_certificate)
      appendFile(fd, "msme_certificate", files.msme_certificate);
    if (files.trade_license)
      appendFile(fd, "trade_license", files.trade_license);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_COMPLIANCE_DOCS, fd);
  }

  // ── Step: Business Registration (company/partnership) ─────────────────────
  async submitBusinessRegistration(
    companyPan: PickedFile,
    gstReg: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    appendFile(fd, "company_pan", companyPan);
    appendFile(fd, "gst_registration", gstReg);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_BUSINESS_REGISTRATION, fd);
  }

  // ── Step: Incorporation Docs (company/partnership) ────────────────────────
  async submitIncorporationDocs(files: {
    incorporation_certificate: PickedFile;
    moa_aoa: PickedFile;
    board_resolution?: PickedFile;
    establishment_license?: PickedFile;
  }): Promise<boolean> {
    const fd = new FormData();
    appendFile(fd, "incorporation_certificate", files.incorporation_certificate);
    appendFile(fd, "moa_aoa", files.moa_aoa);
    if (files.board_resolution)
      appendFile(fd, "board_resolution", files.board_resolution);
    if (files.establishment_license)
      appendFile(fd, "establishment_license", files.establishment_license);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_INCORPORATION_DOCS, fd);
  }

  // ── Step: Directors KYC (company/partnership) ─────────────────────────────
  async submitDirectorsKyc(directors: DirectorEntry[]): Promise<boolean> {
    const fd = new FormData();
    for (let i = 0; i < directors.length; i++) {
      const d = directors[i];
      fd.append(`directors[${i}][name]`, d.name);
      fd.append(`directors[${i}][designation]`, d.designation);
      if (d.panFile)
        appendFile(fd, `directors[${i}][pan_card]`, d.panFile);
      if (d.aadhaarFile)
        appendFile(fd, `directors[${i}][aadhaar_card]`, d.aadhaarFile);
    }
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_DIRECTORS_KYC, fd);
  }

  // ── Step: Bank Details ────────────────────────────────────────────────────
  async submitBankDetails(
    fields: {
      bank_account_name: string;
      bank_account_number: string;
      bank_ifsc_code: string;
      bank_name: string;
      bank_branch?: string;
    },
    cancelledCheque: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    fd.append("bank_account_name", fields.bank_account_name);
    fd.append("bank_account_number", fields.bank_account_number);
    fd.append("bank_ifsc_code", fields.bank_ifsc_code);
    fd.append("bank_name", fields.bank_name);
    if (fields.bank_branch) fd.append("bank_branch", fields.bank_branch);
    appendFile(fd, "cancelled_cheque", cancelledCheque);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_BANK_DETAILS, fd);
  }

  // ── Step: Address Proof ───────────────────────────────────────────────────
  async submitAddressProof(
    address_proof_type:
      | "electricity_bill"
      | "rent_agreement"
      | "property_tax_receipt",
    docFile: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    fd.append("address_proof_type", address_proof_type);
    appendFile(fd, "address_proof_document", docFile);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_ADDRESS_PROOF, fd);
  }

  // ── Step: Store Photos ────────────────────────────────────────────────────
  async submitStorePhotos(
    frontPhoto: PickedFile,
    interiorPhoto: PickedFile,
    signaturePhoto?: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    appendFile(fd, "store_front", frontPhoto);
    appendFile(fd, "store_interior", interiorPhoto);
    if (signaturePhoto)
      appendFile(fd, "signature_photo", signaturePhoto);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_STORE_PHOTOS, fd);
  }

  // ── Final Submit ──────────────────────────────────────────────────────────
  async submitOnboarding(): Promise<boolean> {
    return this.post(
      SHOP_ENDPOINTS.ONBOARDING_SUBMIT,
      JSON.stringify({}),
      true,
    );
  }

  resetStepState() {
    this.stepState = "idle";
    this.stepError = null;
  }
}
