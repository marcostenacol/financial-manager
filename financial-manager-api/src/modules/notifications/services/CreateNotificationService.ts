import { inject, injectable } from 'tsyringe';
import { Notification } from '@prisma/client';
import { NotificationRepositoryInterface } from '../repositories/contracts/NotificationRepositoryInterface';

interface Request {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

@injectable()
export class CreateNotificationService {
  constructor(
    @inject('NotificationRepository')
    private notificationRepository: NotificationRepositoryInterface,
  ) {}

  async execute({ userId, title, message, type }: Request): Promise<Notification> {
    return this.notificationRepository.create({
      userId,
      title,
      message,
      type,
    });
  }
}
