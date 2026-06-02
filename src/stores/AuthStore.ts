import { types } from 'mobx-state-tree';

export const AuthStore = types
  .model('AuthStore', {
    storeName: types.optional(types.string, 'FreshMart Hyperlocal'),
    ownerName: types.optional(types.string, 'Priya Sharma'),
    storeType: types.optional(types.string, 'Grocery'),
    logo: types.optional(types.string, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'),
    coverImage: types.optional(types.string, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'),
    description: types.optional(types.string, 'Providing organic farm-fresh fruits, vegetables, and daily essentials straight to your doorstep.'),
    timings: types.optional(types.string, '07:00 AM - 10:00 PM'),
    deliveryRadius: types.optional(types.number, 5.5), // in km
    minimumOrder: types.optional(types.number, 150), // in INR
    codEnabled: types.optional(types.boolean, true),
    surgeFee: types.optional(types.number, 20), // in INR
    refundPolicy: types.optional(types.string, 'Refunds approved for products returned within 24 hours of delivery in original packaging.'),
    returnPolicy: types.optional(types.string, 'Easy return on spot or within 24 hours for fresh items.'),
    cancellationWindow: types.optional(types.number, 5), // in minutes
    isAuthenticated: types.optional(types.boolean, true),
  })
  .actions((self) => ({
    updateSettings(fields: {
      storeName?: string;
      ownerName?: string;
      description?: string;
      timings?: string;
      deliveryRadius?: number;
      minimumOrder?: number;
      codEnabled?: boolean;
      surgeFee?: number;
      refundPolicy?: string;
      returnPolicy?: string;
      cancellationWindow?: number;
    }) {
      Object.assign(self, fields);
    },
    toggleCOD() {
      self.codEnabled = !self.codEnabled;
    },
  }));
export type AuthStoreType = typeof AuthStore;
