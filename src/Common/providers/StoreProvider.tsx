import { createContext } from 'react';
import type { RootStoreInstance } from '../stores/RootStore';

export const RootStoreContext = createContext<RootStoreInstance | null>(null);
export const StoreProvider = RootStoreContext.Provider;
