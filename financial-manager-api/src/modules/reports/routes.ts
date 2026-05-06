import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { ReportController } from './controllers/ReportController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function reportRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(ReportController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/overview', (request, reply) => controller.overview(request, reply));
  fastify.get('/expenses-by-category', (request, reply) => controller.expensesByCategory(request, reply));
}
