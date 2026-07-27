import { inject, injectable } from 'tsyringe';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class DeleteNotificationService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification || notification.userId !== userId) {
      throw new AppError('Notificação não encontrada', 404);
    }

    await this.notificationRepository.delete(id);

    await this.cache.del(`notifications:user:${userId}`);
  }
}
