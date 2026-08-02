import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { SavingsGoalController } from './controllers/SavingsGoalController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function savingsGoalRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(SavingsGoalController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.put('/:id', (request, reply) => controller.update(request, reply));
  fastify.delete('/:id', (request, reply) => controller.delete(request, reply));
  fastify.delete('/clear-all', (request, reply) => controller.clearAll(request, reply));
}
