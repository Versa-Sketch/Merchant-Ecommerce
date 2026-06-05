import React, { createContext, useContext, useState } from 'react';
import { InventoryStore } from '../Store';

const InventoryStoreContext = createContext<InventoryStore | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new InventoryStore());
  return <InventoryStoreContext.Provider value={store}>{children}</InventoryStoreContext.Provider>;
}

export function useInventoryStore(): InventoryStore {
  const store = useContext(InventoryStoreContext);
  if (!store) throw new Error('useInventoryStore must be inside InventoryProvider');
  return store;
}
