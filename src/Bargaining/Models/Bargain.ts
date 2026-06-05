import { makeAutoObservable } from 'mobx';

export class BargainMessage {
  id: string;
  sender: 'customer' | 'merchant' | 'system';
  message: string;
  time: string;
  price?: number;

  constructor(data: { id: string; sender: 'customer' | 'merchant' | 'system'; message: string; time: string; price?: number }) {
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
    id: string; customerName: string; productId: string; productName: string; productImage: string;
    originalPrice: number; currentPrice: number; customerOffer: number; potentialProfit: number;
    merchantCost: number; status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
    expirationTime: number; timeline: any[]; history: number[];
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
    this.timeline.push(new BargainMessage({ id: `msg-${Date.now()}-sys`, sender: 'system', message: `Offer of ₹${this.customerOffer} accepted by merchant. Order generated!`, time: 'Just now' }));
  }

  rejectBargain() {
    this.status = 'Rejected';
    this.timeline.push(new BargainMessage({ id: `msg-${Date.now()}-sys`, sender: 'system', message: 'Offer rejected by merchant.', time: 'Just now' }));
  }

  counterBargain(counterPrice: number) {
    this.history.push(counterPrice);
    this.timeline.push(new BargainMessage({ id: `msg-${Date.now()}-mer`, sender: 'merchant', message: `Counter offered ₹${counterPrice}`, time: 'Just now', price: counterPrice }));
  }

  receiveCustomerCounter(customerPrice: number) {
    this.customerOffer = customerPrice;
    this.potentialProfit = customerPrice - this.merchantCost;
    this.timeline.push(new BargainMessage({ id: `msg-${Date.now()}-cus`, sender: 'customer', message: `Customer countered with ₹${customerPrice}`, time: 'Just now', price: customerPrice }));
  }

  tickTimer() {
    if (this.expirationTime > 0 && this.status === 'Pending') {
      this.expirationTime -= 1;
      if (this.expirationTime === 0) {
        this.status = 'Expired';
        this.timeline.push(new BargainMessage({ id: `msg-${Date.now()}-exp`, sender: 'system', message: 'Bargain request expired.', time: 'Just now' }));
      }
    }
  }
}
