import { makeAutoObservable } from 'mobx';
import { AIInsight } from '../Models/AIInsight';
import { insightFixtures } from '../Services/index.fixture';

export class DashboardStore {
  todayOrders: number = 42;
  todayRevenue: number = 12840;
  pendingOrders: number = 8;
  deliveredOrders: number = 32;
  activeDeliveryPartners: number = 5;
  averageRating: number = 4.8;
  insights: AIInsight[] = [];

  constructor() {
    this.insights = insightFixtures.map((data) => new AIInsight(data));
    makeAutoObservable(this);
  }

  refreshMetrics() {
    this.todayOrders += Math.floor(Math.random() * 2);
    this.todayRevenue += Math.floor(Math.random() * 300);
    if (Math.random() > 0.6) {
      this.pendingOrders = Math.max(0, this.pendingOrders + (Math.random() > 0.5 ? 1 : -1));
    }
  }

  removeInsight(id: string) {
    const idx = this.insights.findIndex((i) => i.id === id);
    if (idx !== -1) this.insights.splice(idx, 1);
  }
}

export type DashboardStoreType = DashboardStore;
