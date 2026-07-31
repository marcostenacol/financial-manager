import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateNotificationService } from '@/modules/notifications/services/CreateNotificationService';
import { NotificationRepositoryInterface } from '@/modules/notifications/repositories/contracts/NotificationRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('CreateNotificationService', () => {
  let notificationRepository: NotificationRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createNotificationService: CreateNotificationService;

  beforeEach(() => {
    notificationRepository = {
      create: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    createNotificationService = new CreateNotificationService(notificationRepository, cacheTrait);
  });

  it('should create a new notification and clear cache', async () => {
    const userId = 'user-id';
    const data = { title: 'Aviso', message: 'Você recebeu um alerta' } as any;

    vi.spyOn(notificationRepository, 'create').mockResolvedValue({
      id: 'notification-id',
      userId,
      ...data,
    } as any);

    const result = await createNotificationService.execute(data, userId);

    expect(result).toHaveProperty('id');
    expect(cacheTrait.del).toHaveBeenCalledWith(`notifications:user:${userId}`);
  });
});
