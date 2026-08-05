import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { RecurrenceController } from './controllers/RecurrenceController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';
import { organizationContextMiddleware } from '@/shared/middlewares/OrganizationContextMiddleware';

export async function recurrenceRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(RecurrenceController);

  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', organizationContextMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.put('/:id', (request, reply) => controller.update(request, reply));
  fastify.patch('/:id/toggle', (request, reply) => controller.toggle(request, reply));
  fastify.patch('/:id/cancel', (request, reply) => controller.cancel(request, reply));
  fastify.post('/:id/run', (request, reply) => controller.runNow(request, reply));
  fastify.delete('/clear-all', (request, reply) => controller.clearAll(request, reply));
}
