import { Notification, Prisma } from '@prisma/client';

export interface NotificationRepositoryInterface {
  create(data: Prisma.NotificationUncheckedCreateInput): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
}
