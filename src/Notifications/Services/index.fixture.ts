export const notificationFixtures = [
  { id: 'NOT-001', title: 'New Bargain Request', message: 'Amit Saxena offered ₹50/kg for Organic Roma Tomatoes (MRP ₹80).', type: 'new_bargain' as const, time: '2 mins ago', isRead: false },
  { id: 'NOT-002', title: 'New Order Received', message: 'Rahul Verma placed an order ORD-8492 of amount ₹694.', type: 'new_order' as const, time: '10 mins ago', isRead: false },
  { id: 'NOT-003', title: 'Low Stock Warning', message: 'Hass Avocados (2 units) is low on stock. Only 3 packs remaining.', type: 'low_stock' as const, time: '2 hrs ago', isRead: true },
  { id: 'NOT-004', title: 'Support Ticket #T-4091', message: 'Wrong Product complaint filed by customer Meera Nair.', type: 'support_ticket' as const, time: '3 hrs ago', isRead: true },
];
