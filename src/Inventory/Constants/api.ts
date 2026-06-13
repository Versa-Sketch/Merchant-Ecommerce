import { API_BASE } from "../../Auth/Constants/api";

// Shop Owner inventory endpoints — all are scoped by shop_id
export const INVENTORY_ENDPOINTS = {
  BATCHES: (shopId: string) => `${API_BASE}/inventory/${shopId}/batches/`,
  BATCH: (shopId: string, batchId: string) =>
    `${API_BASE}/inventory/${shopId}/batches/${batchId}/`,
  STOCK: (shopId: string) => `${API_BASE}/inventory/${shopId}/stock/`,
  ADJUST: (shopId: string) => `${API_BASE}/inventory/${shopId}/adjust/`,
  TRANSACTIONS: (shopId: string) =>
    `${API_BASE}/inventory/${shopId}/transactions/`,
} as const;
