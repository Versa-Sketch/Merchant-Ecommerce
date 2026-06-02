import { makeAutoObservable } from 'mobx';

export class InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: 'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment';
  qtyChanged: number;
  resultingQty: number;

  constructor(data: {
    id: string;
    productId: string;
    productName: string;
    date: string;
    type: 'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment';
    qtyChanged: number;
    resultingQty: number;
  }) {
    this.id = data.id;
    this.productId = data.productId;
    this.productName = data.productName;
    this.date = data.date;
    this.type = data.type;
    this.qtyChanged = data.qtyChanged;
    this.resultingQty = data.resultingQty;
    makeAutoObservable(this);
  }
}

export class LowStockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  date: string;

  constructor(data: {
    id: string;
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
    date: string;
  }) {
    this.id = data.id;
    this.productId = data.productId;
    this.productName = data.productName;
    this.currentStock = data.currentStock;
    this.threshold = data.threshold;
    this.date = data.date;
    makeAutoObservable(this);
  }
}

export class InventoryStore {
  adjustments: InventoryAdjustment[] = [];
  alerts: LowStockAlert[] = [];

  constructor() {
    this.adjustments = [
      new InventoryAdjustment({
        id: 'ADJ-101',
        productId: 'PRD-1001',
        productName: 'Organic Roma Tomatoes 1kg',
        date: '2026-06-02 11:30 AM',
        type: 'Stock In',
        qtyChanged: 20,
        resultingQty: 45,
      }),
      new InventoryAdjustment({
        id: 'ADJ-102',
        productId: 'PRD-1002',
        productName: 'Hass Avocados (2 units)',
        date: '2026-06-01 04:15 PM',
        type: 'Audit Adjustment',
        qtyChanged: -2,
        resultingQty: 3,
      }),
      new InventoryAdjustment({
        id: 'ADJ-103',
        productId: 'PRD-1005',
        productName: 'Noise ColorFit Pulse Smartwatch',
        date: '2026-05-30 02:00 PM',
        type: 'Damaged',
        qtyChanged: -1,
        resultingQty: 0,
      }),
    ];
    this.alerts = [
      new LowStockAlert({
        id: 'ALT-201',
        productId: 'PRD-1002',
        productName: 'Hass Avocados (2 units)',
        currentStock: 3,
        threshold: 10,
        date: '2 hrs ago',
      }),
      new LowStockAlert({
        id: 'ALT-202',
        productId: 'PRD-1005',
        productName: 'Noise ColorFit Pulse Smartwatch',
        currentStock: 0,
        threshold: 5,
        date: 'Yesterday',
      }),
    ];
    makeAutoObservable(this);
  }

  recordAdjustment(adj: {
    productId: string;
    productName: string;
    type: 'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment';
    qtyChanged: number;
    resultingQty: number;
  }) {
    const id = `ADJ-${100 + this.adjustments.length + 1}`;
    this.adjustments.unshift(
      new InventoryAdjustment({
        id,
        date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        ...adj,
      })
    );
  }

  dismissAlert(id: string) {
    const idx = this.alerts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.alerts.splice(idx, 1);
    }
  }
}

export type InventoryStoreType = InventoryStore;
