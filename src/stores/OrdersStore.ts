import { types, Instance } from 'mobx-state-tree';

export const OrderItem = types.model('OrderItem', {
  id: types.identifier,
  name: types.string,
  quantity: types.number,
  price: types.number,
});

export const OrderTimelineEvent = types.model('OrderTimelineEvent', {
  status: types.string,
  time: types.string,
  completed: types.boolean,
});

export const Order = types
  .model('Order', {
    id: types.identifier,
    customerName: types.string,
    itemsCount: types.number,
    items: types.array(OrderItem),
    amount: types.number,
    paymentMethod: types.enumeration('PaymentMethod', ['COD', 'Online']),
    orderTime: types.string,
    status: types.enumeration('OrderStatus', [
      'New Orders',
      'Accepted',
      'Packed',
      'Out For Delivery',
      'Delivered',
      'Cancelled',
      'Rejected',
    ]),
    deliveryPartnerId: types.maybe(types.string),
    deliveryAddress: types.string,
    customerPhone: types.string,
    timeline: types.array(OrderTimelineEvent),
  })
  .actions((self) => ({
    updateStatus(newStatus: typeof self.status) {
      self.status = newStatus;
      self.timeline.push({
        status: newStatus,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
      });
    },
    assignDeliveryPartner(partnerId: string) {
      self.deliveryPartnerId = partnerId;
      self.timeline.push({
        status: 'Partner Assigned',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
      });
    },
  }));

export const OrdersStore = types
  .model('OrdersStore', {
    orders: types.optional(types.array(Order), [
      {
        id: 'ORD-8492',
        customerName: 'Rahul Verma',
        itemsCount: 3,
        items: [
          { id: '1', name: 'Organic Roma Tomatoes', quantity: 2, price: 60 },
          { id: '2', name: 'Fresh Hass Avocado (Pack of 2)', quantity: 1, price: 299 },
          { id: '3', name: 'Amul Salted Butter 500g', quantity: 1, price: 275 },
        ],
        amount: 694,
        paymentMethod: 'Online',
        orderTime: '10 mins ago',
        status: 'New Orders',
        deliveryAddress: 'Apt 402, Block C, Prestige Heights, HSR Layout, Bengaluru',
        customerPhone: '+91 98765 43210',
        timeline: [
          { status: 'Order Placed', time: '10 mins ago', completed: true },
        ],
      },
      {
        id: 'ORD-8491',
        customerName: 'Ananya Sen',
        itemsCount: 2,
        items: [
          { id: '4', name: 'Saffola Gold Blended Oil 5L', quantity: 1, price: 950 },
          { id: '5', name: 'Aashirvaad Select Sharbati Atta 5kg', quantity: 1, price: 340 },
        ],
        amount: 1290,
        paymentMethod: 'COD',
        orderTime: '25 mins ago',
        status: 'New Orders',
        deliveryAddress: 'House 78, 12th Main Road, Koramangala 4th Block, Bengaluru',
        customerPhone: '+91 87654 32109',
        timeline: [
          { status: 'Order Placed', time: '25 mins ago', completed: true },
        ],
      },
      {
        id: 'ORD-8490',
        customerName: 'Suresh Kumar',
        itemsCount: 1,
        items: [
          { id: '6', name: 'Parle-G Gold Biscuits (Packs of 5)', quantity: 2, price: 40 },
        ],
        amount: 80,
        paymentMethod: 'Online',
        orderTime: '45 mins ago',
        status: 'Accepted',
        deliveryPartnerId: 'DP-01',
        deliveryAddress: 'Flat 101, Oakwood Residency, Sector 3, HSR Layout, Bengaluru',
        customerPhone: '+91 76543 21098',
        timeline: [
          { status: 'Order Placed', time: '45 mins ago', completed: true },
          { status: 'Accepted', time: '40 mins ago', completed: true },
          { status: 'Partner Assigned', time: '38 mins ago', completed: true },
        ],
      },
      {
        id: 'ORD-8488',
        customerName: 'Vikram Mehta',
        itemsCount: 4,
        items: [
          { id: '7', name: 'Dettol Liquid Handwash Refill 1L', quantity: 1, price: 199 },
          { id: '8', name: 'Surf Excel Easy Wash Detergent 2kg', quantity: 1, price: 340 },
        ],
        amount: 539,
        paymentMethod: 'Online',
        orderTime: '1 hr ago',
        status: 'Packed',
        deliveryPartnerId: 'DP-02',
        deliveryAddress: 'No. 44, 4th Cross, Green Glen Layout, Outer Ring Road, Bengaluru',
        customerPhone: '+91 65432 10987',
        timeline: [
          { status: 'Order Placed', time: '1 hr ago', completed: true },
          { status: 'Accepted', time: '55 mins ago', completed: true },
          { status: 'Packed', time: '40 mins ago', completed: true },
        ],
      },
      {
        id: 'ORD-8485',
        customerName: 'Meera Nair',
        itemsCount: 2,
        items: [
          { id: '9', name: 'Farm Fresh Brocolli 250g', quantity: 1, price: 80 },
          { id: '10', name: 'Fortune Basmati Rice 1kg', quantity: 2, price: 140 },
        ],
        amount: 360,
        paymentMethod: 'Online',
        orderTime: '2 hrs ago',
        status: 'Out For Delivery',
        deliveryPartnerId: 'DP-03',
        deliveryAddress: 'Villa 12, Sobha Green Meadows, Sarjapur Road, Bengaluru',
        customerPhone: '+91 99887 76655',
        timeline: [
          { status: 'Order Placed', time: '2 hrs ago', completed: true },
          { status: 'Accepted', time: '1 hr 50 mins ago', completed: true },
          { status: 'Packed', time: '1 hr 30 mins ago', completed: true },
          { status: 'Out For Delivery', time: '15 mins ago', completed: true },
        ],
      },
      {
        id: 'ORD-8480',
        customerName: 'Divya Rao',
        itemsCount: 5,
        items: [
          { id: '11', name: 'Lipton Honey Lemon Green Tea Bags 100s', quantity: 1, price: 420 },
        ],
        amount: 420,
        paymentMethod: 'Online',
        orderTime: 'Yesterday',
        status: 'Delivered',
        deliveryPartnerId: 'DP-01',
        deliveryAddress: 'Flat 503, Block B, Suncity Apartments, Sarjapur Road, Bengaluru',
        customerPhone: '+91 88990 01122',
        timeline: [
          { status: 'Order Placed', time: 'Yesterday 4:00 PM', completed: true },
          { status: 'Accepted', time: 'Yesterday 4:05 PM', completed: true },
          { status: 'Packed', time: 'Yesterday 4:20 PM', completed: true },
          { status: 'Out For Delivery', time: 'Yesterday 4:35 PM', completed: true },
          { status: 'Delivered', time: 'Yesterday 4:55 PM', completed: true },
        ],
      },
    ]),
  })
  .views((self) => ({
    get newOrders() {
      return self.orders.filter((o) => o.status === 'New Orders');
    },
    get acceptedOrders() {
      return self.orders.filter((o) => o.status === 'Accepted');
    },
    get packedOrders() {
      return self.orders.filter((o) => o.status === 'Packed');
    },
    get outForDeliveryOrders() {
      return self.orders.filter((o) => o.status === 'Out For Delivery');
    },
    get deliveredOrders() {
      return self.orders.filter((o) => o.status === 'Delivered');
    },
    get cancelledOrders() {
      return self.orders.filter((o) => o.status === 'Cancelled' || o.status === 'Rejected');
    },
  }))
  .actions((self) => ({
    acceptOrder(id: string) {
      const order = self.orders.find((o) => o.id === id);
      if (order) {
        order.updateStatus('Accepted');
      }
    },
    rejectOrder(id: string) {
      const order = self.orders.find((o) => o.id === id);
      if (order) {
        order.updateStatus('Rejected');
      }
    },
    assignDeliveryPartner(orderId: string, partnerId: string) {
      const order = self.orders.find((o) => o.id === orderId);
      if (order) {
        order.assignDeliveryPartner(partnerId);
      }
    },
    injectWebSocketOrder(order: any) {
      self.orders.unshift(order);
    },
  }));
export type OrdersStoreType = typeof OrdersStore;
export type OrderType = Instance<typeof Order>;
