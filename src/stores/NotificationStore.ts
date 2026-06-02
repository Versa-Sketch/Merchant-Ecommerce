import { types } from 'mobx-state-tree';

export const AppNotification = types
  .model('AppNotification', {
    id: types.identifier,
    title: types.string,
    message: types.string,
    type: types.enumeration('NotificationType', [
      'new_order',
      'new_bargain',
      'low_stock',
      'refund_request',
      'support_ticket',
      'new_review',
    ]),
    time: types.string,
    isRead: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    markRead() {
      self.isRead = true;
    },
  }));

export const NotificationStore = types
  .model('NotificationStore', {
    notifications: types.optional(types.array(AppNotification), [
      {
        id: 'NOT-001',
        title: 'New Bargain Request',
        message: 'Amit Saxena offered ₹50/kg for Organic Roma Tomatoes (MRP ₹80).',
        type: 'new_bargain',
        time: '2 mins ago',
        isRead: false,
      },
      {
        id: 'NOT-002',
        title: 'New Order Received',
        message: 'Rahul Verma placed an order ORD-8492 of amount ₹694.',
        type: 'new_order',
        time: '10 mins ago',
        isRead: false,
      },
      {
        id: 'NOT-003',
        title: 'Low Stock Warning',
        message: 'Hass Avocados (2 units) is low on stock. Only 3 packs remaining.',
        type: 'low_stock',
        time: '2 hrs ago',
        isRead: true,
      },
      {
        id: 'NOT-004',
        title: 'Support Ticket #T-4091',
        message: 'Wrong Product complaint filed by customer Meera Nair.',
        type: 'support_ticket',
        time: '3 hrs ago',
        isRead: true,
      },
    ]),
  })
  .views((self) => ({
    get unreadCount() {
      return self.notifications.filter((n) => !n.isRead).length;
    },
  }))
  .actions((self) => ({
    addNotification(notification: {
      title: string;
      message: string;
      type: 'new_order' | 'new_bargain' | 'low_stock' | 'refund_request' | 'support_ticket' | 'new_review';
    }) {
      const id = `NOT-${Date.now()}`;
      self.notifications.unshift({
        id,
        time: 'Just now',
        isRead: false,
        ...notification,
      });
    },
    markAllAsRead() {
      self.notifications.forEach((n) => n.markRead());
    },
    clearAll() {
      self.notifications.clear();
    },
  }));
export type NotificationStoreType = typeof NotificationStore;
export type AppNotificationType = typeof AppNotification;
