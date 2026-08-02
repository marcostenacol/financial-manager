import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { RecurrenceController } from './controllers/RecurrenceController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function recurrenceRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(RecurrenceController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.patch('/:id/toggle', (request, reply) => controller.toggle(request, reply));
  fastify.patch('/:id/cancel', (request, reply) => controller.cancel(request, reply));
  fastify.delete('/clear-all', (request, reply) => controller.clearAll(request, reply));
}
