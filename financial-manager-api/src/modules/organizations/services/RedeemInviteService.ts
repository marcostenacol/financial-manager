import { inject, injectable } from 'tsyringe';
import { OrganizationMember } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { InviteRepositoryInterface } from '../repositories/contracts/InviteRepositoryInterface';
import { InviteRedemptionRepositoryInterface } from '../repositories/contracts/InviteRedemptionRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class RedeemInviteService {
  constructor(
    @inject('InviteRepository')
    private inviteRepository: InviteRepositoryInterface,

    @inject('InviteRedemptionRepository')
    private inviteRedemptionRepository: InviteRedemptionRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(code: string, userId: string): Promise<OrganizationMember> {
    const invite = await this.inviteRepository.findByCode(code);

    if (!invite) {
      throw new AppError('Código de convite inválido', 404);
    }

    this.assertRedeemable(invite);

    const existingMembership = await this.organizationMemberRepository.findByOrganizationAndUser(
      invite.organizationId,
      userId,
    );

    if (existingMembership) {
      throw new AppError('Você já faz parte desta organização', 422);
    }

    return prisma.$transaction(async (tx) => {
      const membership = await this.organizationMemberRepository.create({
        organizationId: invite.organizationId,
        userId,
        role: invite.role,
      }, tx);

      await this.inviteRedemptionRepository.create({ inviteId: invite.id, userId }, tx);

      await this.inviteRepository.update(invite.id, { usesCount: { increment: 1 } }, tx);

      return membership;
    });
  }

  private assertRedeemable(invite: { revokedAt: Date | null; expiresAt: Date; usesCount: number; maxUses: number | null }): void {
    if (invite.revokedAt) {
      throw new AppError('Convite inválido ou expirado', 422);
    }

    if (invite.expiresAt < new Date()) {
      throw new AppError('Convite inválido ou expirado', 422);
    }

    const limit = invite.maxUses ?? 1;
    if (invite.usesCount >= limit) {
      throw new AppError('Convite inválido ou expirado', 422);
    }
  }
}
