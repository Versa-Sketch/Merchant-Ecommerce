import React, { createContext, useContext, useState } from 'react';
import { CustomersStore } from '../Store';

const CustomersStoreContext = createContext<CustomersStore | null>(null);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new CustomersStore());
  return <CustomersStoreContext.Provider value={store}>{children}</CustomersStoreContext.Provider>;
}

export function useCustomersStore(): CustomersStore {
  const store = useContext(CustomersStoreContext);
  if (!store) throw new Error('useCustomersStore must be inside CustomersProvider');
  return store;
}
