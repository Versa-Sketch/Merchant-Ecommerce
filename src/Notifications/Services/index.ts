import type { notificationFixtures } from './index.fixture';
export interface INotificationsService { fetchNotifications(): Promise<typeof notificationFixtures>; }
