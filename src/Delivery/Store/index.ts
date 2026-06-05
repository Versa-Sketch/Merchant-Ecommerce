import { makeAutoObservable } from 'mobx';
import { DeliveryPartner } from '../Models/DeliveryPartner';
import { deliveryPartnerFixtures } from '../Services/index.fixture';

export class DeliveryStore {
  partners: DeliveryPartner[] = [];

  constructor() {
    this.partners = deliveryPartnerFixtures.map((data) => new DeliveryPartner(data));
    makeAutoObservable(this);
  }

  get availablePartners() { return this.partners.filter((p) => p.isAvailable && p.currentOrdersCount < 3); }
  get activePartners() { return this.partners.filter((p) => p.isAvailable); }

  togglePartnerAvailability(id: string) { this.partners.find((p) => p.id === id)?.toggleAvailability(); }
  assignDriverToOrder(partnerId: string) { this.partners.find((p) => p.id === partnerId)?.assignOrder(); }

  simulateMovement() {
    this.partners.forEach((p) => {
      if (p.isAvailable && p.currentOrdersCount > 0) {
        p.updateLocation(p.latitude + (Math.random() - 0.5) * 0.0008, p.longitude + (Math.random() - 0.5) * 0.0008);
      }
    });
  }
}

export type DeliveryStoreType = DeliveryStore;
