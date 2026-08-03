import { inject, injectable } from 'tsyringe';
import { CostCenter } from '@prisma/client';
import { CostCenterRepositoryInterface } from '../repositories/contracts/CostCenterRepositoryInterface';
import { UpdateCostCenterDTOType } from '../dtos/UpdateCostCenterDTO';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class UpdateCostCenterService {
  constructor(
    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(id: string, data: UpdateCostCenterDTOType, userId: string): Promise<CostCenter> {
    const costCenter = await this.costCenterRepository.findById(id);

    if (!costCenter || costCenter.userId !== userId) {
      throw new AppError('Centro de custo não encontrado', 404);
    }

    const updated = await this.costCenterRepository.update(id, data);

    await this.cache.del(CacheKeys.costCenters.list(userId));

    return updated;
  }
}
