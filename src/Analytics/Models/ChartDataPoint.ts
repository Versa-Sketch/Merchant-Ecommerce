import { makeAutoObservable } from 'mobx';

export class ChartDataPoint {
  label: string;
  value: number;
  constructor(data: { label: string; value: number }) {
    this.label = data.label; this.value = data.value;
    makeAutoObservable(this);
  }
}

export class TopProduct {
  id: string; name: string; unitsSold: number; revenue: number; image: string;
  constructor(data: { id: string; name: string; unitsSold: number; revenue: number; image: string }) {
    this.id = data.id; this.name = data.name; this.unitsSold = data.unitsSold;
    this.revenue = data.revenue; this.image = data.image;
    makeAutoObservable(this);
  }
}
