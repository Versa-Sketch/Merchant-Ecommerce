import React, { createContext, useContext, useState } from 'react';
import { ProductsStore } from '../Store';

const ProductsStoreContext = createContext<ProductsStore | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => new ProductsStore());
  return <ProductsStoreContext.Provider value={store}>{children}</ProductsStoreContext.Provider>;
}

export function useProductsStore(): ProductsStore {
  const store = useContext(ProductsStoreContext);
  if (!store) throw new Error('useProductsStore must be inside ProductsProvider');
  return store;
}
