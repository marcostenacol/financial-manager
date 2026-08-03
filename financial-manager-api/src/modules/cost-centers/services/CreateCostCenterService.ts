import { inject, injectable } from 'tsyringe';
import { CostCenter } from '@prisma/client';
import { CostCenterRepositoryInterface } from '../repositories/contracts/CostCenterRepositoryInterface';
import { CreateCostCenterDTOType } from '../dtos/CreateCostCenterDTO';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class CreateCostCenterService {
  constructor(
    @inject('CostCenterRepository')
    private costCenterRepository: CostCenterRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateCostCenterDTOType, userId: string): Promise<CostCenter> {
    const costCenter = await this.costCenterRepository.create({
      ...data,
      userId,
    });

    await this.cache.del(CacheKeys.costCenters.list(userId));

    return costCenter;
  }
}
