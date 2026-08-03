import { inject, injectable } from 'tsyringe';
import { CostCenterRepositoryInterface } from '../repositories/contracts/CostCenterRepositoryInterface';
import { assertOwnership } from '@/shared/authorization/ownership';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class DeleteCostCenterService {
  constructor(
    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string, organizationIds: string[] = []): Promise<void> {
    const costCenter = await this.costCenterRepository.findById(id);

    assertOwnership(costCenter, userId, organizationIds, 'Centro de custo não encontrado');

    await this.costCenterRepository.delete(id);

    if (costCenter!.organizationId) {
      await this.cache.delPattern(CacheKeys.costCenters.listAllPattern());
    } else {
      await this.cache.del(CacheKeys.costCenters.list(userId));
    }
  }
}
