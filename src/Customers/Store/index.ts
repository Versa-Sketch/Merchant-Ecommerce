import { makeAutoObservable } from 'mobx';
import { CustomerSegment } from '../Models/CustomerSegment';
import { customerFixtures } from '../Services/index.fixture';

export class CustomersStore {
  customers: CustomerSegment[] = [];

  constructor() {
    this.customers = customerFixtures.map((data) => new CustomerSegment(data));
    makeAutoObservable(this);
  }

  get topCustomers() { return this.customers.filter((c) => c.segment === 'Top'); }
  get repeatCustomers() { return this.customers.filter((c) => c.segment === 'Repeat'); }
  get highValueCustomers() { return this.customers.filter((c) => c.segment === 'High Value'); }
  get inactiveCustomers() { return this.customers.filter((c) => c.segment === 'Inactive'); }
}

export type CustomersStoreType = CustomersStore;
