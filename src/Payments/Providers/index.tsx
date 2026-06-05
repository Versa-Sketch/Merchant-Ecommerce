import React, { createContext, useContext, useState } from 'react';
import { PaymentsStore } from '../Store';

const PaymentsStoreContext = createContext<PaymentsStore | null>(null);

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new PaymentsStore());
  return <PaymentsStoreContext.Provider value={store}>{children}</PaymentsStoreContext.Provider>;
}

export function usePaymentsStore(): PaymentsStore {
  const store = useContext(PaymentsStoreContext);
  if (!store) throw new Error('usePaymentsStore must be inside PaymentsProvider');
  return store;
}
