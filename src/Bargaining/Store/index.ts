import { makeAutoObservable } from 'mobx';
import { Bargain, BargainMessage } from '../Models/Bargain';
import { bargainFixtures } from '../Services/index.fixture';

export class BargainingStore {
  bargains: Bargain[] = [];

  constructor() {
    this.bargains = bargainFixtures.map((data) => new Bargain(data));
    makeAutoObservable(this);
  }

  get pendingBargains() { return this.bargains.filter((b) => b.status === 'Pending'); }
  get acceptedBargains() { return this.bargains.filter((b) => b.status === 'Accepted'); }
  get rejectedBargains() { return this.bargains.filter((b) => b.status === 'Rejected'); }
  get expiredBargains() { return this.bargains.filter((b) => b.status === 'Expired'); }

  acceptBargain(id: string) {
    this.bargains.find((b) => b.id === id)?.acceptBargain();
  }

  rejectBargain(id: string) {
    this.bargains.find((b) => b.id === id)?.rejectBargain();
  }

  counterBargain(id: string, counterPrice: number) {
    const bargain = this.bargains.find((b) => b.id === id);
    if (bargain) {
      bargain.counterBargain(counterPrice);
      setTimeout(() => {
        if (Math.random() > 0.4) {
          bargain.acceptBargain();
        } else {
          bargain.receiveCustomerCounter(Math.floor(counterPrice - (counterPrice - bargain.customerOffer) * 0.5));
        }
      }, 2500);
    }
  }

  sendMerchantMessage(id: string, text: string) {
    const bargain = this.bargains.find((b) => b.id === id);
    if (!bargain || !text.trim()) return;
    bargain.timeline.push(new BargainMessage({ id: `msg-${Date.now()}-mer`, sender: 'merchant', message: text.trim(), time: 'Just now' }));
  }

  tickAll() { this.bargains.forEach((b) => b.tickTimer()); }

  injectWebSocketBargain(bargain: any) { this.bargains.unshift(new Bargain(bargain)); }
}

export type BargainingStoreType = BargainingStore;
