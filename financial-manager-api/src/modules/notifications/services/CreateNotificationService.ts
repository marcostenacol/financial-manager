import { inject, injectable } from 'tsyringe';
import { Notification } from '@prisma/client';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';
import { CreateNotificationDTOType } from '../dtos/CreateNotificationDTO';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class CreateNotificationService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateNotificationDTOType, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      ...data,
      userId,
    });

    await this.cache.del(CacheKeys.notifications.list(userId));

    return notification;
  }
}
