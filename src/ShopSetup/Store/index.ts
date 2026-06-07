import { makeAutoObservable, runInAction } from "mobx";
import { SHOP_ENDPOINTS } from "../../Auth/Constants/api";
import type { SessionStore } from "../../Auth/Store";

export type ShopSetupState = "idle" | "loading" | "submitting" | "error";

export interface ShopType {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
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

export class ShopSetupStore {
  availableTypes: ShopType[] = [];
  myTypes: ShopType[] = [];
  selectedIds: string[] = [];
  state: ShopSetupState = "idle";
  error: string | null = null;
  myTypesFetched: boolean = false;

  private sessionStore: SessionStore;

  constructor(sessionStore: SessionStore) {
    this.sessionStore = sessionStore;
    makeAutoObservable(this);
  }

  private get authHeader() {
    return { Authorization: `Bearer ${this.sessionStore.accessToken}` };
  }

  get hasChosenTypes(): boolean {
    return this.myTypes.length > 0;
  }

  toggleSelection(id: string) {
    this.selectedIds = this.selectedIds.includes(id)
      ? this.selectedIds.filter((x) => x !== id)
      : [...this.selectedIds, id];
  }

  // GET /shop-owner/shop-types/ — browse all active shop types
  async fetchAvailableTypes(): Promise<boolean> {
    runInAction(() => {
      this.state = "loading";
      this.error = null;
    });
    let res: Response;
    try {
      res = await fetch(SHOP_ENDPOINTS.SHOP_TYPES_BROWSE, {
        headers: this.authHeader,
      });
    } catch {
      runInAction(() => {
        this.state = "error";
        this.error = "Unable to connect. Please check your internet connection and try again.";
      });
      return false;
    }
    const body = await parseJSON(res);
    if (res.ok) {
      runInAction(() => {
        this.availableTypes = (body?.data as ShopType[]) ?? [];
        this.state = "idle";
      });
      return true;
    }
    const msg =
      (body?.message as string) ?? "Something went wrong. Please try again.";
    runInAction(() => {
      this.state = "error";
      this.error = msg;
    });
    return false;
  }

  // GET /shop-owner/my-shop/shop-types/ — types already assigned to my shop
  async fetchMyShopTypes(): Promise<boolean> {
    let res: Response;
    try {
      res = await fetch(SHOP_ENDPOINTS.MY_SHOP_TYPES, {
        headers: this.authHeader,
      });
    } catch {
      return false;
    }
    const body = await parseJSON(res);
    if (res.ok) {
      const types = (body?.data as ShopType[]) ?? [];
      runInAction(() => {
        this.myTypes = types;
        this.selectedIds = types.map((t) => t.id);
        this.myTypesFetched = true;
      });
      return true;
    }
    return false;
  }

  // POST /shop-owner/my-shop/shop-types/ — assign chosen types (append-only)
  async assignShopTypes(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;

    runInAction(() => {
      this.state = "submitting";
      this.error = null;
    });

    let res: Response;
    try {
      res = await fetch(SHOP_ENDPOINTS.MY_SHOP_TYPES, {
        method: "POST",
        headers: { ...this.authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ shop_type_ids: ids }),
      });
    } catch {
      runInAction(() => {
        this.state = "error";
        this.error = "Unable to connect. Please check your internet connection and try again.";
      });
      return false;
    }

    const body = await parseJSON(res);

    // 409 — type(s) already assigned; treat as benign, just refresh
    if (res.status === 409) {
      await this.fetchMyShopTypes();
      runInAction(() => {
        this.state = "idle";
      });
      return true;
    }

    if (res.ok) {
      await this.fetchMyShopTypes();
      runInAction(() => {
        this.state = "idle";
      });
      return true;
    }

    const msg =
      (body?.message as string) ?? "Something went wrong. Please try again.";
    runInAction(() => {
      this.state = "error";
      this.error = msg;
    });
    return false;
  }

  // DELETE /shop-owner/my-shop/shop-types/{id}/remove/
  async removeShopType(id: string): Promise<boolean> {
    runInAction(() => {
      this.state = "submitting";
      this.error = null;
    });

    let res: Response;
    try {
      res = await fetch(`${SHOP_ENDPOINTS.MY_SHOP_TYPES}${id}/remove/`, {
        method: "DELETE",
        headers: this.authHeader,
      });
    } catch {
      runInAction(() => {
        this.state = "error";
        this.error = "Unable to connect. Please check your internet connection and try again.";
      });
      return false;
    }

    // 404 — already not assigned; treat as already-removed
    if (res.ok || res.status === 404) {
      await this.fetchMyShopTypes();
      runInAction(() => {
        this.state = "idle";
      });
      return true;
    }

    const body = await parseJSON(res);
    const msg =
      (body?.message as string) ?? "Something went wrong. Please try again.";
    runInAction(() => {
      this.state = "error";
      this.error = msg;
    });
    return false;
  }

  resetState() {
    this.state = "idle";
    this.error = null;
  }
}
