import { makeAutoObservable } from 'mobx';
import { Product } from '../Models/Product';
import { productFixtures } from '../Services/index.fixture';

export class ProductsStore {
  products: Product[] = [];

  constructor() {
    this.products = productFixtures.map((data) => new Product(data));
    makeAutoObservable(this);
  }

  get activeProducts() {
    return this.products.filter((p) => p.status === 'Active');
  }

  get lowStockProducts() {
    return this.products.filter((p) => p.status === 'Low Stock');
  }

  get outOfStockProducts() {
    return this.products.filter((p) => p.status === 'Out Of Stock');
  }

  get hiddenProducts() {
    return this.products.filter((p) => p.status === 'Hidden');
  }

  addProduct(product: {
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
  }) {
    const id = `PRD-${1000 + this.products.length + 1}`;
    const status = product.stock === 0 ? 'Out Of Stock' : product.stock < 10 ? 'Low Stock' : 'Active';
    this.products.push(new Product({ id, ...product, status }));
  }

  deleteProduct(id: string) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) this.products.splice(index, 1);
  }

  adjustStock(id: string, amount: number) {
    const product = this.products.find((p) => p.id === id);
    if (product) product.updateStock(amount);
  }

  toggleHideProduct(id: string) {
    const product = this.products.find((p) => p.id === id);
    if (product) product.toggleHide();
  }
}

export type ProductsStoreType = ProductsStore;
