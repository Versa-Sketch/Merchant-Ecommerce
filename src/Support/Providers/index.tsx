import React, { createContext, useContext, useState } from 'react';
import { SupportStore } from '../Store';

const SupportStoreContext = createContext<SupportStore | null>(null);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new SupportStore());
  return <SupportStoreContext.Provider value={store}>{children}</SupportStoreContext.Provider>;
}

export function useSupportStore(): SupportStore {
  const store = useContext(SupportStoreContext);
  if (!store) throw new Error('useSupportStore must be inside SupportProvider');
  return store;
}
