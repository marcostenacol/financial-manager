import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { InviteRepositoryInterface } from '../repositories/contracts/InviteRepositoryInterface';
import { InviteRedemptionRepositoryInterface } from '../repositories/contracts/InviteRedemptionRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { OrganizationMemberRoleEnum } from '../enums/OrganizationMemberRoleEnum';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class DeleteInviteService {
  constructor(
    @inject('InviteRepository')
    private inviteRepository: InviteRepositoryInterface,

    @inject('InviteRedemptionRepository')
    private inviteRedemptionRepository: InviteRedemptionRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(organizationId: string, inviteId: string, userId: string): Promise<void> {
    const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, userId);

    if (!membership || membership.role !== OrganizationMemberRoleEnum.OWNER) {
      throw new AppError('Apenas o dono da organização pode excluir convites', 403);
    }

    const invite = await this.inviteRepository.findById(inviteId);

    if (!invite || invite.organizationId !== organizationId) {
      throw new AppError('Convite não encontrado', 404);
    }

    await prisma.$transaction(async (tx) => {
      await this.inviteRedemptionRepository.deleteAllByInviteId(inviteId, tx);
      await this.inviteRepository.delete(inviteId, tx);
    });
  }
}
