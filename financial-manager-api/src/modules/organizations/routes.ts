import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { OrganizationController } from './controllers/OrganizationController';
import { InviteController } from './controllers/InviteController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function organizationRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(OrganizationController);
  const inviteController = container.resolve(InviteController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.delete('/:id', (request, reply) => controller.delete(request, reply));
  fastify.get('/:id/members', (request, reply) => controller.members(request, reply));
  fastify.delete('/:id/members/:userId', (request, reply) => controller.removeMemberHandler(request, reply));
  fastify.patch('/:id/transfer-ownership', (request, reply) => controller.transferOwnershipHandler(request, reply));
  fastify.post('/:id/invites', (request, reply) => controller.storeInvite(request, reply));
  fastify.get('/:id/invites', (request, reply) => controller.indexInvites(request, reply));
  fastify.patch('/:id/invites/:inviteId/revoke', (request, reply) => controller.revokeInviteHandler(request, reply));
  fastify.delete('/:id/invites/:inviteId', (request, reply) => controller.deleteInviteHandler(request, reply));
  fastify.get('/:id/invites/:inviteId/redemptions', (request, reply) => controller.inviteRedemptions(request, reply));

  fastify.post('/invites/:code/redeem', (request, reply) => inviteController.redeem(request, reply));
}
