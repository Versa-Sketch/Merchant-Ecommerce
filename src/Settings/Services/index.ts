import type { storeProfileDefaults } from './index.fixture';
export interface ISettingsService { fetchProfile(): Promise<typeof storeProfileDefaults>; }
