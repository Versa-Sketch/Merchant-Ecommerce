import { makeAutoObservable } from 'mobx';

export type NotificationType = 'new_order' | 'new_bargain' | 'low_stock' | 'refund_request' | 'support_ticket' | 'new_review';

export class AppNotification {
  id: string; title: string; message: string; type: NotificationType; time: string; isRead: boolean;

  constructor(data: { id: string; title: string; message: string; type: NotificationType; time: string; isRead?: boolean }) {
    this.id = data.id; this.title = data.title; this.message = data.message;
    this.type = data.type; this.time = data.time; this.isRead = data.isRead ?? false;
    makeAutoObservable(this);
  }

  markRead() { this.isRead = true; }
}
