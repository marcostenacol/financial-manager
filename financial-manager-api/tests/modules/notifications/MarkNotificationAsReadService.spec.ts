import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkNotificationAsReadService } from '@/modules/notifications/services/MarkNotificationAsReadService';
import { NotificationRepositoryInterface } from '@/modules/notifications/repositories/contracts/NotificationRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('MarkNotificationAsReadService', () => {
  let notificationRepository: NotificationRepositoryInterface;
  let markNotificationAsReadService: MarkNotificationAsReadService;

  beforeEach(() => {
    notificationRepository = {
      findById: vi.fn(),
      markAsRead: vi.fn(),
    } as any;

    markNotificationAsReadService = new MarkNotificationAsReadService(notificationRepository);
  });

  it('should mark notification as read', async () => {
    const userId = 'user-1';
    const notification = { id: 'not-1', userId, readAt: null };

    vi.spyOn(notificationRepository, 'findById').mockResolvedValue(notification as any);
    vi.spyOn(notificationRepository, 'markAsRead').mockResolvedValue({ ...notification, readAt: new Date() } as any);

    const result = await markNotificationAsReadService.execute('not-1', userId);

    expect(result.readAt).toBeInstanceOf(Date);
    expect(notificationRepository.markAsRead).toHaveBeenCalledWith('not-1');
  });

  it('should throw error if notification not found', async () => {
    vi.spyOn(notificationRepository, 'findById').mockResolvedValue(null);

    await expect(
      markNotificationAsReadService.execute('non-existing', 'user-1')
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should throw error if notification belongs to another user', async () => {
    const notification = { id: 'not-1', userId: 'other-user' };
    vi.spyOn(notificationRepository, 'findById').mockResolvedValue(notification as any);

    await expect(
      markNotificationAsReadService.execute('not-1', 'user-1')
    ).rejects.toBeInstanceOf(AppError);
  });
});
