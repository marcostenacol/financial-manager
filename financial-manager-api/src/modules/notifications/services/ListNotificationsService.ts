import { inject, injectable } from 'tsyringe';
import { Notification } from '@prisma/client';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';

@injectable()
export class ListNotificationsService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }
}
