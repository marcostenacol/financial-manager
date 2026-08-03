import { inject, injectable } from 'tsyringe';
import { Organization, OrganizationMemberRole } from '@prisma/client';
import { OrganizationRepositoryInterface } from '../repositories/contracts/OrganizationRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '../repositories/contracts/OrganizationMemberRepositoryInterface';

export interface MyOrganization extends Organization {
  role: OrganizationMemberRole;
}

@injectable()
export class ListMyOrganizationsService {
  constructor(
    @inject('OrganizationRepository')
    private organizationRepository: OrganizationRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<MyOrganization[]> {
    const memberships = await this.organizationMemberRepository.findAllByUserId(userId);

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const organization = await this.organizationRepository.findById(membership.organizationId);
        return organization ? { ...organization, role: membership.role } : null;
      }),
    );

    return organizations.filter((organization): organization is MyOrganization => organization !== null);
  }
}
