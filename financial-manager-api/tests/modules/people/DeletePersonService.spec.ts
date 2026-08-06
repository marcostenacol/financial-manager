import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeletePersonService } from '@/modules/people/services/DeletePersonService';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('DeletePersonService', () => {
  let personRepository: PersonRepositoryInterface;
  let deletePersonService: DeletePersonService;

  beforeEach(() => {
    personRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAllByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    deletePersonService = new DeletePersonService(personRepository);
  });

  it('should delete a person owned by the user', async () => {
    const userId = 'user-1';
    vi.spyOn(personRepository, 'findById').mockResolvedValue({ id: 'person-1', userId } as any);

    await deletePersonService.execute('person-1', userId);

    expect(personRepository.delete).toHaveBeenCalledWith('person-1');
  });

  it('should throw AppError when person belongs to another user', async () => {
    vi.spyOn(personRepository, 'findById').mockResolvedValue({ id: 'person-1', userId: 'other-user' } as any);

    await expect(deletePersonService.execute('person-1', 'user-1')).rejects.toBeInstanceOf(AppError);
    expect(personRepository.delete).not.toHaveBeenCalled();
  });
});
