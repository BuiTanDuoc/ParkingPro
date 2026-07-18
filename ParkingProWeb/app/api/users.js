import { apiFetch } from './http';

export const getMyProfile = () => apiFetch('/api/users/me');

export const updateMyAvatar = (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiFetch('/api/users/me/avatar', { method: 'POST', isFormData: true, body: formData });
};

/** @param {object} fields - { fullName, phoneNumber } */
export const updateMyProfile = (fields) =>
    apiFetch('/api/users/me', { method: 'PUT', body: fields });

/** @param {object} fields - { currentPassword, newPassword } */
export const changeMyPassword = (fields) =>
    apiFetch('/api/users/me/change-password', { method: 'POST', body: fields });

export const getAllUsers = (role, pageNumber = 1, pageSize = 20) => {
    const roleParam = role ? `&role=${role}` : '';
    return apiFetch(`/api/users?pageNumber=${pageNumber}&pageSize=${pageSize}${roleParam}`);
};

/** @param {object} fields - { fullName, email, password, phoneNumber, role } */
export const createStaffUser = (fields) =>
    apiFetch('/api/users', { method: 'POST', body: fields });

export const setUserActive = (id, isActive) =>
    apiFetch(`/api/users/${id}/active?isActive=${isActive}`, { method: 'PUT' });
