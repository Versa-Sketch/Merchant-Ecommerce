import type { ISupportService } from './index';
import type { ticketFixtures } from './index.fixture';
export class SupportApiService implements ISupportService {
  async fetchTickets(): Promise<typeof ticketFixtures> { throw new Error('Not implemented'); }
}
