import { inject, injectable } from 'tsyringe';
import { CostCenterRepositoryInterface } from '../repositories/contracts/CostCenterRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class DeleteCostCenterService {
  constructor(
    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const costCenter = await this.costCenterRepository.findById(id);

    if (!costCenter || costCenter.userId !== userId) {
      throw new AppError('Centro de custo não encontrado', 404);
    }

    await this.costCenterRepository.delete(id);

    await this.cache.del(CacheKeys.costCenters.list(userId));
  }
}
