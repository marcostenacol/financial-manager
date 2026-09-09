import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { CreditCardController } from './controllers/CreditCardController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';
import { organizationContextMiddleware } from '@/shared/middlewares/OrganizationContextMiddleware';

export async function creditCardRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(CreditCardController);

  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', organizationContextMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.get('/:walletId/invoices', (request, reply) => controller.invoices(request, reply));
  fastify.get('/:walletId/invoices/:invoiceId', (request, reply) => controller.invoiceDetail(request, reply));
  fastify.post('/:walletId/invoices/:invoiceId/payments', (request, reply) => controller.storePayment(request, reply));
  fastify.delete('/:walletId/invoices/:invoiceId/payments/:paymentId', (request, reply) => controller.deletePayment(request, reply));
}
