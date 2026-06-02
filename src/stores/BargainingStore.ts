import { makeAutoObservable } from 'mobx';

export class BargainMessage {
  id: string;
  sender: 'customer' | 'merchant' | 'system';
  message: string;
  time: string;
  price?: number;

  constructor(data: {
    id: string;
    sender: 'customer' | 'merchant' | 'system';
    message: string;
    time: string;
    price?: number;
  }) {
    this.id = data.id;
    this.sender = data.sender;
    this.message = data.message;
    this.time = data.time;
    this.price = data.price;
    makeAutoObservable(this);
  }
}

export class Bargain {
  id: string;
  customerName: string;
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  currentPrice: number;
  customerOffer: number;
  potentialProfit: number;
  merchantCost: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
  expirationTime: number;
  timeline: BargainMessage[] = [];
  history: number[] = [];

  constructor(data: {
    id: string;
    customerName: string;
    productId: string;
    productName: string;
    productImage: string;
    originalPrice: number;
    currentPrice: number;
    customerOffer: number;
    potentialProfit: number;
    merchantCost: number;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
    expirationTime: number;
    timeline: any[];
    history: number[];
  }) {
    this.id = data.id;
    this.customerName = data.customerName;
    this.productId = data.productId;
    this.productName = data.productName;
    this.productImage = data.productImage;
    this.originalPrice = data.originalPrice;
    this.currentPrice = data.currentPrice;
    this.customerOffer = data.customerOffer;
    this.potentialProfit = data.potentialProfit;
    this.merchantCost = data.merchantCost;
    this.status = data.status;
    this.expirationTime = data.expirationTime;
    this.timeline = data.timeline.map((t) => new BargainMessage(t));
    this.history = [...data.history];
    makeAutoObservable(this);
  }

  acceptBargain() {
    this.status = 'Accepted';
    this.timeline.push(
      new BargainMessage({
        id: `msg-${Date.now()}-sys`,
        sender: 'system',
        message: `Offer of ₹${this.customerOffer} accepted by merchant. Order generated!`,
        time: 'Just now',
      })
    );
  }

  rejectBargain() {
    this.status = 'Rejected';
    this.timeline.push(
      new BargainMessage({
        id: `msg-${Date.now()}-sys`,
        sender: 'system',
        message: 'Offer rejected by merchant.',
        time: 'Just now',
      })
    );
  }

  counterBargain(counterPrice: number) {
    this.history.push(counterPrice);
    this.timeline.push(
      new BargainMessage({
        id: `msg-${Date.now()}-mer`,
        sender: 'merchant',
        message: `Counter offered ₹${counterPrice}`,
        time: 'Just now',
        price: counterPrice,
      })
    );
  }

  receiveCustomerCounter(customerPrice: number) {
    this.customerOffer = customerPrice;
    this.potentialProfit = customerPrice - this.merchantCost;
    this.timeline.push(
      new BargainMessage({
        id: `msg-${Date.now()}-cus`,
        sender: 'customer',
        message: `Customer countered with ₹${customerPrice}`,
        time: 'Just now',
        price: customerPrice,
      })
    );
  }

  tickTimer() {
    if (this.expirationTime > 0 && this.status === 'Pending') {
      this.expirationTime -= 1;
      if (this.expirationTime === 0) {
        this.status = 'Expired';
        this.timeline.push(
          new BargainMessage({
            id: `msg-${Date.now()}-exp`,
            sender: 'system',
            message: 'Bargain request expired.',
            time: 'Just now',
          })
        );
      }
    }
  }
}

export class BargainingStore {
  bargains: Bargain[] = [];

  constructor() {
    this.bargains = [
      new Bargain({
        id: 'BAR-3091',
        customerName: 'Amit Saxena',
        productId: 'PRD-1001',
        productName: 'Organic Roma Tomatoes 1kg',
        productImage: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400',
        originalPrice: 80,
        currentPrice: 60,
        customerOffer: 50,
        merchantCost: 35,
        potentialProfit: 15,
        status: 'Pending',
        expirationTime: 240,
        timeline: [
          { id: '1', sender: 'system', message: 'Bargain request initiated by Amit.', time: '2 mins ago' },
          { id: '2', sender: 'customer', message: 'Looking to buy 3 kgs. Can I get it for ₹50/kg?', time: '2 mins ago', price: 50 },
        ],
        history: [50],
      }),
      new Bargain({
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
        expirationTime: 580,
        timeline: [
          { id: '3', sender: 'system', message: 'Bargain request initiated by Karan.', time: '5 mins ago' },
          { id: '4', sender: 'customer', message: 'Hey, ₹599 is a bit high. How about ₹480?', time: '5 mins ago', price: 480 },
        ],
        history: [480],
      }),
      new Bargain({
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
      }),
      new Bargain({
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
      }),
    ];
    makeAutoObservable(this);
  }

  get pendingBargains() {
    return this.bargains.filter((b) => b.status === 'Pending');
  }

  get acceptedBargains() {
    return this.bargains.filter((b) => b.status === 'Accepted');
  }

  get rejectedBargains() {
    return this.bargains.filter((b) => b.status === 'Rejected');
  }

  get expiredBargains() {
    return this.bargains.filter((b) => b.status === 'Expired');
  }

  acceptBargain(id: string) {
    const bargain = this.bargains.find((b) => b.id === id);
    if (bargain) {
      bargain.acceptBargain();
    }
  }

  rejectBargain(id: string) {
    const bargain = this.bargains.find((b) => b.id === id);
    if (bargain) {
      bargain.rejectBargain();
    }
  }

  counterBargain(id: string, counterPrice: number) {
    const bargain = this.bargains.find((b) => b.id === id);
    if (bargain) {
      bargain.counterBargain(counterPrice);
      setTimeout(() => {
        const acceptChance = Math.random() > 0.4;
        if (acceptChance) {
          bargain.acceptBargain();
        } else {
          const nextOffer = Math.floor(counterPrice - (counterPrice - bargain.customerOffer) * 0.5);
          bargain.receiveCustomerCounter(nextOffer);
        }
      }, 2500);
    }
  }

  tickAll() {
    this.bargains.forEach((b) => b.tickTimer());
  }

  injectWebSocketBargain(bargain: any) {
    this.bargains.unshift(new Bargain(bargain));
  }
}

export type BargainingStoreType = BargainingStore;
