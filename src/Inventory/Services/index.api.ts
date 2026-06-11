import { apiRequest, buildQuery, type ApiResult } from '../../Common/services/http';
import { INVENTORY_ENDPOINTS } from '../Constants/api';
import type { IInventoryService } from './index';
import type {
  AdjustStockInput,
  BatchFilters,
  CreateBatchInput,
  InventoryBatch,
  InventoryTransaction,
  StockSummaryItem,
  UpdateBatchInput,
} from '../types/domain';

export interface TokenProvider {
  accessToken: string | null;
}

export class InventoryApiService implements IInventoryService {
  constructor(private session: TokenProvider) {}

  private get token() {
    return this.session.accessToken;
  }

  listBatches(shopId: string, filters?: BatchFilters): Promise<ApiResult<InventoryBatch[]>> {
    const qs = buildQuery({ variant_id: filters?.variant_id, status: filters?.status });
    return apiRequest<InventoryBatch[]>(`${INVENTORY_ENDPOINTS.BATCHES(shopId)}${qs}`, {
      token: this.token,
    });
  }

  getBatch(shopId: string, batchId: string): Promise<ApiResult<InventoryBatch>> {
    return apiRequest<InventoryBatch>(INVENTORY_ENDPOINTS.BATCH(shopId, batchId), {
      token: this.token,
    });
  }

  createBatch(shopId: string, input: CreateBatchInput): Promise<ApiResult<InventoryBatch>> {
    return apiRequest<InventoryBatch>(INVENTORY_ENDPOINTS.BATCHES(shopId), {
      method: 'POST',
      token: this.token,
      body: input,
    });
  }

  updateBatch(
    shopId: string,
    batchId: string,
    patch: UpdateBatchInput,
  ): Promise<ApiResult<InventoryBatch>> {
    return apiRequest<InventoryBatch>(INVENTORY_ENDPOINTS.BATCH(shopId, batchId), {
      method: 'PATCH',
      token: this.token,
      body: patch,
    });
  }

  getStockSummary(shopId: string): Promise<ApiResult<StockSummaryItem[]>> {
    return apiRequest<StockSummaryItem[]>(INVENTORY_ENDPOINTS.STOCK(shopId), {
      token: this.token,
    });
  }

  adjustStock(shopId: string, input: AdjustStockInput): Promise<ApiResult<InventoryBatch>> {
    return apiRequest<InventoryBatch>(INVENTORY_ENDPOINTS.ADJUST(shopId), {
      method: 'POST',
      token: this.token,
      body: input,
    });
  }

  listTransactions(shopId: string, batchId?: string): Promise<ApiResult<InventoryTransaction[]>> {
    const qs = buildQuery({ batch: batchId });
    return apiRequest<InventoryTransaction[]>(`${INVENTORY_ENDPOINTS.TRANSACTIONS(shopId)}${qs}`, {
      token: this.token,
    });
  }
}
