// Inventory domain types — mirror the Inventory API swagger definitions.

export type BatchStatus = 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'RECALLED';

export const BATCH_STATUSES: BatchStatus[] = ['ACTIVE', 'EXPIRED', 'EXHAUSTED', 'RECALLED'];

export interface InventoryBatch {
  id: string;
  shop_id: string;
  variant_id: string;
  variant_name: string;
  batch_number: string | null;
  received_quantity: string;
  available_quantity: string;
  reserved_quantity: string;
  purchase_price: string;
  selling_price: string | null;
  received_at: string; // date
  expiry_at: string | null; // date
  manufactured_at: string | null; // date
  status: BatchStatus;
}

export interface StockSummaryItem {
  variant_id: string;
  variant_name: string;
  product_name: string;
  unit_symbol: string;
  available_stock: string;
  reserved_stock: string;
}

export interface InventoryTransaction {
  id: string;
  batch_id: string;
  transaction_type: string; // e.g. SALE, ADJUSTMENT, RECEIVE
  quantity: string; // signed
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_at: string; // date-time
}

// ── Request payloads ────────────────────────────────────────────────────────

export interface CreateBatchInput {
  variant_id: string;
  received_quantity: number;
  purchase_price: number;
  selling_price?: number;
  batch_number?: string;
  manufactured_at?: string; // YYYY-MM-DD
  received_at?: string; // YYYY-MM-DD
  expiry_at?: string; // YYYY-MM-DD — auto-derived for perishables when omitted
}

export interface UpdateBatchInput {
  status?: BatchStatus;
  selling_price?: number;
}

export interface AdjustStockInput {
  batch_id: string;
  delta: number; // positive adds stock, negative reduces
  note?: string;
}

export interface BatchFilters {
  variant_id?: string;
  status?: BatchStatus;
}

export interface StockListParams {
  page?: number;
  page_size?: number;
  search?: string;
}
