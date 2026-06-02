import { types } from 'mobx-state-tree';

export const InventoryAdjustment = types.model('InventoryAdjustment', {
  id: types.identifier,
  productId: types.string,
  productName: types.string,
  date: types.string,
  type: types.enumeration('AdjustmentType', ['Stock In', 'Damaged', 'Returned', 'Audit Adjustment']),
  qtyChanged: types.number,
  resultingQty: types.number,
});

export const LowStockAlert = types.model('LowStockAlert', {
  id: types.identifier,
  productId: types.string,
  productName: types.string,
  currentStock: types.number,
  threshold: types.number,
  date: types.string,
});

export const InventoryStore = types
  .model('InventoryStore', {
    adjustments: types.optional(types.array(InventoryAdjustment), [
      {
        id: 'ADJ-101',
        productId: 'PRD-1001',
        productName: 'Organic Roma Tomatoes 1kg',
        date: '2026-06-02 11:30 AM',
        type: 'Stock In',
        qtyChanged: 20,
        resultingQty: 45,
      },
      {
        id: 'ADJ-102',
        productId: 'PRD-1002',
        productName: 'Hass Avocados (2 units)',
        date: '2026-06-01 04:15 PM',
        type: 'Audit Adjustment',
        qtyChanged: -2,
        resultingQty: 3,
      },
      {
        id: 'ADJ-103',
        productId: 'PRD-1005',
        productName: 'Noise ColorFit Pulse Smartwatch',
        date: '2026-05-30 02:00 PM',
        type: 'Damaged',
        qtyChanged: -1,
        resultingQty: 0,
      },
    ]),
    alerts: types.optional(types.array(LowStockAlert), [
      {
        id: 'ALT-201',
        productId: 'PRD-1002',
        productName: 'Hass Avocados (2 units)',
        currentStock: 3,
        threshold: 10,
        date: '2 hrs ago',
      },
      {
        id: 'ALT-202',
        productId: 'PRD-1005',
        productName: 'Noise ColorFit Pulse Smartwatch',
        currentStock: 0,
        threshold: 5,
        date: 'Yesterday',
      },
    ]),
  })
  .actions((self) => ({
    recordAdjustment(adj: {
      productId: string;
      productName: string;
      type: 'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment';
      qtyChanged: number;
      resultingQty: number;
    }) {
      const id = `ADJ-${100 + self.adjustments.length + 1}`;
      self.adjustments.unshift({
        id,
        date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        ...adj,
      });
    },
    dismissAlert(id: string) {
      const idx = self.alerts.findIndex((a) => a.id === id);
      if (idx !== -1) {
        self.alerts.splice(idx, 1);
      }
    },
  }));
export type InventoryStoreType = typeof InventoryStore;
