import { inject, injectable } from 'tsyringe';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { OrganizationMemberRoleEnum } from '../enums/OrganizationMemberRoleEnum';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class RemoveMemberService {
  constructor(
    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(organizationId: string, targetUserId: string, requesterId: string): Promise<void> {
    const requesterMembership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, requesterId);

    if (!requesterMembership || requesterMembership.role !== OrganizationMemberRoleEnum.OWNER) {
      throw new AppError('Apenas o dono da organização pode remover membros', 403);
    }

    const targetMembership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, targetUserId);

    if (!targetMembership) {
      throw new AppError('Membro não encontrado', 404);
    }

    if (targetMembership.role === OrganizationMemberRoleEnum.OWNER) {
      const ownersCount = await this.organizationMemberRepository.countOwners(organizationId);

      if (ownersCount <= 1) {
        throw new AppError('A organização precisa de pelo menos um dono', 422);
      }
    }

    await this.organizationMemberRepository.delete(targetMembership.id);
  }
}
