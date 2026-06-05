export const bargainFixtures = [
  {
    id: 'BAR-3091', customerName: 'Amit Saxena', productId: 'PRD-1001',
    productName: 'Organic Roma Tomatoes 1kg',
    productImage: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400',
    originalPrice: 80, currentPrice: 60, customerOffer: 50, merchantCost: 35,
    potentialProfit: 15, status: 'Pending' as const, expirationTime: 240,
    timeline: [
      { id: '1', sender: 'system' as const, message: 'Bargain request initiated by Amit.', time: '2 mins ago' },
      { id: '2', sender: 'customer' as const, message: 'Looking to buy 3 kgs. Can I get it for ₹50/kg?', time: '2 mins ago', price: 50 },
    ],
    history: [50],
  },
  {
    id: 'BAR-3092', customerName: 'Karan Malhotra', productId: 'PRD-1004',
    productName: 'Cotton Oversized Tee Black',
    productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
    originalPrice: 999, currentPrice: 599, customerOffer: 480, merchantCost: 320,
    potentialProfit: 160, status: 'Pending' as const, expirationTime: 580,
    timeline: [
      { id: '3', sender: 'system' as const, message: 'Bargain request initiated by Karan.', time: '5 mins ago' },
      { id: '4', sender: 'customer' as const, message: 'Hey, ₹599 is a bit high. How about ₹480?', time: '5 mins ago', price: 480 },
    ],
    history: [480],
  },
  {
    id: 'BAR-3088', customerName: 'Sneha Patil', productId: 'PRD-1002',
    productName: 'Hass Avocados (2 units)',
    productImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
    originalPrice: 350, currentPrice: 299, customerOffer: 250, merchantCost: 200,
    potentialProfit: 50, status: 'Accepted' as const, expirationTime: 0,
    timeline: [
      { id: '5', sender: 'system' as const, message: 'Bargain request initiated by Sneha.', time: '1 hr ago' },
      { id: '6', sender: 'customer' as const, message: 'Will buy if you give it for ₹250.', time: '58 mins ago', price: 250 },
      { id: '7', sender: 'system' as const, message: 'Offer of ₹250 accepted by merchant. Order generated!', time: '55 mins ago' },
    ],
    history: [250],
  },
  {
    id: 'BAR-3085', customerName: 'Rohan Shah', productId: 'PRD-1006',
    productName: 'Gourmet Butter Chicken Rice Bowl',
    productImage: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    originalPrice: 280, currentPrice: 249, customerOffer: 180, merchantCost: 170,
    potentialProfit: 10, status: 'Rejected' as const, expirationTime: 0,
    timeline: [
      { id: '8', sender: 'system' as const, message: 'Bargain request initiated by Rohan.', time: '2 hrs ago' },
      { id: '9', sender: 'customer' as const, message: 'Can I get this for ₹180?', time: '2 hrs ago', price: 180 },
      { id: '10', sender: 'system' as const, message: 'Offer rejected by merchant.', time: '1 hr 55 mins ago' },
    ],
    history: [180],
  },
];
