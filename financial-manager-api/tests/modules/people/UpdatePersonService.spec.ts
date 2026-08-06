import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdatePersonService } from '@/modules/people/services/UpdatePersonService';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('UpdatePersonService', () => {
  let personRepository: PersonRepositoryInterface;
  let updatePersonService: UpdatePersonService;

  beforeEach(() => {
    personRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAllByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    updatePersonService = new UpdatePersonService(personRepository);
  });

  it('should update a person owned by the user', async () => {
    const userId = 'user-1';
    vi.spyOn(personRepository, 'findById').mockResolvedValue({ id: 'person-1', userId } as any);
    vi.spyOn(personRepository, 'update').mockResolvedValue({ id: 'person-1', userId, name: 'Novo nome' } as any);

    const result = await updatePersonService.execute('person-1', { name: 'Novo nome' }, userId);

    expect(result.name).toBe('Novo nome');
  });

  it('should throw AppError when person does not exist', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue(null);

    await expect(updatePersonService.execute('person-1', { name: 'X' }, 'user-1')).rejects.toBeInstanceOf(AppError);
  });

  it('should throw AppError when person belongs to another user', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({ id: 'person-1', userId: 'other-user' } as any);

    await expect(updatePersonService.execute('person-1', { name: 'X' }, 'user-1')).rejects.toBeInstanceOf(AppError);
  });
});
