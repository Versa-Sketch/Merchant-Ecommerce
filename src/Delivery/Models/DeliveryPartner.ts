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
    id: string; name: string; phone: string; isAvailable: boolean;
    currentOrdersCount: number; completedOrdersCount: number; rating: number; latitude: number; longitude: number;
  }) {
    this.id = data.id; this.name = data.name; this.phone = data.phone;
    this.isAvailable = data.isAvailable; this.currentOrdersCount = data.currentOrdersCount;
    this.completedOrdersCount = data.completedOrdersCount; this.rating = data.rating;
    this.latitude = data.latitude; this.longitude = data.longitude;
    makeAutoObservable(this);
  }

  toggleAvailability() { this.isAvailable = !this.isAvailable; }
  updateLocation(lat: number, lng: number) { this.latitude = lat; this.longitude = lng; }
  incrementCompleted() { this.completedOrdersCount += 1; this.currentOrdersCount = Math.max(0, this.currentOrdersCount - 1); }
  assignOrder() { this.currentOrdersCount += 1; }
}
