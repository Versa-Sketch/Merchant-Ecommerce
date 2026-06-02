import { types } from 'mobx-state-tree';

export const AIInsight = types.model('AIInsight', {
  id: types.identifier,
  title: types.string,
  message: types.string,
  type: types.enumeration('InsightType', ['warning', 'success', 'info']),
  actionLabel: types.maybe(types.string),
});

export const DashboardStore = types
  .model('DashboardStore', {
    todayOrders: types.optional(types.number, 42),
    todayRevenue: types.optional(types.number, 12840),
    pendingOrders: types.optional(types.number, 8),
    deliveredOrders: types.optional(types.number, 32),
    activeDeliveryPartners: types.optional(types.number, 5),
    averageRating: types.optional(types.number, 4.8),
    insights: types.optional(types.array(AIInsight), [
      {
        id: 'ins-1',
        title: 'Restock Tomatoes',
        message: 'Tomato demand is projected to rise 23% in the next 24 hours. Current stock is low.',
        type: 'warning',
        actionLabel: 'Restock Now',
      },
      {
        id: 'ins-2',
        title: 'Peak Order Hours Inbound',
        message: 'Your store peaks between 6:00 PM and 8:00 PM on Tuesdays. Ensure sufficient delivery staff.',
        type: 'info',
        actionLabel: 'Check Drivers',
      },
      {
        id: 'ins-3',
        title: 'Best Selling Product Today',
        message: 'Organic Avocado is your highest-performing item, generating ₹3,400 in revenue.',
        type: 'success',
      },
      {
        id: 'ins-4',
        title: 'Low Stock Alert',
        message: 'Double Toned Milk (1L) is below threshold. Only 3 units remaining.',
        type: 'warning',
        actionLabel: 'Quick Refill',
      },
    ]),
  })
  .actions((self) => ({
    refreshMetrics() {
      self.todayOrders += Math.floor(Math.random() * 2);
      self.todayRevenue += Math.floor(Math.random() * 300);
      if (Math.random() > 0.6) {
        self.pendingOrders = Math.max(0, self.pendingOrders + (Math.random() > 0.5 ? 1 : -1));
      }
    },
    removeInsight(id: string) {
      const idx = self.insights.findIndex((i) => i.id === id);
      if (idx !== -1) {
        self.insights.splice(idx, 1);
      }
    },
  }));
export type DashboardStoreType = typeof DashboardStore;
