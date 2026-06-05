import type { INotificationsService } from './index';
import type { notificationFixtures } from './index.fixture';
export class NotificationsApiService implements INotificationsService {
  async fetchNotifications(): Promise<typeof notificationFixtures> { throw new Error('Not implemented'); }
}
