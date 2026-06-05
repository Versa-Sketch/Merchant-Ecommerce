import { makeAutoObservable } from 'mobx';
import { AppNotification, type NotificationType } from '../Models/AppNotification';
import { notificationFixtures } from '../Services/index.fixture';

export class NotificationStore {
  notifications: AppNotification[] = [];

  constructor() {
    this.notifications = notificationFixtures.map((d) => new AppNotification(d));
    makeAutoObservable(this);
  }

  get unreadCount() { return this.notifications.filter((n) => !n.isRead).length; }

  addNotification(notification: { title: string; message: string; type: NotificationType }) {
    this.notifications.unshift(new AppNotification({ id: `NOT-${Date.now()}`, time: 'Just now', isRead: false, ...notification }));
  }

  markAllAsRead() { this.notifications.forEach((n) => n.markRead()); }
  clearAll() { this.notifications = []; }
}

export type NotificationStoreType = NotificationStore;
