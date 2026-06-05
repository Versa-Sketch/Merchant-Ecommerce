import { makeAutoObservable } from 'mobx';

export class OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;

  constructor(data: { id: string; name: string; quantity: number; price: number }) {
    this.id = data.id;
    this.name = data.name;
    this.quantity = data.quantity;
    this.price = data.price;
    makeAutoObservable(this);
  }
}

export class OrderTimelineEvent {
  status: string;
  time: string;
  completed: boolean;

  constructor(data: { status: string; time: string; completed: boolean }) {
    this.status = data.status;
    this.time = data.time;
    this.completed = data.completed;
    makeAutoObservable(this);
  }
}

export class Order {
  id: string;
  customerName: string;
  itemsCount: number;
  items: OrderItem[] = [];
  amount: number;
  paymentMethod: 'COD' | 'Online';
  orderTime: string;
  status:
    | 'New Orders'
    | 'Accepted'
    | 'Packed'
    | 'Out For Delivery'
    | 'Delivered'
    | 'Cancelled'
    | 'Rejected';
  deliveryPartnerId?: string;
  deliveryAddress: string;
  customerPhone: string;
  timeline: OrderTimelineEvent[] = [];

  constructor(data: {
    id: string;
    customerName: string;
    itemsCount: number;
    items: any[];
    amount: number;
    paymentMethod: 'COD' | 'Online';
    orderTime: string;
    status:
      | 'New Orders'
      | 'Accepted'
      | 'Packed'
      | 'Out For Delivery'
      | 'Delivered'
      | 'Cancelled'
      | 'Rejected';
    deliveryPartnerId?: string;
    deliveryAddress: string;
    customerPhone: string;
    timeline: any[];
  }) {
    this.id = data.id;
    this.customerName = data.customerName;
    this.itemsCount = data.itemsCount;
    this.items = data.items.map((item) => new OrderItem(item));
    this.amount = data.amount;
    this.paymentMethod = data.paymentMethod;
    this.orderTime = data.orderTime;
    this.status = data.status;
    this.deliveryPartnerId = data.deliveryPartnerId;
    this.deliveryAddress = data.deliveryAddress;
    this.customerPhone = data.customerPhone;
    this.timeline = data.timeline.map((event) => new OrderTimelineEvent(event));
    makeAutoObservable(this);
  }

  updateStatus(newStatus: typeof this.status) {
    this.status = newStatus;
    this.timeline.push(
      new OrderTimelineEvent({
        status: newStatus,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
      })
    );
  }

  assignDeliveryPartner(partnerId: string) {
    this.deliveryPartnerId = partnerId;
    this.timeline.push(
      new OrderTimelineEvent({
        status: 'Partner Assigned',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
      })
    );
  }
}
