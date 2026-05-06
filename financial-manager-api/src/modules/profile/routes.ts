import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { ProfileController } from './controllers/ProfileController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(ProfileController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/me', controller.show.bind(controller));
  fastify.put('/me', controller.update.bind(controller));
  fastify.patch('/me/type', controller.changeType.bind(controller));
}
