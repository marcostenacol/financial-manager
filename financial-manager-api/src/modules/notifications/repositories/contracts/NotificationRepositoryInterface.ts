import { Notification, Prisma } from '@prisma/client';

export interface NotificationRepositoryInterface {
  create(data: Prisma.NotificationUncheckedCreateInput): Promise<Notification>;
  update(id: string, data: Prisma.NotificationUncheckedUpdateInput): Promise<Notification>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  findAllByUserId(userId: string): Promise<Notification[]>;
  markAllAsRead(userId: string): Promise<void>;
}
