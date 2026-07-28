import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkAllNotificationsAsReadService } from '@/modules/notifications/services/MarkAllNotificationsAsReadService';
import { NotificationRepositoryInterface } from '@/modules/notifications/repositories/contracts/NotificationRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('MarkAllNotificationsAsReadService', () => {
  let notificationRepository: NotificationRepositoryInterface;
  let cacheTrait: CacheTrait;
  let markAllAsReadService: MarkAllNotificationsAsReadService;

  beforeEach(() => {
    notificationRepository = {
      markAllAsRead: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    markAllAsReadService = new MarkAllNotificationsAsReadService(notificationRepository, cacheTrait);
  });

  it('should mark all notifications as read for the user and invalidate cache', async () => {
    const userId = 'user-1';

    await markAllAsReadService.execute(userId);

    expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith(userId);
    expect(cacheTrait.del).toHaveBeenCalledWith(`notifications:user:${userId}`);
  });
});
