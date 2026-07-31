import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { ListNotificationsService } from '../services/ListNotificationsService';
import { MarkNotificationAsReadService } from '../services/MarkNotificationAsReadService';
import { MarkAllNotificationsAsReadService } from '../services/MarkAllNotificationsAsReadService';
import { DeleteNotificationService } from '../services/DeleteNotificationService';

@injectable()
export class NotificationController extends BaseController {
  constructor(
    @inject('ListNotificationsService') private listNotifications: ListNotificationsService,
    @inject('MarkNotificationAsReadService') private markAsRead: MarkNotificationAsReadService,
    @inject('MarkAllNotificationsAsReadService') private markAllAsRead: MarkAllNotificationsAsReadService,
    @inject('DeleteNotificationService') private deleteNotification: DeleteNotificationService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const notifications = await this.listNotifications.execute(userId);
    return this.success(reply, notifications);
  }

  async markAsReadHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const notification = await this.markAsRead.execute(id, userId);
    return this.success(reply, notification, 'Notificação marcada como lida');
  }

  async markAllAsReadHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    await this.markAllAsRead.execute(userId);
    return this.success(reply, null, 'Todas as notificações foram marcadas como lidas');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    await this.deleteNotification.execute(id, userId);
    return this.success(reply, null, 'Notificação removida com sucesso');
  }
}
