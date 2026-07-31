import { useCallback } from 'react';
import { api } from '../../../services/api';

export interface Profile {
  name: string;
  bio: string | null;
  type: 'personal' | 'business';
  avatar: string | null;
}

export interface UpdateProfileInput {
  name: string;
  bio: string;
}

export function useProfile() {
  const getProfile = useCallback(async () => {
    const response = await api.get('/profile/me');
    return response.data.data as Profile;
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    const response = await api.put('/profile/me', data);
    return response.data.data as Profile;
  }, []);

  const changeProfileType = useCallback(async (type: 'personal' | 'business') => {
    const response = await api.patch('/profile/me/type', { type });
    return response.data.data as Profile;
  }, []);

  const updateAvatar = useCallback(async (avatarFile: File) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    const response = await api.patch('/profile/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data as Profile;
  }, []);

  return { getProfile, updateProfile, changeProfileType, updateAvatar };
}
