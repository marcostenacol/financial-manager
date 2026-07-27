import { inject, injectable } from 'tsyringe';
import { Notification } from '@prisma/client';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class ListNotificationsService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<Notification[]> {
    const cacheKey = `notifications:user:${userId}`;

    const cachedNotifications = await this.cache.get<Notification[]>(cacheKey);
    if (cachedNotifications) {
      return cachedNotifications;
    }

    const notifications = await this.notificationRepository.findAllByUserId(userId);

    await this.cache.set(cacheKey, notifications);

    return notifications;
  }
}
