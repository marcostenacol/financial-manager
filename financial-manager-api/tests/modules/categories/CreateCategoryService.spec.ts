import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCategoryService } from '@/modules/categories/services/CreateCategoryService';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('CreateCategoryService', () => {
  let categoryRepository: CategoryRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createCategoryService: CreateCategoryService;

  beforeEach(() => {
    categoryRepository = {
      create: vi.fn(),
      findByName: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    createCategoryService = new CreateCategoryService(categoryRepository, cacheTrait);
  });

  it('should create a new category', async () => {
    const userId = 'user-1';
    const data = {
      name: 'Lazer',
      color: '#FF0000',
      type: 'expense' as const,
    };

    vi.spyOn(categoryRepository, 'findByName').mockResolvedValue(null);
    vi.spyOn(categoryRepository, 'create').mockResolvedValue({ id: 'cat-1', ...data, userId } as any);

    const result = await createCategoryService.execute(data, userId);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Lazer');
    expect(cacheTrait.del).toHaveBeenCalledWith(`categories:user:${userId}`);
  });

  it('should throw error if category name already exists for user', async () => {
    const userId = 'user-1';
    const data = {
      name: 'Lazer',
      color: '#FF0000',
      type: 'expense' as const,
    };

    vi.spyOn(categoryRepository, 'findByName').mockResolvedValue({ id: 'existing' } as any);

    await expect(createCategoryService.execute(data, userId)).rejects.toBeInstanceOf(AppError);
  });
});
