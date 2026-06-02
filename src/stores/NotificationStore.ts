import { makeAutoObservable } from 'mobx';

export class AppNotification {
  id: string;
  title: string;
  message: string;
  type:
    | 'new_order'
    | 'new_bargain'
    | 'low_stock'
    | 'refund_request'
    | 'support_ticket'
    | 'new_review';
  time: string;
  isRead: boolean;

  constructor(data: {
    id: string;
    title: string;
    message: string;
    type:
      | 'new_order'
      | 'new_bargain'
      | 'low_stock'
      | 'refund_request'
      | 'support_ticket'
      | 'new_review';
    time: string;
    isRead?: boolean;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type;
    this.time = data.time;
    this.isRead = data.isRead ?? false;
    makeAutoObservable(this);
  }

  markRead() {
    this.isRead = true;
  }
}

export class NotificationStore {
  notifications: AppNotification[] = [];

  constructor() {
    this.notifications = [
      new AppNotification({
        id: 'NOT-001',
        title: 'New Bargain Request',
        message: 'Amit Saxena offered ₹50/kg for Organic Roma Tomatoes (MRP ₹80).',
        type: 'new_bargain',
        time: '2 mins ago',
        isRead: false,
      }),
      new AppNotification({
        id: 'NOT-002',
        title: 'New Order Received',
        message: 'Rahul Verma placed an order ORD-8492 of amount ₹694.',
        type: 'new_order',
        time: '10 mins ago',
        isRead: false,
      }),
      new AppNotification({
        id: 'NOT-003',
        title: 'Low Stock Warning',
        message: 'Hass Avocados (2 units) is low on stock. Only 3 packs remaining.',
        type: 'low_stock',
        time: '2 hrs ago',
        isRead: true,
      }),
      new AppNotification({
        id: 'NOT-004',
        title: 'Support Ticket #T-4091',
        message: 'Wrong Product complaint filed by customer Meera Nair.',
        type: 'support_ticket',
        time: '3 hrs ago',
        isRead: true,
      }),
    ];
    makeAutoObservable(this);
  }

  get unreadCount() {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  addNotification(notification: {
    title: string;
    message: string;
    type: 'new_order' | 'new_bargain' | 'low_stock' | 'refund_request' | 'support_ticket' | 'new_review';
  }) {
    const id = `NOT-${Date.now()}`;
    this.notifications.unshift(
      new AppNotification({
        id,
        time: 'Just now',
        isRead: false,
        ...notification,
      })
    );
  }

  markAllAsRead() {
    this.notifications.forEach((n) => n.markRead());
  }

  clearAll() {
    this.notifications = [];
  }
}

export type NotificationStoreType = NotificationStore;
export type AppNotificationType = AppNotification;
