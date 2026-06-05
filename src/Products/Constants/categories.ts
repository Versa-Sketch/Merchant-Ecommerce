export const CATEGORIES = [
  'Grocery',
  'Pharmacy',
  'Fashion',
  'Electronics',
  'Restaurants',
  'Local Shops',
] as const;

export const ALL_CATEGORIES = ['All', ...CATEGORIES] as const;

export const GST_OPTIONS = ['0', '5', '12', '18', '28'] as const;

export const UNIT_OPTIONS = ['pieces', 'kg', 'g', 'L', 'ml', 'pack'] as const;
