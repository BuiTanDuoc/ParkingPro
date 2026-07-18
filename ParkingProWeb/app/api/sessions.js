import { apiFetch } from './http';

export const getActiveSessions = (parkingLotId, pageNumber = 1, pageSize = 20) =>
    apiFetch(`/api/sessions/active?parkingLotId=${parkingLotId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getSessionById = (id) => apiFetch(`/api/sessions/${id}`);

/**
 * @param {object} fields - { parkingLotId, licensePlate, vehicleType, sessionType, preferredSlotId }
 * @param {File|null} photoFile
 */
export const checkIn = (fields, photoFile) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') formData.append(key, value);
    });
    if (photoFile) formData.append('Photo', photoFile);

    return apiFetch('/api/sessions/check-in', { method: 'POST', isFormData: true, body: formData });
};

export const checkOut = (sessionId, photoFile) => {
    const formData = new FormData();
    if (photoFile) formData.append('photo', photoFile);

    return apiFetch(`/api/sessions/${sessionId}/check-out`, { method: 'POST', isFormData: true, body: formData });
};

/** Trả về phiên đang gửi tại 1 slot, hoặc null nếu không có (404). */
export const getActiveSessionBySlot = async (slotId) => {
    try {
        return await apiFetch(`/api/sessions/by-slot/${slotId}/active`);
    } catch (err) {
        if (err.status === 404) return null;
        throw err;
    }
};
