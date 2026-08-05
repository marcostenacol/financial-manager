import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { ReportController } from './controllers/ReportController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';
import { organizationContextMiddleware } from '@/shared/middlewares/OrganizationContextMiddleware';

export async function reportRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(ReportController);

  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', organizationContextMiddleware);

  fastify.get('/export', (request, reply) => controller.export(request, reply));
  fastify.get('/overview', (request, reply) => controller.overview(request, reply));
  fastify.get('/expenses-by-category', (request, reply) => controller.expensesByCategory(request, reply));
  fastify.get('/evolution', (request, reply) => controller.evolution(request, reply));
  fastify.get('/cash-flow-by-cost-center', (request, reply) => controller.cashFlowByCostCenter(request, reply));
}
