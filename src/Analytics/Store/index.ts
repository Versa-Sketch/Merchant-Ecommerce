import { makeAutoObservable } from 'mobx';
import { ChartDataPoint, TopProduct } from '../Models/ChartDataPoint';
import { analyticsFixtures } from '../Services/index.fixture';

export class AnalyticsStore {
  salesToday: ChartDataPoint[] = [];
  weeklyRevenue: ChartDataPoint[] = [];
  monthlyRevenue: ChartDataPoint[] = [];
  categoryPerformance: ChartDataPoint[] = [];
  peakSellingHours: ChartDataPoint[] = [];
  topProducts: TopProduct[] = [];
  repeatPurchaseRate: number = 72.4;
  customerRetentionRate: number = 84.2;

  constructor() {
    const f = analyticsFixtures;
    this.salesToday = f.salesToday.map((d) => new ChartDataPoint(d));
    this.weeklyRevenue = f.weeklyRevenue.map((d) => new ChartDataPoint(d));
    this.monthlyRevenue = f.monthlyRevenue.map((d) => new ChartDataPoint(d));
    this.categoryPerformance = f.categoryPerformance.map((d) => new ChartDataPoint(d));
    this.peakSellingHours = f.peakSellingHours.map((d) => new ChartDataPoint(d));
    this.topProducts = f.topProducts.map((d) => new TopProduct(d));
    makeAutoObservable(this);
  }

  recordSale(amount: number, category: string) {
    const cat = this.categoryPerformance.find((c) => c.label === category);
    if (cat) cat.value += 1;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const salePt = this.salesToday.find((pt) => pt.label === nowStr);
    if (salePt) { salePt.value += amount; } else { this.salesToday.push(new ChartDataPoint({ label: nowStr, value: amount })); }
  }
}

export type AnalyticsStoreType = AnalyticsStore;
