import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListNotificationsService } from '@/modules/notifications/services/ListNotificationsService';
import { NotificationRepositoryInterface } from '@/modules/notifications/repositories/contracts/NotificationRepositoryInterface';

describe('ListNotificationsService', () => {
  let notificationRepository: NotificationRepositoryInterface;
  let listNotificationsService: ListNotificationsService;

  beforeEach(() => {
    notificationRepository = {
      findByUserId: vi.fn(),
    } as any;

    listNotificationsService = new ListNotificationsService(notificationRepository);
  });

  it('should list user notifications', async () => {
    const userId = 'user-1';
    const notifications = [
      { id: 'not-1', title: 'Test 1' },
      { id: 'not-2', title: 'Test 2' },
    ];

    vi.spyOn(notificationRepository, 'findByUserId').mockResolvedValue(notifications as any);

    const result = await listNotificationsService.execute(userId);

    expect(result).toEqual(notifications);
    expect(notificationRepository.findByUserId).toHaveBeenCalledWith(userId);
  });
});
