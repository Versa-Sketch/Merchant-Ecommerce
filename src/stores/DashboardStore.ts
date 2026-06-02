import { makeAutoObservable } from 'mobx';

export class AIInsight {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  actionLabel?: string;

  constructor(data: { id: string; title: string; message: string; type: 'warning' | 'success' | 'info'; actionLabel?: string }) {
    this.id = data.id;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type;
    this.actionLabel = data.actionLabel;
    makeAutoObservable(this);
  }
}

export class DashboardStore {
  todayOrders: number = 42;
  todayRevenue: number = 12840;
  pendingOrders: number = 8;
  deliveredOrders: number = 32;
  activeDeliveryPartners: number = 5;
  averageRating: number = 4.8;
  insights: AIInsight[] = [];

  constructor() {
    this.insights = [
      new AIInsight({
        id: 'ins-1',
        title: 'Restock Tomatoes',
        message: 'Tomato demand is projected to rise 23% in the next 24 hours. Current stock is low.',
        type: 'warning',
        actionLabel: 'Restock Now',
      }),
      new AIInsight({
        id: 'ins-2',
        title: 'Peak Order Hours Inbound',
        message: 'Your store peaks between 6:00 PM and 8:00 PM on Tuesdays. Ensure sufficient delivery staff.',
        type: 'info',
        actionLabel: 'Check Drivers',
      }),
      new AIInsight({
        id: 'ins-3',
        title: 'Best Selling Product Today',
        message: 'Organic Avocado is your highest-performing item, generating ₹3,400 in revenue.',
        type: 'success',
      }),
      new AIInsight({
        id: 'ins-4',
        title: 'Low Stock Alert',
        message: 'Double Toned Milk (1L) is below threshold. Only 3 units remaining.',
        type: 'warning',
        actionLabel: 'Quick Refill',
      }),
    ];
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
    if (idx !== -1) {
      this.insights.splice(idx, 1);
    }
  }
}

export type DashboardStoreType = DashboardStore;
