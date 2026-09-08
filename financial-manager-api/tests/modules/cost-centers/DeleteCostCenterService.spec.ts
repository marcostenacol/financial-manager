import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';
import { DeleteCostCenterService } from '@/modules/cost-centers/services/DeleteCostCenterService';
import { CostCenterRepositoryInterface } from '@/modules/cost-centers/repositories/contracts/CostCenterRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('DeleteCostCenterService', () => {
  let costCenterRepository: CostCenterRepositoryInterface;
  let cacheTrait: CacheTrait;
  let deleteCostCenterService: DeleteCostCenterService;

  beforeEach(() => {
    costCenterRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    deleteCostCenterService = new DeleteCostCenterService(costCenterRepository, cacheTrait);
  });

  it('should delete the cost center and clear cache', async () => {
    vi.spyOn(costCenterRepository, 'findById').mockResolvedValue({ id: 'cc-1', userId: 'user-1' } as any);

    await deleteCostCenterService.execute('cc-1', 'user-1');

    expect(costCenterRepository.delete).toHaveBeenCalledWith('cc-1');
    expect(cacheTrait.del).toHaveBeenCalledWith('cost-centers:user:user-1');
  });

  it('should throw when cost center does not belong to the authenticated user', async () => {
    vi.spyOn(costCenterRepository, 'findById').mockResolvedValue({ id: 'cc-1', userId: 'other-user' } as any);

    await expect(deleteCostCenterService.execute('cc-1', 'user-1')).rejects.toThrow(AppError);
    expect(costCenterRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw a friendly AppError when the cost center has linked records (FK violation)', async () => {
    vi.spyOn(costCenterRepository, 'findById').mockResolvedValue({ id: 'cc-1', userId: 'user-1' } as any);
    vi.spyOn(costCenterRepository, 'delete').mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('FK violation', { code: 'P2003', clientVersion: '7.8.0' }),
    );

    await expect(deleteCostCenterService.execute('cc-1', 'user-1')).rejects.toThrow(AppError);
  });
});
