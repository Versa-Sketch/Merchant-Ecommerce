import type { ISettingsService } from './index';
import type { storeProfileDefaults } from './index.fixture';
export class SettingsApiService implements ISettingsService {
  async fetchProfile(): Promise<typeof storeProfileDefaults> { throw new Error('Not implemented'); }
}
