import { inject, injectable } from 'tsyringe';
import { OrganizationMember } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { OrganizationMemberRoleEnum } from '../enums/OrganizationMemberRoleEnum';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class TransferOwnershipService {
  constructor(
    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(organizationId: string, targetUserId: string, requesterId: string): Promise<OrganizationMember> {
    const requesterMembership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, requesterId);

    if (!requesterMembership || requesterMembership.role !== OrganizationMemberRoleEnum.OWNER) {
      throw new AppError('Apenas o dono da organização pode transferir a titularidade', 403);
    }

    if (targetUserId === requesterId) {
      throw new AppError('Você já é o dono desta organização', 422);
    }

    const targetMembership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, targetUserId);

    if (!targetMembership) {
      throw new AppError('Membro não encontrado', 404);
    }

    return prisma.$transaction(async (tx) => {
      const newOwner = await this.organizationMemberRepository.update(targetMembership.id, {
        role: OrganizationMemberRoleEnum.OWNER,
      }, tx);

      await this.organizationMemberRepository.update(requesterMembership.id, {
        role: OrganizationMemberRoleEnum.MEMBER,
      }, tx);

      return newOwner;
    });
  }
}
