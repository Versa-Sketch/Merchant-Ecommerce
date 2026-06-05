import { makeAutoObservable } from 'mobx';

export class Product {
  id: string;
  name: string;
  description: string;
  category: string;
  mrp: number;
  sellingPrice: number;
  gst: number;
  stock: number;
  image: string;
  startDate: string;
  expiryDate: string;
  validityDate: string;
  showUntilDays: number;
  status: 'Active' | 'Low Stock' | 'Out Of Stock' | 'Hidden';

  constructor(data: {
    id: string;
    name: string;
    description: string;
    category: string;
    mrp: number;
    sellingPrice: number;
    gst: number;
    stock: number;
    image: string;
    startDate?: string;
    expiryDate?: string;
    validityDate?: string;
    showUntilDays?: number;
    status?: 'Active' | 'Low Stock' | 'Out Of Stock' | 'Hidden';
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.mrp = data.mrp;
    this.sellingPrice = data.sellingPrice;
    this.gst = data.gst;
    this.stock = data.stock;
    this.image = data.image;
    this.startDate = data.startDate ?? '2026-06-01';
    this.expiryDate = data.expiryDate ?? '2026-12-31';
    this.validityDate = data.validityDate ?? '2026-12-31';
    this.showUntilDays = data.showUntilDays ?? 180;
    this.status = data.status ?? 'Active';
    makeAutoObservable(this);
  }

  updateStock(amount: number) {
    this.stock = amount;
    if (this.stock === 0) {
      this.status = 'Out Of Stock';
    } else if (this.stock < 10) {
      this.status = 'Low Stock';
    } else if (this.status !== 'Hidden') {
      this.status = 'Active';
    }
  }

  toggleHide() {
    if (this.status === 'Hidden') {
      this.status = this.stock === 0 ? 'Out Of Stock' : this.stock < 10 ? 'Low Stock' : 'Active';
    } else {
      this.status = 'Hidden';
    }
  }

  updateDetails(details: {
    name?: string;
    description?: string;
    category?: string;
    mrp?: number;
    sellingPrice?: number;
    gst?: number;
    stock?: number;
    startDate?: string;
    expiryDate?: string;
    validityDate?: string;
    showUntilDays?: number;
  }) {
    Object.assign(this, details);
  }
}
