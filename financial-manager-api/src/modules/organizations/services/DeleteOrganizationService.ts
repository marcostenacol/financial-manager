import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { OrganizationRepositoryInterface } from '../repositories/contracts/OrganizationRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { InviteRepositoryInterface } from '../repositories/contracts/InviteRepositoryInterface';
import { InviteRedemptionRepositoryInterface } from '../repositories/contracts/InviteRedemptionRepositoryInterface';
import { OrganizationMemberRoleEnum } from '../enums/OrganizationMemberRoleEnum';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class DeleteOrganizationService {
  constructor(
    @inject('OrganizationRepository')
    private organizationRepository: OrganizationRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,

    @inject('InviteRepository')
    private inviteRepository: InviteRepositoryInterface,

    @inject('InviteRedemptionRepository')
    private inviteRedemptionRepository: InviteRedemptionRepositoryInterface,
  ) {}

  async execute(organizationId: string, userId: string): Promise<void> {
    const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, userId);

    if (!membership || membership.role !== OrganizationMemberRoleEnum.OWNER) {
      throw new AppError('Apenas o dono da organização pode excluí-la', 403);
    }

    const linkedRecords = await this.organizationRepository.countLinkedRecords(organizationId);

    if (linkedRecords > 0) {
      throw new AppError('Mova ou exclua as carteiras, categorias, centros de custo e metas desta organização antes de excluí-la', 409);
    }

    await prisma.$transaction(async (tx) => {
      await this.inviteRedemptionRepository.deleteAllByOrganizationId(organizationId, tx);
      await this.inviteRepository.deleteAllByOrganizationId(organizationId, tx);
      await this.organizationMemberRepository.deleteAllByOrganizationId(organizationId, tx);
      await this.organizationRepository.delete(organizationId, tx);
    });
  }
}
