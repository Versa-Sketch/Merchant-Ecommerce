import { API_BASE } from '../../Auth/Constants/api';

// Shop Owner product catalog endpoints
export const CATALOG_ENDPOINTS = {
  PRODUCTS: `${API_BASE}/shops/shop-owner/products/`,
  PRODUCT: (productId: string) => `${API_BASE}/shops/shop-owner/products/${productId}/`,
  VARIANTS: (productId: string) => `${API_BASE}/shops/shop-owner/products/${productId}/variants/`,
  VARIANT: (productId: string, variantId: string) =>
    `${API_BASE}/shops/shop-owner/products/${productId}/variants/${variantId}/`,
  CATEGORY_UNITS: (categoryId: string) => `${API_BASE}/shops/categories/${categoryId}/units/`,
  CATEGORIES: `${API_BASE}/shops/shop-owner/categories/`,
  CATEGORY_DETAIL: (categoryId: string) => `${API_BASE}/shops/shop-owner/categories/${categoryId}/`,
} as const;
