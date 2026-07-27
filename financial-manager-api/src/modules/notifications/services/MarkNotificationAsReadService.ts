import { inject, injectable } from 'tsyringe';
import { Notification } from '@prisma/client';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class MarkNotificationAsReadService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification || notification.userId !== userId) {
      throw new AppError('Notificação não encontrada', 404);
    }

    const updated = await this.notificationRepository.update(id, { read: true });

    await this.cache.del(`notifications:user:${userId}`);

    return updated;
  }
}
