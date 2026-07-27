import { Notification, Prisma } from '@prisma/client';
import { NotificationRepositoryInterface } from './contracts/NotificationRepositoryInterface';
import { prisma } from '@/shared/database/PrismaClient';
import { injectable } from 'tsyringe';

@injectable()
export class NotificationRepository implements NotificationRepositoryInterface {
  async create(data: Prisma.NotificationUncheckedCreateInput): Promise<Notification> {
    return prisma.notification.create({
      data,
    });
  }

  async update(id: string, data: Prisma.NotificationUncheckedUpdateInput): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async findAllByUserId(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
