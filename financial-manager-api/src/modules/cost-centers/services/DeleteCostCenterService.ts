import { inject, injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
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

    try {
      await this.costCenterRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError('Não é possível excluir um centro de custo com transações vinculadas', 409);
      }
      throw error;
    }

    if (costCenter!.organizationId) {
      await this.cache.delPattern(CacheKeys.costCenters.listAllPattern());
    } else {
      await this.cache.del(CacheKeys.costCenters.list(userId));
    }
  }
}
