import type { IBargainingService } from './index';
import type { bargainFixtures } from './index.fixture';
export class BargainingApiService implements IBargainingService {
  async fetchBargains(): Promise<typeof bargainFixtures> { throw new Error('Not implemented'); }
}
