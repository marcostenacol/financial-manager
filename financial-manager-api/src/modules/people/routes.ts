import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { PersonController } from './controllers/PersonController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';
import { organizationContextMiddleware } from '@/shared/middlewares/OrganizationContextMiddleware';

export async function personRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(PersonController);

  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', organizationContextMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.put('/:id', (request, reply) => controller.update(request, reply));
  fastify.delete('/:id', (request, reply) => controller.delete(request, reply));
  fastify.post('/:id/settle-debt', (request, reply) => controller.settleDebt(request, reply));
  fastify.get('/:id/pix-qrcode', (request, reply) => controller.pixQrCode(request, reply));
}
