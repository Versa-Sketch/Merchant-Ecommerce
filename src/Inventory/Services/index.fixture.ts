export const adjustmentFixtures = [
  { id: 'ADJ-101', productId: 'PRD-1001', productName: 'Organic Roma Tomatoes 1kg', date: '2026-06-02 11:30 AM', type: 'Stock In' as const, qtyChanged: 20, resultingQty: 45 },
  { id: 'ADJ-102', productId: 'PRD-1002', productName: 'Hass Avocados (2 units)', date: '2026-06-01 04:15 PM', type: 'Audit Adjustment' as const, qtyChanged: -2, resultingQty: 3 },
  { id: 'ADJ-103', productId: 'PRD-1005', productName: 'Noise ColorFit Pulse Smartwatch', date: '2026-05-30 02:00 PM', type: 'Damaged' as const, qtyChanged: -1, resultingQty: 0 },
];

export const alertFixtures = [
  { id: 'ALT-201', productId: 'PRD-1002', productName: 'Hass Avocados (2 units)', currentStock: 3, threshold: 10, date: '2 hrs ago' },
  { id: 'ALT-202', productId: 'PRD-1005', productName: 'Noise ColorFit Pulse Smartwatch', currentStock: 0, threshold: 5, date: 'Yesterday' },
];
