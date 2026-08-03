import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { CategoryController } from './controllers/CategoryController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';
import { organizationContextMiddleware } from '@/shared/middlewares/OrganizationContextMiddleware';

export async function categoryRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(CategoryController);

  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', organizationContextMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.put('/:id', (request, reply) => controller.update(request, reply));
  fastify.delete('/:id', (request, reply) => controller.delete(request, reply));
}
