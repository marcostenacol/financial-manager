import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCostCenterService } from '@/modules/cost-centers/services/CreateCostCenterService';
import { CostCenterRepositoryInterface } from '@/modules/cost-centers/repositories/contracts/CostCenterRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('CreateCostCenterService', () => {
  let costCenterRepository: CostCenterRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createCostCenterService: CreateCostCenterService;

  beforeEach(() => {
    costCenterRepository = {
      create: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    createCostCenterService = new CreateCostCenterService(costCenterRepository, organizationMemberRepository, cacheTrait);
  });

  it('should create a new cost center and clear cache', async () => {
    const userId = 'user-1';
    const data = { name: 'Marketing', color: '#3b82f6' };

    vi.spyOn(costCenterRepository, 'create').mockResolvedValue({ id: 'cc-1', userId, ...data } as any);

    const result = await createCostCenterService.execute(data, userId);

    expect(result).toHaveProperty('id');
    expect(costCenterRepository.create).toHaveBeenCalledWith({ ...data, userId, organizationId: null });
    expect(cacheTrait.del).toHaveBeenCalledWith(`cost-centers:user:${userId}`);
  });
});
