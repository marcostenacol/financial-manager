import { inject, injectable } from 'tsyringe';
import { Invite } from '@prisma/client';
import { InviteRepositoryInterface } from '../repositories/contracts/InviteRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { CreateInviteDTOType } from '../dtos/CreateInviteDTO';
import { OrganizationMemberRoleEnum } from '../enums/OrganizationMemberRoleEnum';
import { generateInviteCode } from '../lib/generateInviteCode';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class CreateInviteService {
  constructor(
    @inject('InviteRepository')
    private inviteRepository: InviteRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(organizationId: string, data: CreateInviteDTOType, userId: string): Promise<Invite> {
    const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, userId);

    if (!membership || membership.role !== OrganizationMemberRoleEnum.OWNER) {
      throw new AppError('Apenas o dono da organização pode criar convites', 403);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expires_in_days);

    return this.inviteRepository.create({
      organizationId,
      code: generateInviteCode(),
      role: data.role,
      maxUses: data.max_uses,
      expiresAt,
      createdBy: userId,
    });
  }
}
