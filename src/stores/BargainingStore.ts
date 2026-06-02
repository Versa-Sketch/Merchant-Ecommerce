import { types } from 'mobx-state-tree';

export const BargainMessage = types.model('BargainMessage', {
  id: types.identifier,
  sender: types.enumeration('SenderType', ['customer', 'merchant', 'system']),
  message: types.string,
  time: types.string,
  price: types.maybe(types.number),
});

export const Bargain = types
  .model('Bargain', {
    id: types.identifier,
    customerName: types.string,
    productId: types.string,
    productName: types.string,
    productImage: types.string,
    originalPrice: types.number, // MRP
    currentPrice: types.number, // Selling Price
    customerOffer: types.number,
    potentialProfit: types.number,
    merchantCost: types.number,
    status: types.enumeration('BargainStatus', ['Pending', 'Accepted', 'Rejected', 'Expired']),
    expirationTime: types.number, // remaining seconds
    timeline: types.array(BargainMessage),
    history: types.array(types.number),
  })
  .actions((self) => ({
    acceptBargain() {
      self.status = 'Accepted';
      self.timeline.push({
        id: `msg-${Date.now()}-sys`,
        sender: 'system',
        message: `Offer of ₹${self.customerOffer} accepted by merchant. Order generated!`,
        time: 'Just now',
      });
    },
    rejectBargain() {
      self.status = 'Rejected';
      self.timeline.push({
        id: `msg-${Date.now()}-sys`,
        sender: 'system',
        message: 'Offer rejected by merchant.',
        time: 'Just now',
      });
    },
    counterBargain(counterPrice: number) {
      self.history.push(counterPrice);
      self.timeline.push({
        id: `msg-${Date.now()}-mer`,
        sender: 'merchant',
        message: `Counter offered ₹${counterPrice}`,
        time: 'Just now',
        price: counterPrice,
      });
      // Simulate customer response
      setTimeout(() => {
        // We will mock this or support this in the store
      }, 1000);
    },
    receiveCustomerCounter(customerPrice: number) {
      self.customerOffer = customerPrice;
      self.potentialProfit = customerPrice - self.merchantCost;
      self.timeline.push({
        id: `msg-${Date.now()}-cus`,
        sender: 'customer',
        message: `Customer countered with ₹${customerPrice}`,
        time: 'Just now',
        price: customerPrice,
      });
    },
    tickTimer() {
      if (self.expirationTime > 0 && self.status === 'Pending') {
        self.expirationTime -= 1;
        if (self.expirationTime === 0) {
          self.status = 'Expired';
          self.timeline.push({
            id: `msg-${Date.now()}-exp`,
            sender: 'system',
            message: 'Bargain request expired.',
            time: 'Just now',
          });
        }
      }
    },
  }));

export const BargainingStore = types
  .model('BargainingStore', {
    bargains: types.optional(types.array(Bargain), [
      {
        id: 'BAR-3091',
        customerName: 'Amit Saxena',
        productId: 'PRD-1001',
        productName: 'Organic Roma Tomatoes 1kg',
        productImage: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400',
        originalPrice: 80,
        currentPrice: 60,
        customerOffer: 50,
        merchantCost: 35,
        potentialProfit: 15, // customerOffer (50) - merchantCost (35)
        status: 'Pending',
        expirationTime: 240, // 4 mins
        timeline: [
          { id: '1', sender: 'system', message: 'Bargain request initiated by Amit.', time: '2 mins ago' },
          { id: '2', sender: 'customer', message: 'Looking to buy 3 kgs. Can I get it for ₹50/kg?', time: '2 mins ago', price: 50 },
        ],
        history: [50],
      },
      {
        id: 'BAR-3092',
        customerName: 'Karan Malhotra',
        productId: 'PRD-1004',
        productName: 'Cotton Oversized Tee Black',
        productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
        originalPrice: 999,
        currentPrice: 599,
        customerOffer: 480,
        merchantCost: 320,
        potentialProfit: 160,
        status: 'Pending',
        expirationTime: 580, // 9 mins 40 secs
        timeline: [
          { id: '3', sender: 'system', message: 'Bargain request initiated by Karan.', time: '5 mins ago' },
          { id: '4', sender: 'customer', message: 'Hey, ₹599 is a bit high. How about ₹480?', time: '5 mins ago', price: 480 },
        ],
        history: [480],
      },
      {
        id: 'BAR-3088',
        customerName: 'Sneha Patil',
        productId: 'PRD-1002',
        productName: 'Hass Avocados (2 units)',
        productImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
        originalPrice: 350,
        currentPrice: 299,
        customerOffer: 250,
        merchantCost: 200,
        potentialProfit: 50,
        status: 'Accepted',
        expirationTime: 0,
        timeline: [
          { id: '5', sender: 'system', message: 'Bargain request initiated by Sneha.', time: '1 hr ago' },
          { id: '6', sender: 'customer', message: 'Will buy if you give it for ₹250.', time: '58 mins ago', price: 250 },
          { id: '7', sender: 'system', message: 'Offer of ₹250 accepted by merchant. Order generated!', time: '55 mins ago' },
        ],
        history: [250],
      },
      {
        id: 'BAR-3085',
        customerName: 'Rohan Shah',
        productId: 'PRD-1006',
        productName: 'Gourmet Butter Chicken Rice Bowl',
        productImage: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        originalPrice: 280,
        currentPrice: 249,
        customerOffer: 180,
        merchantCost: 170,
        potentialProfit: 10,
        status: 'Rejected',
        expirationTime: 0,
        timeline: [
          { id: '8', sender: 'system', message: 'Bargain request initiated by Rohan.', time: '2 hrs ago' },
          { id: '9', sender: 'customer', message: 'Can I get this for ₹180?', time: '2 hrs ago', price: 180 },
          { id: '10', sender: 'system', message: 'Offer rejected by merchant.', time: '1 hr 55 mins ago' },
        ],
        history: [180],
      },
    ]),
  })
  .views((self) => ({
    get pendingBargains() {
      return self.bargains.filter((b) => b.status === 'Pending');
    },
    get acceptedBargains() {
      return self.bargains.filter((b) => b.status === 'Accepted');
    },
    get rejectedBargains() {
      return self.bargains.filter((b) => b.status === 'Rejected');
    },
    get expiredBargains() {
      return self.bargains.filter((b) => b.status === 'Expired');
    },
  }))
  .actions((self) => ({
    acceptBargain(id: string) {
      const bargain = self.bargains.find((b) => b.id === id);
      if (bargain) {
        bargain.acceptBargain();
      }
    },
    rejectBargain(id: string) {
      const bargain = self.bargains.find((b) => b.id === id);
      if (bargain) {
        bargain.rejectBargain();
      }
    },
    counterBargain(id: string, counterPrice: number) {
      const bargain = self.bargains.find((b) => b.id === id);
      if (bargain) {
        bargain.counterBargain(counterPrice);
        // Simulate customer response after 2.5 seconds
        setTimeout(() => {
          // Accept counter offer or counter again
          const acceptChance = Math.random() > 0.4;
          if (acceptChance) {
            bargain.acceptBargain();
          } else {
            const nextOffer = Math.floor(counterPrice - (counterPrice - bargain.customerOffer) * 0.5);
            bargain.receiveCustomerCounter(nextOffer);
          }
        }, 2500);
      }
    },
    tickAll() {
      self.bargains.forEach((b) => b.tickTimer());
    },
    injectWebSocketBargain(bargain: any) {
      self.bargains.unshift(bargain);
    },
  }));
export type BargainingStoreType = typeof BargainingStore;
