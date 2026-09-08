import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPersonPixQrCodeService } from '@/modules/people/services/GetPersonPixQrCodeService';
import { PersonRepositoryInterface } from '@/modules/people/repositories/contracts/PersonRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('GetPersonPixQrCodeService', () => {
  let personRepository: PersonRepositoryInterface;
  let service: GetPersonPixQrCodeService;

  beforeEach(() => {
    personRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAllByOwner: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    service = new GetPersonPixQrCodeService(personRepository);
  });

  it('should throw when the person has no PIX key registered', async () => {
    (personRepository.findById as any).mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      organizationId: null,
      name: 'Fulano',
      pixKey: null,
      pixCity: null,
      iOweThem: 0,
    });

    await expect(service.execute('person-1', 'user-1')).rejects.toThrow(AppError);
  });

  it('should generate a QR code when the person has a PIX key', async () => {
    (personRepository.findById as any).mockResolvedValue({
      id: 'person-1',
      userId: 'user-1',
      organizationId: null,
      name: 'Fulano',
      pixKey: 'fulano@example.com',
      pixCity: 'SAO PAULO',
      iOweThem: 50,
    });

    const result = await service.execute('person-1', 'user-1');

    expect(result.payload).toContain('fulano@example.com');
    expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
