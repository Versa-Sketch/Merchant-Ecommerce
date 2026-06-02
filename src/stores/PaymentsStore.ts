import { makeAutoObservable } from 'mobx';

export class Payout {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  transactionId: string;

  constructor(data: { id: string; date: string; amount: number; status: 'Paid' | 'Pending' | 'Failed'; transactionId: string }) {
    this.id = data.id;
    this.date = data.date;
    this.amount = data.amount;
    this.status = data.status;
    this.transactionId = data.transactionId;
    makeAutoObservable(this);
  }
}

export class PaymentsStore {
  walletBalance: number = 18450;
  netEarnings: number = 84300;
  commissionsPaid: number = 4210;
  gstCollected: number = 3820;
  refundsProcessed: number = 1200;
  payouts: Payout[] = [];

  constructor() {
    this.payouts = [
      new Payout({
        id: 'PAY-701',
        date: '2026-06-01',
        amount: 12500,
        status: 'Paid',
        transactionId: 'TXN849182349182',
      }),
      new Payout({
        id: 'PAY-702',
        date: '2026-05-25',
        amount: 14800,
        status: 'Paid',
        transactionId: 'TXN842918471829',
      }),
      new Payout({
        id: 'PAY-703',
        date: '2026-05-18',
        amount: 9800,
        status: 'Paid',
        transactionId: 'TXN839182049183',
      }),
    ];
    makeAutoObservable(this);
  }

  requestPayout() {
    if (this.walletBalance <= 0) return;
    const amount = this.walletBalance;
    const id = `PAY-${700 + this.payouts.length + 1}`;
    const transactionId = 'TXN' + Math.floor(Math.random() * 1000000000000).toString();
    this.payouts.unshift(
      new Payout({
        id,
        date: new Date().toISOString().split('T')[0],
        amount,
        status: 'Pending',
        transactionId,
      })
    );
    this.walletBalance = 0;
  }

  updateBalances(orderAmount: number, commission: number, gst: number) {
    this.walletBalance += (orderAmount - commission);
    this.netEarnings += (orderAmount - commission);
    this.commissionsPaid += commission;
    this.gstCollected += gst;
  }

  processRefund(amount: number) {
    this.refundsProcessed += amount;
    this.walletBalance = Math.max(0, this.walletBalance - amount);
    this.netEarnings = Math.max(0, this.netEarnings - amount);
  }

  approvePendingPayouts() {
    this.payouts.forEach((p) => {
      if (p.status === 'Pending') {
        p.status = 'Paid';
      }
    });
  }
}

export type PaymentsStoreType = PaymentsStore;
export type PayoutType = Payout;
