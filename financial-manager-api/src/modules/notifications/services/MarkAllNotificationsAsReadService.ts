import { inject, injectable } from 'tsyringe';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class MarkAllNotificationsAsReadService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);

    await this.cache.del(CacheKeys.notifications.list(userId));
  }
}
