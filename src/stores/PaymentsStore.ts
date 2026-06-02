import { types, Instance } from 'mobx-state-tree';

export const Payout = types.model('Payout', {
  id: types.identifier,
  date: types.string,
  amount: types.number,
  status: types.enumeration('PayoutStatus', ['Paid', 'Pending', 'Failed']),
  transactionId: types.string,
});

export const PaymentsStore = types
  .model('PaymentsStore', {
    walletBalance: types.optional(types.number, 18450),
    netEarnings: types.optional(types.number, 84300),
    commissionsPaid: types.optional(types.number, 4210),
    gstCollected: types.optional(types.number, 3820),
    refundsProcessed: types.optional(types.number, 1200),
    payouts: types.optional(types.array(Payout), [
      {
        id: 'PAY-701',
        date: '2026-06-01',
        amount: 12500,
        status: 'Paid',
        transactionId: 'TXN849182349182',
      },
      {
        id: 'PAY-702',
        date: '2026-05-25',
        amount: 14800,
        status: 'Paid',
        transactionId: 'TXN842918471829',
      },
      {
        id: 'PAY-703',
        date: '2026-05-18',
        amount: 9800,
        status: 'Paid',
        transactionId: 'TXN839182049183',
      },
    ]),
  })
  .actions((self) => ({
    requestPayout() {
      if (self.walletBalance <= 0) return;
      const amount = self.walletBalance;
      const id = `PAY-${700 + self.payouts.length + 1}`;
      const transactionId = 'TXN' + Math.floor(Math.random() * 1000000000000).toString();
      self.payouts.unshift({
        id,
        date: new Date().toISOString().split('T')[0],
        amount,
        status: 'Pending',
        transactionId,
      });
      self.walletBalance = 0;

      // Simulate transfer approval
      setTimeout(() => {
        // Handled via component timer or direct state change
      }, 3000);
    },
    updateBalances(orderAmount: number, commission: number, gst: number) {
      self.walletBalance += (orderAmount - commission);
      self.netEarnings += (orderAmount - commission);
      self.commissionsPaid += commission;
      self.gstCollected += gst;
    },
    processRefund(amount: number) {
      self.refundsProcessed += amount;
      self.walletBalance = Math.max(0, self.walletBalance - amount);
      self.netEarnings = Math.max(0, self.netEarnings - amount);
    },
    approvePendingPayouts() {
      self.payouts.forEach((p) => {
        if (p.status === 'Pending') {
          p.status = 'Paid';
        }
      });
    },
  }));
export type PaymentsStoreType = typeof PaymentsStore;
export type PayoutType = Instance<typeof Payout>;
