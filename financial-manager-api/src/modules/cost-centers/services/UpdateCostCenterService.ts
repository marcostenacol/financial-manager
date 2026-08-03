import { inject, injectable } from 'tsyringe';
import { CostCenter } from '@prisma/client';
import { CostCenterRepositoryInterface } from '../repositories/contracts/CostCenterRepositoryInterface';
import { UpdateCostCenterDTOType } from '../dtos/UpdateCostCenterDTO';
import { assertOwnership } from '@/shared/authorization/ownership';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class UpdateCostCenterService {
  constructor(
    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: UpdateCostCenterDTOType, userId: string, organizationIds: string[] = []): Promise<CostCenter> {
    const costCenter = await this.costCenterRepository.findById(id);

    assertOwnership(costCenter, userId, organizationIds, 'Centro de custo não encontrado');

    const updated = await this.costCenterRepository.update(id, data);

    if (costCenter!.organizationId) {
      await this.cache.delPattern(CacheKeys.costCenters.listAllPattern());
    } else {
      await this.cache.del(CacheKeys.costCenters.list(userId));
    }

    return updated;
  }
}
