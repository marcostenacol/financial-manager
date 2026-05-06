import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TransactionController } from './controllers/TransactionController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function transactionRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(TransactionController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.get('/:id', (request, reply) => controller.show(request, reply));
  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.put('/:id', (request, reply) => controller.update(request, reply));
  fastify.delete('/:id', (request, reply) => controller.delete(request, reply));
  fastify.post('/transfer', (request, reply) => controller.transfer(request, reply));
}
