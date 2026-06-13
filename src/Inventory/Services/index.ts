import type { ApiResult, PaginatedResult } from '../../Common/services/http';
import type {
  AdjustStockInput,
  BatchFilters,
  CreateBatchInput,
  InventoryBatch,
  InventoryTransaction,
  StockListParams,
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
  getStockSummary(
    shopId: string,
    params?: StockListParams,
  ): Promise<ApiResult<PaginatedResult<StockSummaryItem>>>;
  adjustStock(shopId: string, input: AdjustStockInput): Promise<ApiResult<InventoryBatch>>;
  listTransactions(shopId: string, batchId?: string): Promise<ApiResult<InventoryTransaction[]>>;
}
