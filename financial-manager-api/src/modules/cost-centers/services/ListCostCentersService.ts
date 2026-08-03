import { inject, injectable } from 'tsyringe';
import { CostCenter } from '@prisma/client';
import { CostCenterRepositoryInterface } from '../repositories/contracts/CostCenterRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ListCostCentersService {
  constructor(
    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<CostCenter[]> {
    const cacheKey = CacheKeys.costCenters.list(userId);

    const cached = await this.cache.get<CostCenter[]>(cacheKey);
    if (cached) return cached;

    const costCenters = await this.costCenterRepository.findAllByUserId(userId);

    await this.cache.set(cacheKey, costCenters);

    return costCenters;
  }
}
