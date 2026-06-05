import { makeAutoObservable } from 'mobx';

export class CustomerSegment {
  id: string; name: string; ordersCount: number; lifetimeSpend: number;
  lastOrderDate: string; segment: 'Top' | 'Repeat' | 'High Value' | 'Inactive';

  constructor(data: { id: string; name: string; ordersCount: number; lifetimeSpend: number; lastOrderDate: string; segment: 'Top' | 'Repeat' | 'High Value' | 'Inactive' }) {
    this.id = data.id; this.name = data.name; this.ordersCount = data.ordersCount;
    this.lifetimeSpend = data.lifetimeSpend; this.lastOrderDate = data.lastOrderDate;
    this.segment = data.segment;
    makeAutoObservable(this);
  }
}
