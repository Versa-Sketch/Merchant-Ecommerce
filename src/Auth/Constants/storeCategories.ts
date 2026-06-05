export const STORE_CATEGORIES = [
  { id: 'grocery', label: 'Grocery', icon: '🥦', description: 'Fresh produce, daily essentials' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊', description: 'Medicines, wellness products' },
  { id: 'fashion', label: 'Fashion', icon: '👕', description: 'Clothing, accessories, footwear' },
  { id: 'electronics', label: 'Electronics', icon: '📱', description: 'Gadgets, devices, accessories' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍕', description: 'Food, beverages, snacks' },
  { id: 'beauty', label: 'Beauty', icon: '💄', description: 'Skincare, cosmetics, personal care' },
  { id: 'stationery', label: 'Stationery', icon: '📚', description: 'Books, art supplies, office items' },
] as const;

export type StoreCategoryId = typeof STORE_CATEGORIES[number]['id'];
