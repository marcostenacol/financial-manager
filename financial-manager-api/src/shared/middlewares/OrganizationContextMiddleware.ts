import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from 'tsyringe';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';

export async function organizationContextMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const repository = container.resolve<OrganizationMemberRepositoryInterface>('OrganizationMemberRepository');
  request.organizationIds = await repository.findOrganizationIdsByUserId(request.user.sub);
}
