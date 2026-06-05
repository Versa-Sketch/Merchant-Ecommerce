import React, { createContext, useContext, useState } from 'react';
import { OrdersStore } from '../Store';

const OrdersStoreContext = createContext<OrdersStore | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new OrdersStore());
  return <OrdersStoreContext.Provider value={store}>{children}</OrdersStoreContext.Provider>;
}

export function useOrdersStore(): OrdersStore {
  const store = useContext(OrdersStoreContext);
  if (!store) throw new Error('useOrdersStore must be inside OrdersProvider');
  return store;
}
