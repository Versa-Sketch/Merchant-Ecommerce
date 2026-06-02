import { makeAutoObservable } from 'mobx';

export class DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
  currentOrdersCount: number;
  completedOrdersCount: number;
  rating: number;
  latitude: number;
  longitude: number;

  constructor(data: {
    id: string;
    name: string;
    phone: string;
    isAvailable: boolean;
    currentOrdersCount: number;
    completedOrdersCount: number;
    rating: number;
    latitude: number;
    longitude: number;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.isAvailable = data.isAvailable;
    this.currentOrdersCount = data.currentOrdersCount;
    this.completedOrdersCount = data.completedOrdersCount;
    this.rating = data.rating;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    makeAutoObservable(this);
  }

  toggleAvailability() {
    this.isAvailable = !this.isAvailable;
  }

  updateLocation(lat: number, lng: number) {
    this.latitude = lat;
    this.longitude = lng;
  }

  incrementCompleted() {
    this.completedOrdersCount += 1;
    this.currentOrdersCount = Math.max(0, this.currentOrdersCount - 1);
  }

  assignOrder() {
    this.currentOrdersCount += 1;
  }
}

export class DeliveryStore {
  partners: DeliveryPartner[] = [];

  constructor() {
    this.partners = [
      new DeliveryPartner({
        id: 'DP-01',
        name: 'Vinod Kumar',
        phone: '+91 91122 33445',
        isAvailable: true,
        currentOrdersCount: 1,
        completedOrdersCount: 24,
        rating: 4.9,
        latitude: 12.91414,
        longitude: 77.64132,
      }),
      new DeliveryPartner({
        id: 'DP-02',
        name: 'Rajesh Swamy',
        phone: '+91 92233 44556',
        isAvailable: true,
        currentOrdersCount: 1,
        completedOrdersCount: 18,
        rating: 4.7,
        latitude: 12.92345,
        longitude: 77.64876,
      }),
      new DeliveryPartner({
        id: 'DP-03',
        name: 'Amit Pal',
        phone: '+91 93344 55667',
        isAvailable: false,
        currentOrdersCount: 0,
        completedOrdersCount: 42,
        rating: 4.8,
        latitude: 12.90987,
        longitude: 77.63212,
      }),
      new DeliveryPartner({
        id: 'DP-04',
        name: 'Sandeep Singh',
        phone: '+91 94455 66778',
        isAvailable: true,
        currentOrdersCount: 0,
        completedOrdersCount: 12,
        rating: 4.5,
        latitude: 12.92712,
        longitude: 77.65345,
      }),
    ];
    makeAutoObservable(this);
  }

  get availablePartners() {
    return this.partners.filter((p) => p.isAvailable && p.currentOrdersCount < 3);
  }

  get activePartners() {
    return this.partners.filter((p) => p.isAvailable);
  }

  togglePartnerAvailability(id: string) {
    const partner = this.partners.find((p) => p.id === id);
    if (partner) {
      partner.toggleAvailability();
    }
  }

  assignDriverToOrder(partnerId: string) {
    const partner = this.partners.find((p) => p.id === partnerId);
    if (partner) {
      partner.assignOrder();
    }
  }

  simulateMovement() {
    this.partners.forEach((p) => {
      if (p.isAvailable && p.currentOrdersCount > 0) {
        const deltaLat = (Math.random() - 0.5) * 0.0008;
        const deltaLng = (Math.random() - 0.5) * 0.0008;
        p.updateLocation(p.latitude + deltaLat, p.longitude + deltaLng);
      }
    });
  }
}

export type DeliveryStoreType = DeliveryStore;
