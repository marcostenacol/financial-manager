import { inject, injectable } from 'tsyringe';
import { Organization } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { OrganizationRepositoryInterface } from '../repositories/contracts/OrganizationRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { CreateOrganizationDTOType } from '../dtos/CreateOrganizationDTO';
import { OrganizationMemberRoleEnum } from '../enums/OrganizationMemberRoleEnum';

@injectable()
export class CreateOrganizationService {
  constructor(
    @inject('OrganizationRepository')
    private organizationRepository: OrganizationRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(data: CreateOrganizationDTOType, userId: string): Promise<Organization> {
    return prisma.$transaction(async (tx) => {
      const organization = await this.organizationRepository.create({ name: data.name }, tx);

      await this.organizationMemberRepository.create({
        organizationId: organization.id,
        userId,
        role: OrganizationMemberRoleEnum.OWNER,
      }, tx);

      return organization;
    });
  }
}
