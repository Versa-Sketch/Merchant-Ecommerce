export const insightFixtures = [
  { id: 'ins-1', title: 'Restock Tomatoes', message: 'Tomato demand is projected to rise 23% in the next 24 hours. Current stock is low.', type: 'warning' as const, actionLabel: 'Restock Now' },
  { id: 'ins-2', title: 'Peak Order Hours Inbound', message: 'Your store peaks between 6:00 PM and 8:00 PM on Tuesdays. Ensure sufficient delivery staff.', type: 'info' as const, actionLabel: 'Check Drivers' },
  { id: 'ins-3', title: 'Best Selling Product Today', message: 'Organic Avocado is your highest-performing item, generating ₹3,400 in revenue.', type: 'success' as const },
  { id: 'ins-4', title: 'Low Stock Alert', message: 'Double Toned Milk (1L) is below threshold. Only 3 units remaining.', type: 'warning' as const, actionLabel: 'Quick Refill' },
];
