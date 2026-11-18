import { inject, injectable } from 'tsyringe';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';

@injectable()
export class MarkAllNotificationsAsReadService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
