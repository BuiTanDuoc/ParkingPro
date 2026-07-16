import { apiFetch } from './http';

export const getMyProfile = () => apiFetch('/api/users/me');

export const updateMyAvatar = (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiFetch('/api/users/me/avatar', { method: 'POST', isFormData: true, body: formData });
};
