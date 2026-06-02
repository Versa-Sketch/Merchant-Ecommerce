import { types } from 'mobx-state-tree';

export const DeliveryPartner = types
  .model('DeliveryPartner', {
    id: types.identifier,
    name: types.string,
    phone: types.string,
    isAvailable: types.boolean,
    currentOrdersCount: types.number,
    completedOrdersCount: types.number,
    rating: types.number,
    latitude: types.number,
    longitude: types.number,
  })
  .actions((self) => ({
    toggleAvailability() {
      self.isAvailable = !self.isAvailable;
    },
    updateLocation(lat: number, lng: number) {
      self.latitude = lat;
      self.longitude = lng;
    },
    incrementCompleted() {
      self.completedOrdersCount += 1;
      self.currentOrdersCount = Math.max(0, self.currentOrdersCount - 1);
    },
    assignOrder() {
      self.currentOrdersCount += 1;
    },
  }));

export const DeliveryStore = types
  .model('DeliveryStore', {
    partners: types.optional(types.array(DeliveryPartner), [
      {
        id: 'DP-01',
        name: 'Vinod Kumar',
        phone: '+91 91122 33445',
        isAvailable: true,
        currentOrdersCount: 1,
        completedOrdersCount: 24,
        rating: 4.9,
        latitude: 12.91414,
        longitude: 77.64132,
      },
      {
        id: 'DP-02',
        name: 'Rajesh Swamy',
        phone: '+91 92233 44556',
        isAvailable: true,
        currentOrdersCount: 1,
        completedOrdersCount: 18,
        rating: 4.7,
        latitude: 12.92345,
        longitude: 77.64876,
      },
      {
        id: 'DP-03',
        name: 'Amit Pal',
        phone: '+91 93344 55667',
        isAvailable: false,
        currentOrdersCount: 0,
        completedOrdersCount: 42,
        rating: 4.8,
        latitude: 12.90987,
        longitude: 77.63212,
      },
      {
        id: 'DP-04',
        name: 'Sandeep Singh',
        phone: '+91 94455 66778',
        isAvailable: true,
        currentOrdersCount: 0,
        completedOrdersCount: 12,
        rating: 4.5,
        latitude: 12.92712,
        longitude: 77.65345,
      },
    ]),
  })
  .views((self) => ({
    get availablePartners() {
      return self.partners.filter((p) => p.isAvailable && p.currentOrdersCount < 3);
    },
    get activePartners() {
      return self.partners.filter((p) => p.isAvailable);
    },
  }))
  .actions((self) => ({
    togglePartnerAvailability(id: string) {
      const partner = self.partners.find((p) => p.id === id);
      if (partner) {
        partner.toggleAvailability();
      }
    },
    assignDriverToOrder(partnerId: string) {
      const partner = self.partners.find((p) => p.id === partnerId);
      if (partner) {
        partner.assignOrder();
      }
    },
    simulateMovement() {
      self.partners.forEach((p) => {
        if (p.isAvailable && p.currentOrdersCount > 0) {
          // Adjust location slightly closer to simulated hubs
          const deltaLat = (Math.random() - 0.5) * 0.0008;
          const deltaLng = (Math.random() - 0.5) * 0.0008;
          p.updateLocation(p.latitude + deltaLat, p.longitude + deltaLng);
        }
      });
    },
  }));
export type DeliveryStoreType = typeof DeliveryStore;
