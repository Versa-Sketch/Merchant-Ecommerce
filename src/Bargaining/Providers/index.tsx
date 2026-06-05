import React, { createContext, useContext, useState } from 'react';
import { BargainingStore } from '../Store';

const BargainingStoreContext = createContext<BargainingStore | null>(null);

export function BargainingProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new BargainingStore());
  return <BargainingStoreContext.Provider value={store}>{children}</BargainingStoreContext.Provider>;
}

export function useBargainingStore(): BargainingStore {
  const store = useContext(BargainingStoreContext);
  if (!store) throw new Error('useBargainingStore must be inside BargainingProvider');
  return store;
}
