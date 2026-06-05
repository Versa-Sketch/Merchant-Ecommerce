import { makeAutoObservable } from 'mobx';

export class InventoryAdjustment {
  id: string; productId: string; productName: string; date: string;
  type: 'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment';
  qtyChanged: number; resultingQty: number;

  constructor(data: { id: string; productId: string; productName: string; date: string; type: 'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment'; qtyChanged: number; resultingQty: number }) {
    Object.assign(this, data);
    makeAutoObservable(this);
  }
}

export class LowStockAlert {
  id: string; productId: string; productName: string; currentStock: number; threshold: number; date: string;

  constructor(data: { id: string; productId: string; productName: string; currentStock: number; threshold: number; date: string }) {
    Object.assign(this, data);
    makeAutoObservable(this);
  }
}
