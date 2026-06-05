import type { ticketFixtures } from './index.fixture';
export interface ISupportService { fetchTickets(): Promise<typeof ticketFixtures>; }
