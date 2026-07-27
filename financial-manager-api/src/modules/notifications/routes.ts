import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { NotificationController } from './controllers/NotificationController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(NotificationController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.patch('/:id/read', (request, reply) => controller.markAsReadHandler(request, reply));
  fastify.delete('/:id', (request, reply) => controller.delete(request, reply));
}
