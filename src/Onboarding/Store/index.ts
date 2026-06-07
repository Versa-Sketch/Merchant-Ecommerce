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

function errorMessage(
  body: Record<string, unknown> | null,
  fallback: string,
): string {
  if (!body) return fallback;
  return (body.message as string) ?? (body.detail as string) ?? fallback;
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
  fetchingState: "idle" | "loading" | "error" = "idle";
  fetchingError: string | null = null;

  private sessionStore: SessionStore;

  constructor(sessionStore: SessionStore) {
    this.sessionStore = sessionStore;
    makeAutoObservable(this);
  }

  private get authHeader() {
    return { Authorization: `Bearer ${this.sessionStore.accessToken}` };
  }

  // Generic JSON GET request
  private async get(url: string): Promise<any> {
    runInAction(() => {
      this.fetchingState = "loading";
      this.fetchingError = null;
    });
    console.log("[OnboardingStore] GET", url);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { ...this.authHeader, "Content-Type": "application/json" },
      });
      const parsed = await parseJSON(res);
      if (res.ok) {
        runInAction(() => {
          this.fetchingState = "idle";
        });
        return parsed?.data ?? null;
      }
      const msg = errorMessage(parsed, "Failed to load previously completed step.");
      runInAction(() => {
        this.fetchingState = "error";
        this.fetchingError = msg;
      });
      return null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      runInAction(() => {
        this.fetchingState = "error";
        this.fetchingError = msg || "Connection error. Please try again.";
      });
      return null;
    }
  }

  // JSON-only POST
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

  // JSON-only PATCH
  private async patch(url: string, body: string): Promise<boolean> {
    runInAction(() => {
      this.stepState = "submitting";
      this.stepError = null;
    });
    console.log("[OnboardingStore] PATCH", url);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "PATCH",
        headers: { ...this.authHeader, "Content-Type": "application/json" },
        body,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
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
    const msg = errorMessage(parsed, "Failed to update step.");
    runInAction(() => {
      this.stepState = "error";
      this.stepError = msg;
    });
    return false;
  }

  // Multipart/FormData POST
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
    // React Native's FormData has an internal `_parts` array.
    // If it's empty, we append a dummy field so Axios does not throw a "Network Error".
    const parts = (fd as any)._parts;
    if (Array.isArray(parts) && parts.length === 0) {
      fd.append("skipped", "true");
    }

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

  // Multipart/FormData PATCH
  private async patchFormData(url: string, fd: FormData): Promise<boolean> {
    runInAction(() => {
      this.stepState = "submitting";
      this.stepError = null;
    });
    console.log("[OnboardingStore] PATCH (axios/multipart)", url);

    const parts = (fd as any)._parts;
    if (Array.isArray(parts) && parts.length === 0) {
      fd.append("skipped", "true");
    }

    try {
      const res = await axios.patch<Record<string, unknown>>(url, fd, {
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
      console.error("[OnboardingStore] axios multipart PATCH failed:", msg);
      runInAction(() => {
        this.stepState = "error";
        this.stepError = msg;
      });
      return false;
    }
  }

  // ── Step 1: Shop Details ──────────────────────────────────────────────────
  async fetchShopDetails(): Promise<{
    shop_name: string;
    address_line1: string;
    address_line2?: string;
    state: string;
    pincode: string;
    shop_phone_number?: string;
    shop_description?: string;
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_SHOP_DETAILS);
  }

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

  async patchShopDetails(fields: Partial<{
    shop_name: string;
    address_line1: string;
    address_line2: string | null;
    state: string;
    pincode: string;
    shop_phone_number: string | null;
    shop_description: string | null;
  }>): Promise<boolean> {
    return this.patch(
      SHOP_ENDPOINTS.ONBOARDING_STEP_SHOP_DETAILS,
      JSON.stringify(fields),
    );
  }

  // ── Step 2: Business Type ─────────────────────────────────────────────────
  async fetchBusinessType(): Promise<{
    business_type: "individual" | "company" | "partnership";
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_BUSINESS_TYPE);
  }

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
  async fetchIdentityDocs(): Promise<{
    pan_card: string;
    aadhaar_card: string;
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_IDENTITY_DOCS);
  }

  async submitIdentityDocs(
    panFile: PickedFile,
    aadhaarFile: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    appendFile(fd, "pan_card", panFile);
    appendFile(fd, "aadhaar_card", aadhaarFile);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_IDENTITY_DOCS, fd);
  }

  async patchIdentityDocs(files: {
    pan_card?: PickedFile;
    aadhaar_card?: PickedFile;
  }): Promise<boolean> {
    const fd = new FormData();
    if (files.pan_card) appendFile(fd, "pan_card", files.pan_card);
    if (files.aadhaar_card) appendFile(fd, "aadhaar_card", files.aadhaar_card);
    return this.patchFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_IDENTITY_DOCS, fd);
  }

  // ── Step: Compliance Docs (individual) ───────────────────────────────────
  async fetchComplianceDocs(): Promise<{
    gst_certificate?: string;
    msme_certificate?: string;
    trade_license?: string;
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_COMPLIANCE_DOCS);
  }

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

  async patchComplianceDocs(files: {
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
    return this.patchFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_COMPLIANCE_DOCS, fd);
  }

  // ── Step: Business Registration (company/partnership) ─────────────────────
  async fetchBusinessRegistration(): Promise<{
    company_pan: string;
    gst_registration: string;
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_BUSINESS_REGISTRATION);
  }

  async submitBusinessRegistration(
    companyPan: PickedFile,
    gstReg: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    appendFile(fd, "company_pan", companyPan);
    appendFile(fd, "gst_registration", gstReg);
    return this.postFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_BUSINESS_REGISTRATION, fd);
  }

  async patchBusinessRegistration(files: {
    company_pan?: PickedFile;
    gst_registration?: PickedFile;
  }): Promise<boolean> {
    const fd = new FormData();
    if (files.company_pan) appendFile(fd, "company_pan", files.company_pan);
    if (files.gst_registration) appendFile(fd, "gst_registration", files.gst_registration);
    return this.patchFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_BUSINESS_REGISTRATION, fd);
  }

  // ── Step: Incorporation Docs (company/partnership) ────────────────────────
  async fetchIncorporationDocs(): Promise<{
    incorporation_certificate: string;
    moa_aoa: string;
    board_resolution?: string;
    establishment_license?: string;
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_INCORPORATION_DOCS);
  }

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

  async patchIncorporationDocs(files: {
    incorporation_certificate?: PickedFile;
    moa_aoa?: PickedFile;
    board_resolution?: PickedFile;
    establishment_license?: PickedFile;
  }): Promise<boolean> {
    const fd = new FormData();
    if (files.incorporation_certificate)
      appendFile(fd, "incorporation_certificate", files.incorporation_certificate);
    if (files.moa_aoa)
      appendFile(fd, "moa_aoa", files.moa_aoa);
    if (files.board_resolution)
      appendFile(fd, "board_resolution", files.board_resolution);
    if (files.establishment_license)
      appendFile(fd, "establishment_license", files.establishment_license);
    return this.patchFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_INCORPORATION_DOCS, fd);
  }

  // ── Step: Directors KYC (company/partnership) ─────────────────────────────
  async fetchDirectorsKyc(): Promise<Array<{
    name: string;
    designation: "director" | "partner";
    pan_card: string;
    aadhaar_card: string;
  }> | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_DIRECTORS_KYC);
  }

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

  async patchDirectorsKyc(directors: Array<{
    name?: string;
    designation?: "director" | "partner";
    panFile?: PickedFile | null;
    aadhaarFile?: PickedFile | null;
  }>): Promise<boolean> {
    const fd = new FormData();
    for (let i = 0; i < directors.length; i++) {
      const d = directors[i];
      if (d.name) fd.append(`directors[${i}][name]`, d.name);
      if (d.designation) fd.append(`directors[${i}][designation]`, d.designation);
      if (d.panFile)
        appendFile(fd, `directors[${i}][pan_card]`, d.panFile);
      if (d.aadhaarFile)
        appendFile(fd, `directors[${i}][aadhaar_card]`, d.aadhaarFile);
    }
    return this.patchFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_DIRECTORS_KYC, fd);
  }

  // ── Step: Bank Details ────────────────────────────────────────────────────
  async fetchBankDetails(): Promise<{
    bank_account_name: string;
    bank_account_number: string;
    bank_ifsc_code: string;
    bank_name: string;
    bank_branch?: string;
    cancelled_cheque?: string;
    cancelled_cheque_or_passbook?: string;
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_BANK_DETAILS);
  }

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

  async patchBankDetails(
    fields: Partial<{
      bank_account_name: string;
      bank_account_number: string;
      bank_ifsc_code: string;
      bank_name: string;
      bank_branch: string | null;
    }>,
    cancelledCheque?: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    if (fields.bank_account_name) fd.append("bank_account_name", fields.bank_account_name);
    if (fields.bank_account_number) fd.append("bank_account_number", fields.bank_account_number);
    if (fields.bank_ifsc_code) fd.append("bank_ifsc_code", fields.bank_ifsc_code);
    if (fields.bank_name) fd.append("bank_name", fields.bank_name);
    if (fields.bank_branch !== undefined) {
      fd.append("bank_branch", fields.bank_branch || "");
    }
    if (cancelledCheque) appendFile(fd, "cancelled_cheque", cancelledCheque);
    return this.patchFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_BANK_DETAILS, fd);
  }

  // ── Step: Address Proof ───────────────────────────────────────────────────
  async fetchAddressProof(): Promise<{
    address_proof_type: "electricity_bill" | "rent_agreement" | "property_tax_receipt";
    address_proof_document: string;
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_ADDRESS_PROOF);
  }

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

  async patchAddressProof(
    address_proof_type?:
      | "electricity_bill"
      | "rent_agreement"
      | "property_tax_receipt",
    docFile?: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    if (address_proof_type) fd.append("address_proof_type", address_proof_type);
    if (docFile) appendFile(fd, "address_proof_document", docFile);
    return this.patchFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_ADDRESS_PROOF, fd);
  }

  // ── Step: Store Photos ────────────────────────────────────────────────────
  async fetchStorePhotos(): Promise<{
    store_front: string;
    store_interior: string;
    signature_photo?: string;
  } | null> {
    return this.get(SHOP_ENDPOINTS.ONBOARDING_STEP_STORE_PHOTOS);
  }

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

  async patchStorePhotos(
    frontPhoto?: PickedFile,
    interiorPhoto?: PickedFile,
    signaturePhoto?: PickedFile,
  ): Promise<boolean> {
    const fd = new FormData();
    if (frontPhoto) appendFile(fd, "store_front", frontPhoto);
    if (interiorPhoto) appendFile(fd, "store_interior", interiorPhoto);
    if (signaturePhoto) appendFile(fd, "signature_photo", signaturePhoto);
    return this.patchFormData(SHOP_ENDPOINTS.ONBOARDING_STEP_STORE_PHOTOS, fd);
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
