import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteNotificationService } from '@/modules/notifications/services/DeleteNotificationService';
import { NotificationRepositoryInterface } from '@/modules/notifications/repositories/contracts/NotificationRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('DeleteNotificationService', () => {
  let notificationRepository: NotificationRepositoryInterface;
  let cacheTrait: CacheTrait;
  let deleteNotificationService: DeleteNotificationService;

  beforeEach(() => {
    notificationRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    deleteNotificationService = new DeleteNotificationService(notificationRepository, cacheTrait);
  });

  it('should delete a notification owned by the user and clear cache', async () => {
    const userId = 'user-id';
    const notificationId = 'notification-id';

    vi.spyOn(notificationRepository, 'findById').mockResolvedValue({ id: notificationId, userId } as any);

    await deleteNotificationService.execute(notificationId, userId);

    expect(notificationRepository.delete).toHaveBeenCalledWith(notificationId);
    expect(cacheTrait.del).toHaveBeenCalledWith(`notifications:user:${userId}`);
  });

  it('should throw AppError when the notification does not exist', async () => {
    vi.spyOn(notificationRepository, 'findById').mockResolvedValue(null);

    await expect(deleteNotificationService.execute('notification-id', 'user-id')).rejects.toBeInstanceOf(AppError);
  });

  it('should throw AppError when the notification belongs to another user', async () => {
    vi.spyOn(notificationRepository, 'findById').mockResolvedValue({
      id: 'notification-id',
      userId: 'other-user',
    } as any);

    await expect(deleteNotificationService.execute('notification-id', 'user-id')).rejects.toBeInstanceOf(AppError);
  });
});
