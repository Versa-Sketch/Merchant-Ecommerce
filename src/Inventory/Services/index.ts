import type { ApiResult } from '../../Common/services/http';
import type {
  AdjustStockInput,
  BatchFilters,
  CreateBatchInput,
  InventoryBatch,
  InventoryTransaction,
  StockSummaryItem,
  UpdateBatchInput,
} from '../types/domain';

export interface IInventoryService {
  listBatches(shopId: string, filters?: BatchFilters): Promise<ApiResult<InventoryBatch[]>>;
  getBatch(shopId: string, batchId: string): Promise<ApiResult<InventoryBatch>>;
  createBatch(shopId: string, input: CreateBatchInput): Promise<ApiResult<InventoryBatch>>;
  updateBatch(
    shopId: string,
    batchId: string,
    patch: UpdateBatchInput,
  ): Promise<ApiResult<InventoryBatch>>;
  getStockSummary(shopId: string): Promise<ApiResult<StockSummaryItem[]>>;
  adjustStock(shopId: string, input: AdjustStockInput): Promise<ApiResult<InventoryBatch>>;
  listTransactions(shopId: string, batchId?: string): Promise<ApiResult<InventoryTransaction[]>>;
}
