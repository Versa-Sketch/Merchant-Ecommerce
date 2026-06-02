import { makeAutoObservable } from 'mobx';

export class ChartDataPoint {
  label: string;
  value: number;

  constructor(data: { label: string; value: number }) {
    this.label = data.label;
    this.value = data.value;
    makeAutoObservable(this);
  }
}

export class TopProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  image: string;

  constructor(data: { id: string; name: string; unitsSold: number; revenue: number; image: string }) {
    this.id = data.id;
    this.name = data.name;
    this.unitsSold = data.unitsSold;
    this.revenue = data.revenue;
    this.image = data.image;
    makeAutoObservable(this);
  }
}

export class CustomerSegment {
  id: string;
  name: string;
  ordersCount: number;
  lifetimeSpend: number;
  lastOrderDate: string;
  segment: 'Top' | 'Repeat' | 'High Value' | 'Inactive';

  constructor(data: {
    id: string;
    name: string;
    ordersCount: number;
    lifetimeSpend: number;
    lastOrderDate: string;
    segment: 'Top' | 'Repeat' | 'High Value' | 'Inactive';
  }) {
    this.id = data.id;
    this.name = data.name;
    this.ordersCount = data.ordersCount;
    this.lifetimeSpend = data.lifetimeSpend;
    this.lastOrderDate = data.lastOrderDate;
    this.segment = data.segment;
    makeAutoObservable(this);
  }
}

export class AnalyticsStore {
  salesToday: ChartDataPoint[] = [];
  weeklyRevenue: ChartDataPoint[] = [];
  monthlyRevenue: ChartDataPoint[] = [];
  categoryPerformance: ChartDataPoint[] = [];
  peakSellingHours: ChartDataPoint[] = [];
  topProducts: TopProduct[] = [];
  customers: CustomerSegment[] = [];
  repeatPurchaseRate: number = 72.4;
  customerRetentionRate: number = 84.2;

  constructor() {
    this.salesToday = [
      new ChartDataPoint({ label: '08:00', value: 1200 }),
      new ChartDataPoint({ label: '10:00', value: 2400 }),
      new ChartDataPoint({ label: '12:00', value: 1800 }),
      new ChartDataPoint({ label: '14:00', value: 1500 }),
      new ChartDataPoint({ label: '16:00', value: 2200 }),
      new ChartDataPoint({ label: '18:00', value: 3800 }),
      new ChartDataPoint({ label: '20:00', value: 4100 }),
      new ChartDataPoint({ label: '22:00', value: 1840 }),
    ];
    this.weeklyRevenue = [
      new ChartDataPoint({ label: 'Mon', value: 14200 }),
      new ChartDataPoint({ label: 'Tue', value: 12840 }),
      new ChartDataPoint({ label: 'Wed', value: 15100 }),
      new ChartDataPoint({ label: 'Thu', value: 16500 }),
      new ChartDataPoint({ label: 'Fri', value: 18200 }),
      new ChartDataPoint({ label: 'Sat', value: 22000 }),
      new ChartDataPoint({ label: 'Sun', value: 24500 }),
    ];
    this.monthlyRevenue = [
      new ChartDataPoint({ label: 'Jan', value: 340000 }),
      new ChartDataPoint({ label: 'Feb', value: 380000 }),
      new ChartDataPoint({ label: 'Mar', value: 420000 }),
      new ChartDataPoint({ label: 'Apr', value: 410000 }),
      new ChartDataPoint({ label: 'May', value: 480000 }),
      new ChartDataPoint({ label: 'Jun', value: 12840 }),
    ];
    this.categoryPerformance = [
      new ChartDataPoint({ label: 'Grocery', value: 45 }),
      new ChartDataPoint({ label: 'Pharmacy', value: 20 }),
      new ChartDataPoint({ label: 'Restaurants', value: 15 }),
      new ChartDataPoint({ label: 'Electronics', value: 10 }),
      new ChartDataPoint({ label: 'Fashion', value: 10 }),
    ];
    this.peakSellingHours = [
      new ChartDataPoint({ label: 'Morning', value: 25 }),
      new ChartDataPoint({ label: 'Afternoon', value: 15 }),
      new ChartDataPoint({ label: 'Evening', value: 45 }),
      new ChartDataPoint({ label: 'Night', value: 15 }),
    ];
    this.topProducts = [
      new TopProduct({ id: 'TP-01', name: 'Organic Roma Tomatoes', unitsSold: 124, revenue: 7440, image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=100' }),
      new TopProduct({ id: 'TP-02', name: 'Hass Avocados', unitsSold: 42, revenue: 12558, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100' }),
      new TopProduct({ id: 'TP-03', name: 'Gourmet Butter Chicken Rice Bowl', unitsSold: 38, revenue: 9462, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=100' }),
    ];
    this.customers = [
      new CustomerSegment({ id: 'C-01', name: 'Aarav Mehta', ordersCount: 24, lifetimeSpend: 18400, lastOrderDate: '2026-06-02', segment: 'Top' }),
      new CustomerSegment({ id: 'C-02', name: 'Neha Sharma', ordersCount: 15, lifetimeSpend: 9800, lastOrderDate: '2026-06-01', segment: 'Repeat' }),
      new CustomerSegment({ id: 'C-03', name: 'Rohan Gupta', ordersCount: 8, lifetimeSpend: 14500, lastOrderDate: '2026-05-28', segment: 'High Value' }),
      new CustomerSegment({ id: 'C-04', name: 'Siddharth Sen', ordersCount: 2, lifetimeSpend: 450, lastOrderDate: '2026-04-15', segment: 'Inactive' }),
    ];
    makeAutoObservable(this);
  }

  get topCustomers() {
    return this.customers.filter((c) => c.segment === 'Top');
  }

  get repeatCustomers() {
    return this.customers.filter((c) => c.segment === 'Repeat');
  }

  get highValueCustomers() {
    return this.customers.filter((c) => c.segment === 'High Value');
  }

  get inactiveCustomers() {
    return this.customers.filter((c) => c.segment === 'Inactive');
  }

  recordSale(amount: number, category: string) {
    const cat = this.categoryPerformance.find((c) => c.label === category);
    if (cat) cat.value += 1;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const salePt = this.salesToday.find((pt) => pt.label === nowStr);
    if (salePt) {
      salePt.value += amount;
    } else {
      this.salesToday.push(new ChartDataPoint({ label: nowStr, value: amount }));
    }
  }
}

export type AnalyticsStoreType = AnalyticsStore;
