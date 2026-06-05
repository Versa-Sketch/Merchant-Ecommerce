import { useContext } from 'react';
import { RootStoreContext } from '../providers/StoreProvider';
import type { RootStoreInstance } from '../stores/RootStore';

export const useStores = (): RootStoreInstance => {
  const store = useContext(RootStoreContext);
  if (!store) throw new Error('useStores must be used within a StoreProvider');
  return store;
};
