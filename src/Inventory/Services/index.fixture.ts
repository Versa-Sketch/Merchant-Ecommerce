// Mock data + fixture service for the Inventory module.
// Toggle `USE_FIXTURES` in Common/services/config.ts to switch to InventoryApiService.

import type { ApiResult, PaginatedResult } from '../../Common/services/http';
import { fixtureDelay } from '../../Common/services/config';
import type { IInventoryService } from './index';
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

const SHOP_ID = 'shop-fixture-001';

// Stock summary keyed by the same variant ids used in Products/Services/index.fixture.ts
export const stockFixtures: StockSummaryItem[] = [
  {
    variant_id: 'VAR-1001-1',
    variant_name: '1 kg',
    product_name: 'Organic Roma Tomatoes 1kg',
    unit_symbol: 'kg',
    available_stock: '45',
    reserved_stock: '2',
  },
  {
    variant_id: 'VAR-1002-1',
    variant_name: '2 units',
    product_name: 'Hass Avocados (Pack of 2)',
    unit_symbol: 'pcs',
    available_stock: '3',
    reserved_stock: '0',
  },
  {
    variant_id: 'VAR-1003-1',
    variant_name: '15 Tablets',
    product_name: 'Crocin Pain Relief Tablet (15s)',
    unit_symbol: 'pcs',
    available_stock: '85',
    reserved_stock: '5',
  },
  {
    variant_id: 'VAR-1004-1',
    variant_name: 'Size M',
    product_name: 'Cotton Oversized Tee - Black',
    unit_symbol: 'pcs',
    available_stock: '22',
    reserved_stock: '0',
  },
  {
    variant_id: 'VAR-1004-2',
    variant_name: 'Size L',
    product_name: 'Cotton Oversized Tee - Black',
    unit_symbol: 'pcs',
    available_stock: '10',
    reserved_stock: '0',
  },
  {
    variant_id: 'VAR-1005-1',
    variant_name: 'Default',
    product_name: 'Noise ColorFit Pulse Smartwatch',
    unit_symbol: 'pcs',
    available_stock: '0',
    reserved_stock: '0',
  },
  {
    variant_id: 'VAR-1006-1',
    variant_name: '1 Litre',
    product_name: 'Amul Taaza Toned Milk 1L',
    unit_symbol: 'l',
    available_stock: '30',
    reserved_stock: '4',
  },
];

export const batchFixtures: InventoryBatch[] = [
  {
    id: 'BAT-1',
    shop_id: SHOP_ID,
    variant_id: 'VAR-1001-1',
    variant_name: '1 kg',
    batch_number: 'B-2406-01',
    received_quantity: '50',
    available_quantity: '45',
    reserved_quantity: '2',
    purchase_price: '55.00',
    selling_price: '60.00',
    received_at: '2026-06-01',
    expiry_at: '2026-06-08',
    manufactured_at: '2026-05-30',
    status: 'ACTIVE',
  },
  {
    id: 'BAT-2',
    shop_id: SHOP_ID,
    variant_id: 'VAR-1002-1',
    variant_name: '2 units',
    batch_number: 'B-2406-02',
    received_quantity: '5',
    available_quantity: '3',
    reserved_quantity: '0',
    purchase_price: '260.00',
    selling_price: '299.00',
    received_at: '2026-06-02',
    expiry_at: '2026-06-09',
    manufactured_at: '2026-06-01',
    status: 'ACTIVE',
  },
  {
    id: 'BAT-3',
    shop_id: SHOP_ID,
    variant_id: 'VAR-1003-1',
    variant_name: '15 Tablets',
    batch_number: 'B-2405-10',
    received_quantity: '100',
    available_quantity: '85',
    reserved_quantity: '5',
    purchase_price: '95.00',
    selling_price: '110.00',
    received_at: '2026-05-15',
    expiry_at: '2028-05-15',
    manufactured_at: '2026-05-10',
    status: 'ACTIVE',
  },
  {
    id: 'BAT-4',
    shop_id: SHOP_ID,
    variant_id: 'VAR-1005-1',
    variant_name: 'Default',
    batch_number: 'B-2404-05',
    received_quantity: '10',
    available_quantity: '0',
    reserved_quantity: '0',
    purchase_price: '1500.00',
    selling_price: '1799.00',
    received_at: '2026-04-10',
    expiry_at: null,
    manufactured_at: null,
    status: 'EXHAUSTED',
  },
  {
    id: 'BAT-5',
    shop_id: SHOP_ID,
    variant_id: 'VAR-1006-1',
    variant_name: '1 Litre',
    batch_number: 'B-2406-03',
    received_quantity: '40',
    available_quantity: '30',
    reserved_quantity: '4',
    purchase_price: '58.00',
    selling_price: '64.00',
    received_at: '2026-06-03',
    expiry_at: '2026-06-05',
    manufactured_at: '2026-06-02',
    status: 'ACTIVE',
  },
  {
    id: 'BAT-6',
    shop_id: SHOP_ID,
    variant_id: 'VAR-1004-1',
    variant_name: 'Size M',
    batch_number: 'B-2403-01',
    received_quantity: '25',
    available_quantity: '0',
    reserved_quantity: '0',
    purchase_price: '450.00',
    selling_price: null,
    received_at: '2026-03-01',
    expiry_at: null,
    manufactured_at: null,
    status: 'RECALLED',
  },
];

export const transactionFixtures: InventoryTransaction[] = [
  {
    id: 'TXN-1',
    batch_id: 'BAT-1',
    transaction_type: 'RECEIVE',
    quantity: '50',
    reference_type: null,
    reference_id: null,
    note: 'Initial stock',
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'TXN-2',
    batch_id: 'BAT-1',
    transaction_type: 'SALE',
    quantity: '-5',
    reference_type: 'ORDER',
    reference_id: 'ORD-8492',
    note: null,
    created_at: '2026-06-02T11:30:00Z',
  },
  {
    id: 'TXN-3',
    batch_id: 'BAT-2',
    transaction_type: 'RECEIVE',
    quantity: '5',
    reference_type: null,
    reference_id: null,
    note: 'Initial stock',
    created_at: '2026-06-02T09:00:00Z',
  },
  {
    id: 'TXN-4',
    batch_id: 'BAT-2',
    transaction_type: 'ADJUSTMENT',
    quantity: '-2',
    reference_type: null,
    reference_id: null,
    note: 'Damaged during transit',
    created_at: '2026-06-03T16:15:00Z',
  },
  {
    id: 'TXN-5',
    batch_id: 'BAT-4',
    transaction_type: 'SALE',
    quantity: '-10',
    reference_type: 'ORDER',
    reference_id: 'ORD-8401',
    note: null,
    created_at: '2026-05-30T14:00:00Z',
  },
  {
    id: 'TXN-6',
    batch_id: 'BAT-5',
    transaction_type: 'RECEIVE',
    quantity: '40',
    reference_type: null,
    reference_id: null,
    note: 'Stock in',
    created_at: '2026-06-03T08:00:00Z',
  },
  {
    id: 'TXN-7',
    batch_id: 'BAT-5',
    transaction_type: 'SALE',
    quantity: '-6',
    reference_type: 'ORDER',
    reference_id: 'ORD-8488',
    note: null,
    created_at: '2026-06-04T13:00:00Z',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let nextBatchSeq = batchFixtures.length + 1;
let nextTxnSeq = transactionFixtures.length + 1;

function ok<T>(data: T, message: string | null = null): ApiResult<T> {
  return { ok: true, status: 200, data, message };
}

function notFound<T>(message: string): ApiResult<T> {
  return { ok: false, status: 404, message } as ApiResult<T>;
}

// ── Fixture service ───────────────────────────────────────────────────────────

export class InventoryFixtureService implements IInventoryService {
  async listBatches(_shopId: string, filters?: BatchFilters): Promise<ApiResult<InventoryBatch[]>> {
    let result = batchFixtures;
    if (filters?.variant_id) result = result.filter((b) => b.variant_id === filters.variant_id);
    if (filters?.status) result = result.filter((b) => b.status === filters.status);
    return fixtureDelay(ok(result));
  }

  async getBatch(_shopId: string, batchId: string): Promise<ApiResult<InventoryBatch>> {
    const batch = batchFixtures.find((b) => b.id === batchId);
    if (!batch) return fixtureDelay(notFound('Batch not found.'));
    return fixtureDelay(ok(batch));
  }

  async createBatch(_shopId: string, input: CreateBatchInput): Promise<ApiResult<InventoryBatch>> {
    const stock = stockFixtures.find((s) => s.variant_id === input.variant_id);
    const batch: InventoryBatch = {
      id: `BAT-${nextBatchSeq++}`,
      shop_id: SHOP_ID,
      variant_id: input.variant_id,
      variant_name: stock?.variant_name ?? input.variant_id,
      batch_number: input.batch_number ?? null,
      received_quantity: String(input.received_quantity),
      available_quantity: String(input.received_quantity),
      reserved_quantity: '0',
      purchase_price: input.purchase_price.toFixed(2),
      selling_price: input.selling_price != null ? input.selling_price.toFixed(2) : null,
      received_at: input.received_at ?? new Date().toISOString().slice(0, 10),
      expiry_at: input.expiry_at ?? null,
      manufactured_at: input.manufactured_at ?? null,
      status: 'ACTIVE',
    };
    batchFixtures.unshift(batch);

    if (stock) {
      stock.available_stock = String(Number(stock.available_stock) + input.received_quantity);
    }

    transactionFixtures.unshift({
      id: `TXN-${nextTxnSeq++}`,
      batch_id: batch.id,
      transaction_type: 'RECEIVE',
      quantity: batch.received_quantity,
      reference_type: null,
      reference_id: null,
      note: 'Batch created',
      created_at: new Date().toISOString(),
    });

    return fixtureDelay(ok(batch, 'Inventory batch created successfully.'));
  }

  async updateBatch(
    _shopId: string,
    batchId: string,
    patch: UpdateBatchInput,
  ): Promise<ApiResult<InventoryBatch>> {
    const batch = batchFixtures.find((b) => b.id === batchId);
    if (!batch) return fixtureDelay(notFound('Batch not found.'));
    if (patch.status !== undefined) batch.status = patch.status;
    if (patch.selling_price !== undefined) batch.selling_price = patch.selling_price.toFixed(2);
    return fixtureDelay(ok(batch, 'Batch updated.'));
  }

  async getStockSummary(
    _shopId: string,
    params: StockListParams = {},
  ): Promise<ApiResult<PaginatedResult<StockSummaryItem>>> {
    let list = stockFixtures;
    if (params.search) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (s) => s.product_name.toLowerCase().includes(q) || s.variant_name.toLowerCase().includes(q),
      );
    }

    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 20;
    const start = (page - 1) * pageSize;
    const results = list.slice(start, start + pageSize);

    return fixtureDelay(
      ok({
        count: list.length,
        next: start + pageSize < list.length ? String(page + 1) : null,
        previous: page > 1 ? String(page - 1) : null,
        results,
      }),
    );
  }

  async adjustStock(_shopId: string, input: AdjustStockInput): Promise<ApiResult<InventoryBatch>> {
    const batch = batchFixtures.find((b) => b.id === input.batch_id);
    if (!batch) return fixtureDelay(notFound('Batch not found.'));

    batch.available_quantity = String(Number(batch.available_quantity) + input.delta);

    const stock = stockFixtures.find((s) => s.variant_id === batch.variant_id);
    if (stock) stock.available_stock = String(Number(stock.available_stock) + input.delta);

    transactionFixtures.unshift({
      id: `TXN-${nextTxnSeq++}`,
      batch_id: batch.id,
      transaction_type: 'ADJUSTMENT',
      quantity: String(input.delta),
      reference_type: null,
      reference_id: null,
      note: input.note ?? null,
      created_at: new Date().toISOString(),
    });

    return fixtureDelay(ok(batch, 'Stock adjusted successfully.'));
  }

  async listTransactions(
    _shopId: string,
    batchId?: string,
  ): Promise<ApiResult<InventoryTransaction[]>> {
    const result = batchId
      ? transactionFixtures.filter((t) => t.batch_id === batchId)
      : transactionFixtures;
    return fixtureDelay(ok(result));
  }
}
