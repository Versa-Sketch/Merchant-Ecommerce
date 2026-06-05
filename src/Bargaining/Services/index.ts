import type { bargainFixtures } from './index.fixture';
export interface IBargainingService { fetchBargains(): Promise<typeof bargainFixtures>; }
