import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { WalletController } from './controllers/WalletController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function walletRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(WalletController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', controller.index.bind(controller));
  fastify.post('/', controller.store.bind(controller));
  fastify.put('/:id', controller.update.bind(controller));
  fastify.delete('/:id', controller.delete.bind(controller));
}
