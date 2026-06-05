import { makeAutoObservable } from 'mobx';

export class SupportStore {
  constructor() { makeAutoObservable(this); }
}

export type SupportStoreType = SupportStore;
