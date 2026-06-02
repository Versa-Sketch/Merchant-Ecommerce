import { types } from 'mobx-state-tree';

export const ChartDataPoint = types.model('ChartDataPoint', {
  label: types.string,
  value: types.number,
});

export const TopProduct = types.model('TopProduct', {
  id: types.identifier,
  name: types.string,
  unitsSold: types.number,
  revenue: types.number,
  image: types.string,
});

export const CustomerSegment = types.model('CustomerSegment', {
  id: types.identifier,
  name: types.string,
  ordersCount: types.number,
  lifetimeSpend: types.number,
  lastOrderDate: types.string,
  segment: types.enumeration('SegmentType', ['Top', 'Repeat', 'High Value', 'Inactive']),
});

export const AnalyticsStore = types
  .model('AnalyticsStore', {
    salesToday: types.optional(types.array(ChartDataPoint), [
      { label: '08:00', value: 1200 },
      { label: '10:00', value: 2400 },
      { label: '12:00', value: 1800 },
      { label: '14:00', value: 1500 },
      { label: '16:00', value: 2200 },
      { label: '18:00', value: 3800 },
      { label: '20:00', value: 4100 },
      { label: '22:00', value: 1840 },
    ]),
    weeklyRevenue: types.optional(types.array(ChartDataPoint), [
      { label: 'Mon', value: 14200 },
      { label: 'Tue', value: 12840 },
      { label: 'Wed', value: 15100 },
      { label: 'Thu', value: 16500 },
      { label: 'Fri', value: 18200 },
      { label: 'Sat', value: 22000 },
      { label: 'Sun', value: 24500 },
    ]),
    monthlyRevenue: types.optional(types.array(ChartDataPoint), [
      { label: 'Jan', value: 340000 },
      { label: 'Feb', value: 380000 },
      { label: 'Mar', value: 420000 },
      { label: 'Apr', value: 410000 },
      { label: 'May', value: 480000 },
      { label: 'Jun', value: 12840 },
    ]),
    categoryPerformance: types.optional(types.array(ChartDataPoint), [
      { label: 'Grocery', value: 45 },
      { label: 'Pharmacy', value: 20 },
      { label: 'Restaurants', value: 15 },
      { label: 'Electronics', value: 10 },
      { label: 'Fashion', value: 10 },
    ]),
    peakSellingHours: types.optional(types.array(ChartDataPoint), [
      { label: 'Morning', value: 25 },
      { label: 'Afternoon', value: 15 },
      { label: 'Evening', value: 45 },
      { label: 'Night', value: 15 },
    ]),
    topProducts: types.optional(types.array(TopProduct), [
      { id: 'TP-01', name: 'Organic Roma Tomatoes', unitsSold: 124, revenue: 7440, image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=100' },
      { id: 'TP-02', name: 'Hass Avocados', unitsSold: 42, revenue: 12558, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100' },
      { id: 'TP-03', name: 'Gourmet Butter Chicken Rice Bowl', unitsSold: 38, revenue: 9462, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=100' },
    ]),
    customers: types.optional(types.array(CustomerSegment), [
      { id: 'C-01', name: 'Aarav Mehta', ordersCount: 24, lifetimeSpend: 18400, lastOrderDate: '2026-06-02', segment: 'Top' },
      { id: 'C-02', name: 'Neha Sharma', ordersCount: 15, lifetimeSpend: 9800, lastOrderDate: '2026-06-01', segment: 'Repeat' },
      { id: 'C-03', name: 'Rohan Gupta', ordersCount: 8, lifetimeSpend: 14500, lastOrderDate: '2026-05-28', segment: 'High Value' },
      { id: 'C-04', name: 'Siddharth Sen', ordersCount: 2, lifetimeSpend: 450, lastOrderDate: '2026-04-15', segment: 'Inactive' },
    ]),
    repeatPurchaseRate: types.optional(types.number, 72.4),
    customerRetentionRate: types.optional(types.number, 84.2),
  })
  .views((self) => ({
    get topCustomers() {
      return self.customers.filter((c) => c.segment === 'Top');
    },
    get repeatCustomers() {
      return self.customers.filter((c) => c.segment === 'Repeat');
    },
    get highValueCustomers() {
      return self.customers.filter((c) => c.segment === 'High Value');
    },
    get inactiveCustomers() {
      return self.customers.filter((c) => c.segment === 'Inactive');
    },
  }))
  .actions((self) => ({
    recordSale(amount: number, category: string) {
      // update categories
      const cat = self.categoryPerformance.find((c) => c.label === category);
      if (cat) cat.value += 1;

      // update today sales
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const salePt = self.salesToday.find((pt) => pt.label === nowStr);
      if (salePt) {
        salePt.value += amount;
      } else {
        self.salesToday.push({ label: nowStr, value: amount });
      }
    },
  }));
export type AnalyticsStoreType = typeof AnalyticsStore;
