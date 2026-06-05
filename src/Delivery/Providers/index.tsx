import React, { createContext, useContext, useState } from 'react';
import { DeliveryStore } from '../Store';

const DeliveryStoreContext = createContext<DeliveryStore | null>(null);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new DeliveryStore());
  return <DeliveryStoreContext.Provider value={store}>{children}</DeliveryStoreContext.Provider>;
}

export function useDeliveryStore(): DeliveryStore {
  const store = useContext(DeliveryStoreContext);
  if (!store) throw new Error('useDeliveryStore must be inside DeliveryProvider');
  return store;
}
