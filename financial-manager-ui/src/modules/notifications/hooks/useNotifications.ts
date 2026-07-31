import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  readAt: string | null;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    const response = await api.get('/notifications');
    setNotifications(response.data.data);
    return response.data.data as Notification[];
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  }, []);

  const markAllAsRead = useCallback(async () => {
    await api.patch('/notifications/read-all');
  }, []);

  return { notifications, loadNotifications, markAsRead, markAllAsRead };
}
