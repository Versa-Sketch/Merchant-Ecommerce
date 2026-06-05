import { makeAutoObservable } from 'mobx';

export class Payout {
  id: string; date: string; amount: number; status: 'Paid' | 'Pending' | 'Failed'; transactionId: string;

  constructor(data: { id: string; date: string; amount: number; status: 'Paid' | 'Pending' | 'Failed'; transactionId: string }) {
    this.id = data.id; this.date = data.date; this.amount = data.amount;
    this.status = data.status; this.transactionId = data.transactionId;
    makeAutoObservable(this);
  }
}
