import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateNotificationService } from '@/modules/notifications/services/CreateNotificationService';
import { NotificationRepositoryInterface } from '@/modules/notifications/repositories/contracts/NotificationRepositoryInterface';

describe('CreateNotificationService', () => {
  let notificationRepository: NotificationRepositoryInterface;
  let createNotificationService: CreateNotificationService;

  beforeEach(() => {
    notificationRepository = {
      create: vi.fn(),
    } as any;

    createNotificationService = new CreateNotificationService(notificationRepository);
  });

  it('should create a new notification', async () => {
    const data = {
      userId: 'user-1',
      title: 'Test Title',
      message: 'Test Message',
      type: 'info' as const,
    };

    vi.spyOn(notificationRepository, 'create').mockResolvedValue({ id: 'not-1', ...data, readAt: null, createdAt: new Date() } as any);

    const result = await createNotificationService.execute(data);

    expect(result).toHaveProperty('id');
    expect(notificationRepository.create).toHaveBeenCalledWith(data);
  });
});
