import { makeAutoObservable, runInAction } from "mobx";
import type { SessionStore } from "../../Auth/Store";
import { USE_FIXTURES } from "../../Common/services/config";
import { resolveShopId } from "../../Common/services/shopId";
import type { IInventoryService } from "../Services";
import { InventoryApiService } from "../Services/index.api";
import { InventoryFixtureService } from "../Services/index.fixture";
import type {
  AdjustStockInput,
  BatchFilters,
  BatchStatus,
  CreateBatchInput,
  InventoryBatch,
  InventoryTransaction,
  StockSummaryItem,
  UpdateBatchInput,
} from "../types/domain";

const STOCK_PAGE_SIZE = 20;

export type LoadState = "idle" | "loading" | "error";

export interface MutationResult {
  ok: boolean;
  message: string;
}

const SHOP_ID_ERROR =
  "Couldn't determine your shop. Please make sure onboarding is complete, then retry.";

export class InventoryStore {
  shopId: string | null = null;
  shopIdState: LoadState = "idle";

  // Stock overview — GET /inventory/{shop_id}/stock/
  stock: StockSummaryItem[] = [];
  stockState: LoadState = "idle";
  stockError: string | null = null;
  stockPage = 1;
  stockHasMore = true;
  stockTotalCount = 0;
  stockLoadingMore = false;
  stockSearch = "";

  // Batches — GET /inventory/{shop_id}/batches/
  batches: InventoryBatch[] = [];
  batchesState: LoadState = "idle";
  batchesError: string | null = null;
  batchFilters: BatchFilters = {};

  // Transactions — GET /inventory/{shop_id}/transactions/
  transactions: InventoryTransaction[] = [];
  transactionsState: LoadState = "idle";
  transactionsError: string | null = null;
  transactionBatchFilter: string | null = null;

  saving = false;

  private session: SessionStore;
  private service: IInventoryService;

  constructor(session: SessionStore, service?: IInventoryService) {
    this.session = session;
    this.service =
      service ??
      (USE_FIXTURES
        ? new InventoryFixtureService()
        : new InventoryApiService(session));
    makeAutoObservable(this);
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  get lowStockItems(): StockSummaryItem[] {
    return this.stock.filter((s) => {
      const qty = Number(s.available_stock);
      return Number.isFinite(qty) && qty > 0 && qty <= 5;
    });
  }

  get outOfStockItems(): StockSummaryItem[] {
    return this.stock.filter((s) => Number(s.available_stock) <= 0);
  }

  /** Transactions sorted newest first. */
  get sortedTransactions(): InventoryTransaction[] {
    return [...this.transactions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  batchById(batchId: string): InventoryBatch | undefined {
    return this.batches.find((b) => b.id === batchId);
  }

  /** Lookup map of variant_id -> stock summary (carries product/variant names + unit). */
  get stockByVariantId(): Record<string, StockSummaryItem> {
    const map: Record<string, StockSummaryItem> = {};
    this.stock.forEach((s) => {
      map[s.variant_id] = s;
    });
    return map;
  }

  /** Variant picker options sourced from the stock summary (only API that lists variants). */
  get variantOptions() {
    return this.stock.map((s) => ({
      id: s.variant_id,
      label: `${s.product_name} — ${s.variant_name}`,
      sublabel: `${s.available_stock} ${s.unit_symbol} available`,
    }));
  }

  /** Batch picker options for transaction filters / adjustments. */
  get batchOptions() {
    return this.batches.map((b) => ({
      id: b.id,
      label: `${this.productLabelForVariant(b.variant_id)}${b.batch_number ? ` · ${b.batch_number}` : ""}`,
      sublabel: `${b.status} · ${b.available_quantity} available`,
    }));
  }

  productLabelForVariant(variantId: string): string {
    const s = this.stockByVariantId[variantId];
    return s ? `${s.product_name} — ${s.variant_name}` : variantId;
  }

  // ── Shop resolution ───────────────────────────────────────────────────────

  async ensureShopId(): Promise<string | null> {
    if (this.shopId) return this.shopId;
    if (USE_FIXTURES) {
      runInAction(() => {
        this.shopId = "shop-fixture-001";
        this.shopIdState = "idle";
      });
      return this.shopId;
    }

    if (this.session.user?.shop_id) {
      runInAction(() => {
        this.shopId = this.session.user!.shop_id;
        this.shopIdState = "idle";
      });
      return this.shopId;
    }
    runInAction(() => {
      this.shopIdState = "loading";
    });
    const id = await resolveShopId(this.session.accessToken);
    runInAction(() => {
      this.shopId = id;
      this.shopIdState = id ? "idle" : "error";
    });
    return id;
  }

  // ── Stock overview ────────────────────────────────────────────────────────

  async fetchStock(search?: string): Promise<void> {
    if (search !== undefined) this.stockSearch = search;
    runInAction(() => {
      this.stockState = "loading";
      this.stockError = null;
    });
    const shopId = await this.ensureShopId();
    if (!shopId) {
      runInAction(() => {
        this.stockState = "error";
        this.stockError = SHOP_ID_ERROR;
      });
      return;
    }
    const res = await this.service.getStockSummary(shopId, {
      page: 1,
      page_size: STOCK_PAGE_SIZE,
      search: this.stockSearch || undefined,
    });
    runInAction(() => {
      if (res.ok) {
        this.stock = res.data?.results ?? [];
        this.stockPage = 1;
        this.stockHasMore = !!res.data?.next;
        this.stockTotalCount = res.data?.count ?? 0;
        this.stockState = "idle";
      } else {
        this.stockState = "error";
        this.stockError = res.message;
      }
    });
  }

  async loadMoreStock(): Promise<void> {
    if (this.stockLoadingMore || !this.stockHasMore || this.stockState === "loading") return;
    runInAction(() => {
      this.stockLoadingMore = true;
    });
    const shopId = await this.ensureShopId();
    if (!shopId) {
      runInAction(() => {
        this.stockLoadingMore = false;
      });
      return;
    }
    const nextPage = this.stockPage + 1;
    const res = await this.service.getStockSummary(shopId, {
      page: nextPage,
      page_size: STOCK_PAGE_SIZE,
      search: this.stockSearch || undefined,
    });
    runInAction(() => {
      this.stockLoadingMore = false;
      if (res.ok) {
        this.stock = [...this.stock, ...(res.data?.results ?? [])];
        this.stockPage = nextPage;
        this.stockHasMore = !!res.data?.next;
        this.stockTotalCount = res.data?.count ?? this.stockTotalCount;
      }
    });
  }

  // ── Batches ───────────────────────────────────────────────────────────────

  setBatchFilters(filters: BatchFilters) {
    this.batchFilters = filters;
    void this.fetchBatches();
  }

  async fetchBatches(): Promise<void> {
    runInAction(() => {
      this.batchesState = "loading";
      this.batchesError = null;
    });
    const shopId = await this.ensureShopId();
    if (!shopId) {
      runInAction(() => {
        this.batchesState = "error";
        this.batchesError = SHOP_ID_ERROR;
      });
      return;
    }
    const res = await this.service.listBatches(shopId, this.batchFilters);
    runInAction(() => {
      if (res.ok) {
        this.batches = res.data ?? [];
        this.batchesState = "idle";
      } else {
        this.batchesState = "error";
        this.batchesError = res.message;
      }
    });
  }

  async createBatch(input: CreateBatchInput): Promise<MutationResult> {
    const shopId = await this.ensureShopId();
    if (!shopId) return { ok: false, message: SHOP_ID_ERROR };
    runInAction(() => {
      this.saving = true;
    });
    const res = await this.service.createBatch(shopId, input);
    runInAction(() => {
      this.saving = false;
    });
    if (res.ok) {
      void this.fetchBatches();
      void this.fetchStock();
      return {
        ok: true,
        message: res.message ?? "Inventory batch created successfully.",
      };
    }
    return { ok: false, message: res.message };
  }

  async updateBatch(
    batchId: string,
    patch: UpdateBatchInput,
  ): Promise<MutationResult> {
    const shopId = await this.ensureShopId();
    if (!shopId) return { ok: false, message: SHOP_ID_ERROR };
    runInAction(() => {
      this.saving = true;
    });
    const res = await this.service.updateBatch(shopId, batchId, patch);
    runInAction(() => {
      this.saving = false;
      if (res.ok && res.data) {
        const idx = this.batches.findIndex((b) => b.id === batchId);
        if (idx !== -1) this.batches[idx] = res.data;
      }
    });
    if (res.ok) {
      if (patch.status) void this.fetchStock(); // status changes affect availability
      return { ok: true, message: res.message ?? "Batch updated." };
    }
    return { ok: false, message: res.message };
  }

  async adjustStock(input: AdjustStockInput): Promise<MutationResult> {
    const shopId = await this.ensureShopId();
    if (!shopId) return { ok: false, message: SHOP_ID_ERROR };
    runInAction(() => {
      this.saving = true;
    });
    const res = await this.service.adjustStock(shopId, input);
    runInAction(() => {
      this.saving = false;
      if (res.ok && res.data) {
        const idx = this.batches.findIndex((b) => b.id === input.batch_id);
        if (idx !== -1) this.batches[idx] = res.data;
      }
    });
    if (res.ok) {
      void this.fetchStock();
      void this.fetchTransactions();
      return {
        ok: true,
        message: res.message ?? "Stock adjusted successfully.",
      };
    }
    return { ok: false, message: res.message };
  }

  // ── Transactions ──────────────────────────────────────────────────────────

  setTransactionBatchFilter(batchId: string | null) {
    this.transactionBatchFilter = batchId;
    void this.fetchTransactions();
  }

  async fetchTransactions(): Promise<void> {
    runInAction(() => {
      this.transactionsState = "loading";
      this.transactionsError = null;
    });
    const shopId = await this.ensureShopId();
    if (!shopId) {
      runInAction(() => {
        this.transactionsState = "error";
        this.transactionsError = SHOP_ID_ERROR;
      });
      return;
    }
    const res = await this.service.listTransactions(
      shopId,
      this.transactionBatchFilter ?? undefined,
    );
    runInAction(() => {
      if (res.ok) {
        this.transactions = res.data ?? [];
        this.transactionsState = "idle";
      } else {
        this.transactionsState = "error";
        this.transactionsError = res.message;
      }
    });
  }
}

export type InventoryStoreType = InventoryStore;
export type { BatchStatus };
