import { apiFetch } from './http';

export const getExpiringSoon = (parkingLotId, withinDays = 7, pageNumber = 1, pageSize = 20) =>
    apiFetch(`/api/monthly-contracts/expiring-soon?parkingLotId=${parkingLotId}&withinDays=${withinDays}&pageNumber=${pageNumber}&pageSize=${pageSize}`);

/**
 * Tab "Quản lý hợp đồng": toàn bộ HĐ còn hạn hoặc hết hạn, có lọc + phân trang.
 * @param {object} opts - { status?, search?, maxExpiredMonths? (bỏ trống/null = lấy tất cả), pageNumber, pageSize }
 */
export const getAllContracts = (parkingLotId, opts = {}) => {
    const { status, search, maxExpiredMonths, pageNumber = 1, pageSize = 20 } = opts;
    const params = new URLSearchParams({ parkingLotId, pageNumber, pageSize });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (maxExpiredMonths !== undefined && maxExpiredMonths !== null && maxExpiredMonths !== '') {
        params.append('maxExpiredMonths', maxExpiredMonths);
    }
    return apiFetch(`/api/monthly-contracts?${params.toString()}`);
};

/**
 * @param {object} fields - { parkingLotId, customerUserId?, newCustomerFullName?, newCustomerEmail?, newCustomerPassword?,
 *   newCustomerPhoneNumber?, licensePlate, fixedSlotId?, startDate, numberOfMonths, autoRenew }
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

/**
 * @param {string} id
 * @param {object} fields - { licensePlate, autoRenew, fixedSlotId?, customerUserId?, newCustomerFullName?,
 *   newCustomerEmail?, newCustomerPassword?, newCustomerPhoneNumber? }
 */
export const updateContract = (id, fields) =>
    apiFetch(`/api/monthly-contracts/${id}`, { method: 'PUT', body: fields });

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
