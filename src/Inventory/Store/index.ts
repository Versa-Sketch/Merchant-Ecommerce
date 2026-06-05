import { makeAutoObservable } from 'mobx';
import { InventoryAdjustment, LowStockAlert } from '../Models/InventoryModels';
import { adjustmentFixtures, alertFixtures } from '../Services/index.fixture';

export class InventoryStore {
  adjustments: InventoryAdjustment[] = [];
  alerts: LowStockAlert[] = [];

  constructor() {
    this.adjustments = adjustmentFixtures.map((d) => new InventoryAdjustment(d));
    this.alerts = alertFixtures.map((d) => new LowStockAlert(d));
    makeAutoObservable(this);
  }

  recordAdjustment(adj: { productId: string; productName: string; type: 'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment'; qtyChanged: number; resultingQty: number }) {
    const id = `ADJ-${100 + this.adjustments.length + 1}`;
    this.adjustments.unshift(new InventoryAdjustment({ id, date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true }), ...adj }));
  }

  dismissAlert(id: string) {
    const idx = this.alerts.findIndex((a) => a.id === id);
    if (idx !== -1) this.alerts.splice(idx, 1);
  }
}

export type InventoryStoreType = InventoryStore;
