import React, { createContext, useContext, useState } from 'react';
import { DashboardStore } from '../Store';

const DashboardStoreContext = createContext<DashboardStore | null>(null);

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new DashboardStore());
  return <DashboardStoreContext.Provider value={store}>{children}</DashboardStoreContext.Provider>;
}

export function useDashboardStore(): DashboardStore {
  const store = useContext(DashboardStoreContext);
  if (!store) throw new Error('useDashboardStore must be inside HomeProvider');
  return store;
}
