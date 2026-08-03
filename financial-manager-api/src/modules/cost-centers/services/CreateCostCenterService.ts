import { inject, injectable } from 'tsyringe';
import { CostCenter } from '@prisma/client';
import { CostCenterRepositoryInterface } from '../repositories/contracts/CostCenterRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CreateCostCenterDTOType } from '../dtos/CreateCostCenterDTO';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class CreateCostCenterService {
  constructor(
    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute({ organization_id, ...data }: CreateCostCenterDTOType, userId: string): Promise<CostCenter> {
    if (organization_id) {
      const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organization_id, userId);

      if (!membership) {
        throw new AppError('Você não faz parte desta organização', 403);
      }
    }

    const costCenter = await this.costCenterRepository.create({
      ...data,
      userId: organization_id ? null : userId,
      organizationId: organization_id ?? null,
    });

    if (organization_id) {
      await this.cache.delPattern(CacheKeys.costCenters.listAllPattern());
    } else {
      await this.cache.del(CacheKeys.costCenters.list(userId));
    }

    return costCenter;
  }
}
