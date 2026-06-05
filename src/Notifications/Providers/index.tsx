import React, { createContext, useContext, useState } from 'react';
import { NotificationStore } from '../Store';

const NotificationStoreContext = createContext<NotificationStore | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new NotificationStore());
  return <NotificationStoreContext.Provider value={store}>{children}</NotificationStoreContext.Provider>;
}

export function useNotificationStore(): NotificationStore {
  const store = useContext(NotificationStoreContext);
  if (!store) throw new Error('useNotificationStore must be inside NotificationsProvider');
  return store;
}
