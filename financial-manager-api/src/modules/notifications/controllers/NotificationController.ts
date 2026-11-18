import { FastifyReply, FastifyRequest } from 'fastify';
import { inject, injectable } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { ListNotificationsService } from '../services/ListNotificationsService';
import { MarkNotificationAsReadService } from '../services/MarkNotificationAsReadService';
import { MarkAllNotificationsAsReadService } from '../services/MarkAllNotificationsAsReadService';

@injectable()
export class NotificationController extends BaseController {
  constructor(
    @inject('ListNotificationsService') private listNotifications: ListNotificationsService,
    @inject('MarkNotificationAsReadService') private markAsRead: MarkNotificationAsReadService,
    @inject('MarkAllNotificationsAsReadService') private markAllAsRead: MarkAllNotificationsAsReadService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    const notifications = await this.listNotifications.execute(userId);
    return this.success(reply, notifications);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).sub;
    const notification = await this.markAsRead.execute(id, userId);
    return this.success(reply, notification);
  }

  async markAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    await this.markAllAsRead.execute(userId);
    return this.success(reply, null, 'Todas as notificações marcadas como lidas');
  }
}
