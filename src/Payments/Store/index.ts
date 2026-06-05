import { makeAutoObservable } from 'mobx';
import { Payout } from '../Models/Payout';
import { payoutFixtures } from '../Services/index.fixture';

export class PaymentsStore {
  walletBalance: number = 18450;
  netEarnings: number = 84300;
  commissionsPaid: number = 4210;
  gstCollected: number = 3820;
  refundsProcessed: number = 1200;
  payouts: Payout[] = [];

  constructor() {
    this.payouts = payoutFixtures.map((d) => new Payout(d));
    makeAutoObservable(this);
  }

  requestPayout() {
    if (this.walletBalance <= 0) return;
    const amount = this.walletBalance;
    const id = `PAY-${700 + this.payouts.length + 1}`;
    const transactionId = 'TXN' + Math.floor(Math.random() * 1000000000000).toString();
    this.payouts.unshift(new Payout({ id, date: new Date().toISOString().split('T')[0], amount, status: 'Pending', transactionId }));
    this.walletBalance = 0;
  }

  updateBalances(orderAmount: number, commission: number, gst: number) {
    this.walletBalance += orderAmount - commission;
    this.netEarnings += orderAmount - commission;
    this.commissionsPaid += commission;
    this.gstCollected += gst;
  }

  processRefund(amount: number) {
    this.refundsProcessed += amount;
    this.walletBalance = Math.max(0, this.walletBalance - amount);
    this.netEarnings = Math.max(0, this.netEarnings - amount);
  }

  approvePendingPayouts() {
    this.payouts.forEach((p) => { if (p.status === 'Pending') p.status = 'Paid'; });
  }
}

export type PaymentsStoreType = PaymentsStore;
