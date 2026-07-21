import { apiClient } from './client';
import { PagedResult, UserProfileDto } from '../types/api';
import { Asset } from 'react-native-image-picker';

export const usersApi = {
  getMe: () => apiClient.get<UserProfileDto>('/users/me').then(r => r.data),

  updateMe: (payload: { fullName: string; phoneNumber?: string }) =>
    apiClient.put<UserProfileDto>('/users/me', payload).then(r => r.data),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/users/me/change-password', payload).then(r => r.data),

  updateAvatar: (photo: Asset) => {
    const form = new FormData();
    form.append('Photo', {
      uri: photo.uri,
      type: photo.type ?? 'image/jpeg',
      name: photo.fileName ?? `avatar_${Date.now()}.jpg`,
    } as unknown as Blob);
    return apiClient
      .post<{ avatarUrl: string }>('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  getAll: (pageNumber = 1, pageSize = 20) =>
    apiClient
      .get<PagedResult<UserProfileDto>>('/users', { params: { pageNumber, pageSize } })
      .then(r => r.data),

  setActive: (id: string, isActive: boolean) =>
    apiClient.put(`/users/${id}/active`, null, { params: { isActive } }).then(r => r.data),
};
