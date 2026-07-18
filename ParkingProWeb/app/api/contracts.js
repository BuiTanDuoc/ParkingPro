import { apiFetch } from './http';

export const getExpiringSoon = (parkingLotId, withinDays = 7, pageNumber = 1, pageSize = 20) =>
    apiFetch(`/api/monthly-contracts/expiring-soon?parkingLotId=${parkingLotId}&withinDays=${withinDays}&pageNumber=${pageNumber}&pageSize=${pageSize}`);

/**
 * @param {object} fields - { parkingLotId, customerUserId, licensePlate, fixedSlotId, startDate, numberOfMonths, autoRenew }
 * @param {File|null} vehiclePhotoFile
 */
export const createContract = (fields, vehiclePhotoFile) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') formData.append(key, value);
    });
    if (vehiclePhotoFile) formData.append('VehiclePhoto', vehiclePhotoFile);

    return apiFetch('/api/monthly-contracts', { method: 'POST', isFormData: true, body: formData });
};

export const renewContract = (id, additionalMonths) =>
    apiFetch(`/api/monthly-contracts/${id}/renew?additionalMonths=${additionalMonths}`, { method: 'POST' });

export const cancelContract = (id) =>
    apiFetch(`/api/monthly-contracts/${id}/cancel`, { method: 'POST' });

/** Trả về hợp đồng đang hoạt động gắn với 1 slot cố định, hoặc null nếu không có (404). */
export const getContractBySlot = async (slotId) => {
    try {
        return await apiFetch(`/api/monthly-contracts/by-slot/${slotId}`);
    } catch (err) {
        if (err.status === 404) return null;
        throw err;
    }
};
