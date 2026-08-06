import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePersonService } from '@/modules/people/services/CreatePersonService';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('CreatePersonService', () => {
  let personRepository: PersonRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let createPersonService: CreatePersonService;

  beforeEach(() => {
    personRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAllByOwner: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn(),
    } as any;

    createPersonService = new CreatePersonService(personRepository, organizationMemberRepository);
  });

  it('should create a personal person with default one-time frequency and zero amounts', async () => {
    const userId = 'user-1';
    const data = {
      name: 'João',
      pix_key: 'joao@example.com',
      pix_key_type: 'EMAIL' as const,
    };

    vi.spyOn(personRepository, 'create').mockResolvedValue({ id: 'person-1', ...data, userId } as any);

    await createPersonService.execute(data, userId);

    expect(personRepository.create).toHaveBeenCalledWith({
      userId,
      organizationId: null,
      scope: 'personal',
      name: 'João',
      theyOweMe: 0,
      iOweThem: 0,
      paymentFrequency: 'ONE_TIME',
      pixKey: 'joao@example.com',
      pixKeyType: 'EMAIL',
      pixCity: undefined,
      notes: undefined,
    });
  });

  it('should create a person with explicit monthly frequency and both amounts', async () => {
    const userId = 'user-1';
    const data = {
      name: 'Maria',
      they_owe_me: 200,
      i_owe_them: 500,
      payment_frequency: 'MONTHLY' as const,
      pix_key: '12345678900',
      pix_key_type: 'CPF' as const,
      pix_city: 'Boa Vista',
    };

    vi.spyOn(personRepository, 'create').mockResolvedValue({ id: 'person-2', ...data, userId } as any);

    await createPersonService.execute(data, userId);

    expect(personRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ theyOweMe: 200, iOweThem: 500, paymentFrequency: 'MONTHLY', pixCity: 'Boa Vista' }),
    );
  });

  it('should force scope to business and userId to null when organization_id is provided', async () => {
    const userId = 'user-1';
    const data = {
      name: 'Empresa X',
      pix_key: 'empresa@example.com',
      pix_key_type: 'EMAIL' as const,
      organization_id: 'org-1',
    };

    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'member-1' } as any);
    vi.spyOn(personRepository, 'create').mockResolvedValue({ id: 'person-3' } as any);

    await createPersonService.execute(data, userId);

    expect(personRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, organizationId: 'org-1', scope: 'business' }),
    );
  });

  it('should throw AppError when user is not a member of the given organization', async () => {
    const data = {
      name: 'Empresa X',
      pix_key: 'empresa@example.com',
      pix_key_type: 'EMAIL' as const,
      organization_id: 'org-1',
    };

    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(null);

    await expect(createPersonService.execute(data, 'user-1')).rejects.toBeInstanceOf(AppError);
    expect(personRepository.create).not.toHaveBeenCalled();
  });
});
