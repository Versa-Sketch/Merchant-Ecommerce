import type { insightFixtures } from './index.fixture';
export interface IDashboardService { fetchInsights(): Promise<typeof insightFixtures>; }
