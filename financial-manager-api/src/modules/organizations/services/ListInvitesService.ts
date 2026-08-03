import { inject, injectable } from 'tsyringe';
import { Invite } from '@prisma/client';
import { InviteRepositoryInterface } from '../repositories/contracts/InviteRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { OrganizationMemberRoleEnum } from '../enums/OrganizationMemberRoleEnum';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class ListInvitesService {
  constructor(
    @inject('InviteRepository')
    private inviteRepository: InviteRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(organizationId: string, userId: string): Promise<Invite[]> {
    const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, userId);

    if (!membership || membership.role !== OrganizationMemberRoleEnum.OWNER) {
      throw new AppError('Apenas o dono da organização pode ver os convites', 403);
    }

    return this.inviteRepository.findAllByOrganizationId(organizationId);
  }
}
