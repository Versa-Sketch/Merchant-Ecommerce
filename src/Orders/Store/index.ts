import { makeAutoObservable } from 'mobx';
import { Order } from '../Models/Order';
import { orderFixtures } from '../Services/index.fixture';

export class OrdersStore {
  orders: Order[] = [];

  constructor() {
    this.orders = orderFixtures.map((data) => new Order(data));
    makeAutoObservable(this);
  }

  get newOrders() {
    return this.orders.filter((o) => o.status === 'New Orders');
  }

  get acceptedOrders() {
    return this.orders.filter((o) => o.status === 'Accepted');
  }

  get packedOrders() {
    return this.orders.filter((o) => o.status === 'Packed');
  }

  get outForDeliveryOrders() {
    return this.orders.filter((o) => o.status === 'Out For Delivery');
  }

  get deliveredOrders() {
    return this.orders.filter((o) => o.status === 'Delivered');
  }

  get cancelledOrders() {
    return this.orders.filter((o) => o.status === 'Cancelled' || o.status === 'Rejected');
  }

  acceptOrder(id: string) {
    const order = this.orders.find((o) => o.id === id);
    if (order) order.updateStatus('Accepted');
  }

  rejectOrder(id: string) {
    const order = this.orders.find((o) => o.id === id);
    if (order) order.updateStatus('Rejected');
  }

  assignDeliveryPartner(orderId: string, partnerId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) order.assignDeliveryPartner(partnerId);
  }

  injectWebSocketOrder(order: any) {
    this.orders.unshift(new Order(order));
  }
}

export type OrdersStoreType = OrdersStore;
