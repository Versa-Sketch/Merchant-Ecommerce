import React, { createContext, useContext, useState } from 'react';
import { AnalyticsStore } from '../Store';

const AnalyticsStoreContext = createContext<AnalyticsStore | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new AnalyticsStore());
  return <AnalyticsStoreContext.Provider value={store}>{children}</AnalyticsStoreContext.Provider>;
}

export function useAnalyticsStore(): AnalyticsStore {
  const store = useContext(AnalyticsStoreContext);
  if (!store) throw new Error('useAnalyticsStore must be inside AnalyticsProvider');
  return store;
}
