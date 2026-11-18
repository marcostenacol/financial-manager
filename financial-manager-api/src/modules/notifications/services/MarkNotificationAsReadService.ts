import { inject, injectable } from 'tsyringe';
import { Notification } from '@prisma/client';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class MarkNotificationAsReadService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,
  ) {}

  async execute(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new AppError('Notificação não encontrada', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Não autorizado', 403);
    }

    return this.notificationRepository.markAsRead(id);
  }
}
