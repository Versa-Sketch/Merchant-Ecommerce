import { types } from 'mobx-state-tree';

export const Product = types
  .model('Product', {
    id: types.identifier,
    name: types.string,
    description: types.string,
    category: types.string,
    mrp: types.number,
    sellingPrice: types.number,
    gst: types.number,
    stock: types.number,
    image: types.string,
    startDate: types.optional(types.string, '2026-06-01'),
    expiryDate: types.optional(types.string, '2026-12-31'),
    validityDate: types.optional(types.string, '2026-12-31'),
    showUntilDays: types.optional(types.number, 180),
    status: types.optional(types.enumeration('ProductStatus', ['Active', 'Low Stock', 'Out Of Stock', 'Hidden']), 'Active'),
  })
  .actions((self) => ({
    updateStock(amount: number) {
      self.stock = amount;
      if (self.stock === 0) {
        self.status = 'Out Of Stock';
      } else if (self.stock < 10) {
        self.status = 'Low Stock';
      } else if (self.status !== 'Hidden') {
        self.status = 'Active';
      }
    },
    toggleHide() {
      if (self.status === 'Hidden') {
        self.status = self.stock === 0 ? 'Out Of Stock' : (self.stock < 10 ? 'Low Stock' : 'Active');
      } else {
        self.status = 'Hidden';
      }
    },
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
      Object.assign(self, details);
    },
  }));

export const ProductsStore = types
  .model('ProductsStore', {
    products: types.optional(types.array(Product), [
      {
        id: 'PRD-1001',
        name: 'Organic Roma Tomatoes 1kg',
        description: 'Juicy, vine-ripened organic tomatoes. Sourced directly from local farmers.',
        category: 'Grocery',
        mrp: 80,
        sellingPrice: 60,
        gst: 5,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400',
        startDate: '2026-06-01',
        expiryDate: '2026-06-08',
        validityDate: '2026-06-08',
        showUntilDays: 6,
        status: 'Active',
      },
      {
        id: 'PRD-1002',
        name: 'Hass Avocados (2 units)',
        description: 'Ripe and creamy Hass Avocados. Perfect for homemade guacamole or salads.',
        category: 'Grocery',
        mrp: 350,
        sellingPrice: 299,
        gst: 0,
        stock: 3,
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
        startDate: '2026-06-01',
        expiryDate: '2026-06-10',
        validityDate: '2026-06-10',
        showUntilDays: 8,
        status: 'Low Stock',
      },
      {
        id: 'PRD-1003',
        name: 'Crocin Pain Relief Tablet (15s)',
        description: 'Fast acting relief from headache, body aches, and fever. Use with doctor recommendation.',
        category: 'Pharmacy',
        mrp: 120,
        sellingPrice: 110,
        gst: 12,
        stock: 85,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
        startDate: '2026-05-15',
        expiryDate: '2028-05-15',
        validityDate: '2028-05-15',
        showUntilDays: 700,
        status: 'Active',
      },
      {
        id: 'PRD-1004',
        name: 'Cotton Oversized Tee Black',
        description: 'Premium heavyweight cotton oversized t-shirt. Breathable and extremely durable.',
        category: 'Fashion',
        mrp: 999,
        sellingPrice: 599,
        gst: 12,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
        startDate: '2026-05-20',
        expiryDate: '2029-05-20',
        validityDate: '2029-05-20',
        showUntilDays: 1000,
        status: 'Active',
      },
      {
        id: 'PRD-1005',
        name: 'Noise ColorFit Pulse Smartwatch',
        description: 'Sleek smart watch with 1.4 inch screen, heart rate monitor, sleep tracking, and 10 day battery.',
        category: 'Electronics',
        mrp: 2999,
        sellingPrice: 1799,
        gst: 18,
        stock: 0,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
        startDate: '2026-04-10',
        expiryDate: '2030-04-10',
        validityDate: '2030-04-10',
        showUntilDays: 1400,
        status: 'Out Of Stock',
      },
      {
        id: 'PRD-1006',
        name: 'Gourmet Butter Chicken Rice Bowl',
        description: 'Rich and creamy butter chicken served over aromatic basmati rice. Freshly cooked.',
        category: 'Restaurants',
        mrp: 280,
        sellingPrice: 249,
        gst: 5,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        startDate: '2026-06-02',
        expiryDate: '2026-06-03',
        validityDate: '2026-06-03',
        showUntilDays: 1,
        status: 'Active',
      },
    ]),
  })
  .views((self) => ({
    get activeProducts() {
      return self.products.filter((p) => p.status === 'Active');
    },
    get lowStockProducts() {
      return self.products.filter((p) => p.status === 'Low Stock');
    },
    get outOfStockProducts() {
      return self.products.filter((p) => p.status === 'Out Of Stock');
    },
    get hiddenProducts() {
      return self.products.filter((p) => p.status === 'Hidden');
    },
  }))
  .actions((self) => ({
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
      const id = `PRD-${1000 + self.products.length + 1}`;
      const status = product.stock === 0 ? 'Out Of Stock' : (product.stock < 10 ? 'Low Stock' : 'Active');
      self.products.push({ id, ...product, status });
    },
    adjustStock(id: string, amount: number) {
      const product = self.products.find((p) => p.id === id);
      if (product) {
        product.updateStock(amount);
      }
    },
    toggleHideProduct(id: string) {
      const product = self.products.find((p) => p.id === id);
      if (product) {
        product.toggleHide();
      }
    },
  }));
export type ProductsStoreType = typeof ProductsStore;
