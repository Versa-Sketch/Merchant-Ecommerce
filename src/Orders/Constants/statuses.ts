import { Colors } from '../../theme/colors';

export const ORDER_STATUSES = [
  { key: 'New Orders', label: 'New', dot: Colors.accent },
  { key: 'Accepted', label: 'Accepted', dot: Colors.primary },
  { key: 'Packed', label: 'Packed', dot: Colors.info },
  { key: 'Out For Delivery', label: 'On the way', dot: Colors.warning },
  { key: 'Delivered', label: 'Delivered', dot: Colors.success },
  { key: 'Cancelled', label: 'Cancelled', dot: Colors.error },
] as const;
