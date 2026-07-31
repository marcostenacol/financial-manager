import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListNotificationsService } from '@/modules/notifications/services/ListNotificationsService';
import { NotificationRepositoryInterface } from '@/modules/notifications/repositories/contracts/NotificationRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ListNotificationsService', () => {
  let notificationRepository: NotificationRepositoryInterface;
  let cacheTrait: CacheTrait;
  let listNotificationsService: ListNotificationsService;

  beforeEach(() => {
    notificationRepository = {
      findAllByUserId: vi.fn(),
    } as any;

    cacheTrait = {
      get: vi.fn(),
      set: vi.fn(),
    } as any;

    listNotificationsService = new ListNotificationsService(notificationRepository, cacheTrait);
  });

  it('should list notifications from cache if available', async () => {
    const userId = 'user-id';
    const cached = [{ id: 'notification-id' }];

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(cached as any);

    const result = await listNotificationsService.execute(userId);

    expect(result).toEqual(cached);
    expect(notificationRepository.findAllByUserId).not.toHaveBeenCalled();
  });

  it('should list notifications from repository and set cache if not in cache', async () => {
    const userId = 'user-id';
    const notifications = [{ id: 'notification-id' }];

    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(notificationRepository, 'findAllByUserId').mockResolvedValue(notifications as any);

    const result = await listNotificationsService.execute(userId);

    expect(result).toEqual(notifications);
    expect(cacheTrait.set).toHaveBeenCalledWith(`notifications:user:${userId}`, notifications);
  });
});
