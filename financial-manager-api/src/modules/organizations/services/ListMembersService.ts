import { inject, injectable } from 'tsyringe';
import { OrganizationMemberRepositoryInterface, OrganizationMemberWithUser } from '../repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class ListMembersService {
  constructor(
    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(organizationId: string, userId: string): Promise<OrganizationMemberWithUser[]> {
    const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, userId);

    if (!membership) {
      throw new AppError('Organização não encontrada', 404);
    }

    return this.organizationMemberRepository.findAllByOrganizationId(organizationId);
  }
}
