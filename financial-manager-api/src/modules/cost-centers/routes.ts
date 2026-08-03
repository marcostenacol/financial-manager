import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { CostCenterController } from './controllers/CostCenterController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';
import { organizationContextMiddleware } from '@/shared/middlewares/OrganizationContextMiddleware';

export async function costCenterRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(CostCenterController);

  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', organizationContextMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.put('/:id', (request, reply) => controller.update(request, reply));
  fastify.delete('/:id', (request, reply) => controller.delete(request, reply));
}
