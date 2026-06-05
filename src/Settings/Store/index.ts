import { makeAutoObservable } from 'mobx';

export class AuthStore {
  storeName: string = 'FreshMart Hyperlocal';
  ownerName: string = 'Priya Sharma';
  storeType: string = 'Grocery';
  logo: string = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200';
  coverImage: string = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800';
  description: string = 'Providing organic farm-fresh fruits, vegetables, and daily essentials straight to your doorstep.';
  timings: string = '07:00 AM - 10:00 PM';
  deliveryRadius: number = 5.5;
  minimumOrder: number = 150;
  codEnabled: boolean = true;
  surgeFee: number = 20;
  refundPolicy: string = 'Refunds approved for products returned within 24 hours of delivery in original packaging.';
  returnPolicy: string = 'Easy return on spot or within 24 hours for fresh items.';
  cancellationWindow: number = 5;
  isAuthenticated: boolean = true;

  constructor() { makeAutoObservable(this); }

  updateSettings(fields: { storeName?: string; ownerName?: string; description?: string; timings?: string; deliveryRadius?: number; minimumOrder?: number; codEnabled?: boolean; surgeFee?: number; refundPolicy?: string; returnPolicy?: string; cancellationWindow?: number }) {
    Object.assign(this, fields);
  }

  toggleCOD() { this.codEnabled = !this.codEnabled; }
}

export type AuthStoreType = AuthStore;
