import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkNotificationAsReadService } from '@/modules/notifications/services/MarkNotificationAsReadService';
import { NotificationRepositoryInterface } from '@/modules/notifications/repositories/contracts/NotificationRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('MarkNotificationAsReadService', () => {
  let notificationRepository: NotificationRepositoryInterface;
  let cacheTrait: CacheTrait;
  let markNotificationAsReadService: MarkNotificationAsReadService;

  beforeEach(() => {
    notificationRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    markNotificationAsReadService = new MarkNotificationAsReadService(notificationRepository, cacheTrait);
  });

  it('should mark a notification owned by the user as read and clear cache', async () => {
    const userId = 'user-id';
    const notificationId = 'notification-id';

    vi.spyOn(notificationRepository, 'findById').mockResolvedValue({ id: notificationId, userId, read: false } as any);
    vi.spyOn(notificationRepository, 'update').mockResolvedValue({ id: notificationId, userId, read: true } as any);

    const result = await markNotificationAsReadService.execute(notificationId, userId);

    expect(result.read).toBe(true);
    expect(notificationRepository.update).toHaveBeenCalledWith(notificationId, { read: true });
    expect(cacheTrait.del).toHaveBeenCalledWith(`notifications:user:${userId}`);
  });

  it('should throw AppError when the notification does not exist', async () => {
    vi.spyOn(notificationRepository, 'findById').mockResolvedValue(null);

    await expect(markNotificationAsReadService.execute('notification-id', 'user-id')).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it('should throw AppError when the notification belongs to another user', async () => {
    vi.spyOn(notificationRepository, 'findById').mockResolvedValue({
      id: 'notification-id',
      userId: 'other-user',
    } as any);

    await expect(markNotificationAsReadService.execute('notification-id', 'user-id')).rejects.toBeInstanceOf(
      AppError,
    );
  });
});
