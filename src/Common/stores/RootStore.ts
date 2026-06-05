import { makeAutoObservable } from 'mobx';
import { SessionStore } from '../../Auth/Store';
import { AuthStore } from '../../Settings/Store';
import { DashboardStore } from '../../Home/Store';
import { OrdersStore } from '../../Orders/Store';
import { ProductsStore } from '../../Products/Store';
import { InventoryStore } from '../../Inventory/Store';
import { BargainingStore } from '../../Bargaining/Store';
import { DeliveryStore } from '../../Delivery/Store';
import { PaymentsStore } from '../../Payments/Store';
import { AnalyticsStore } from '../../Analytics/Store';
import { CustomersStore } from '../../Customers/Store';
import { NotificationStore } from '../../Notifications/Store';
import { SupportStore } from '../../Support/Store';

export class RootStore {
  sessionStore = new SessionStore();
  authStore = new AuthStore();
  dashboardStore = new DashboardStore();
  ordersStore = new OrdersStore();
  productsStore = new ProductsStore();
  inventoryStore = new InventoryStore();
  bargainingStore = new BargainingStore();
  deliveryStore = new DeliveryStore();
  paymentsStore = new PaymentsStore();
  analyticsStore = new AnalyticsStore();
  customersStore = new CustomersStore();
  notificationStore = new NotificationStore();
  supportStore = new SupportStore();

  constructor() {
    makeAutoObservable(this);
  }
}

export type RootStoreInstance = RootStore;
