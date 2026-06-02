import { createContext, useContext } from 'react';
import { types, Instance } from 'mobx-state-tree';
import { AuthStore } from './AuthStore';
import { DashboardStore } from './DashboardStore';
import { OrdersStore } from './OrdersStore';
import { ProductsStore } from './ProductsStore';
import { InventoryStore } from './InventoryStore';
import { BargainingStore } from './BargainingStore';
import { DeliveryStore } from './DeliveryStore';
import { PaymentsStore } from './PaymentsStore';
import { AnalyticsStore } from './AnalyticsStore';
import { NotificationStore } from './NotificationStore';

export const RootStore = types.model('RootStore', {
  authStore: types.optional(AuthStore, {}),
  dashboardStore: types.optional(DashboardStore, {}),
  ordersStore: types.optional(OrdersStore, {}),
  productsStore: types.optional(ProductsStore, {}),
  inventoryStore: types.optional(InventoryStore, {}),
  bargainingStore: types.optional(BargainingStore, {}),
  deliveryStore: types.optional(DeliveryStore, {}),
  paymentsStore: types.optional(PaymentsStore, {}),
  analyticsStore: types.optional(AnalyticsStore, {}),
  notificationStore: types.optional(NotificationStore, {}),
});

export type RootStoreInstance = Instance<typeof RootStore>;

const rootStore = RootStore.create({});

// Setup simple WebSocket-like simulator
setInterval(() => {
  // 1. Tick expiration timers on bargains
  rootStore.bargainingStore.tickAll();

  // 2. Simulate location movement of delivery drivers
  rootStore.deliveryStore.simulateMovement();
}, 1000);

// WebSocket real-time event simulation injector
export const simulateIncomingWebSocketMessage = (type: 'order' | 'bargain' | 'alert') => {
  if (type === 'order') {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const freshOrder = {
      id: orderId,
      customerName: ['Priyanshu Verma', 'Aditi Das', 'Vikram Sen', 'Kavita Patel'][Math.floor(Math.random() * 4)],
      itemsCount: 1,
      items: [
        { id: 'ws-1', name: 'Fresh Hass Avocado (Pack of 2)', quantity: 1, price: 299 },
      ],
      amount: 299,
      paymentMethod: Math.random() > 0.5 ? 'COD' as const : 'Online' as const,
      orderTime: 'Just now',
      status: 'New Orders' as const,
      deliveryAddress: 'Flat 901, Pearl Residency, Outer Ring Road, Bengaluru',
      customerPhone: '+91 99887 11223',
      timeline: [{ status: 'Order Placed', time: 'Just now', completed: true }],
    };
    rootStore.ordersStore.injectWebSocketOrder(freshOrder);
    rootStore.notificationStore.addNotification({
      title: 'New Order Received',
      message: `Received ${orderId} from ${freshOrder.customerName} of amount ₹299.`,
      type: 'new_order',
    });
    rootStore.dashboardStore.refreshMetrics();
  } else if (type === 'bargain') {
    const bargainId = `BAR-${Math.floor(3000 + Math.random() * 900)}`;
    const name = ['Sneha Patil', 'Aman Verma', 'Pooja Roy', 'Sumit Gill'][Math.floor(Math.random() * 4)];
    const freshBargain = {
      id: bargainId,
      customerName: name,
      productId: 'PRD-1004',
      productName: 'Cotton Oversized Tee Black',
      productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
      originalPrice: 999,
      currentPrice: 599,
      customerOffer: 450 + Math.floor(Math.random() * 50),
      merchantCost: 320,
      potentialProfit: 130,
      status: 'Pending' as const,
      expirationTime: 300,
      timeline: [
        { id: '1', sender: 'system' as const, message: `Bargain request initiated by ${name}.`, time: 'Just now' },
        { id: '2', sender: 'customer' as const, message: `Hey! Can you do it for cheap?`, time: 'Just now' },
      ],
      history: [450],
    };
    rootStore.bargainingStore.injectWebSocketBargain(freshBargain);
    rootStore.notificationStore.addNotification({
      title: 'New Bargain Request',
      message: `${name} wants to negotiate on Cotton Oversized Tee.`,
      type: 'new_bargain',
    });
  } else if (type === 'alert') {
    rootStore.notificationStore.addNotification({
      title: 'Low Stock Alert',
      message: 'Organic Roma Tomatoes 1kg stock is down to 4 units.',
      type: 'low_stock',
    });
  }
};

const RootStoreContext = createContext<RootStoreInstance | null>(null);

export const StoreProvider = RootStoreContext.Provider;

export const useStores = () => {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return store;
};

export { rootStore };
