import { apiFetch } from './http';

/** Toàn bộ slot của 1 bãi xe, không phân trang — dùng cho sơ đồ bãi xe realtime. */
export const getSlotStatuses = (parkingLotId) =>
    apiFetch(`/api/slots/status?parkingLotId=${parkingLotId}`);

/** Danh sách slot có phân trang, lọc khu vực + tìm theo mã/mô tả — dùng cho trang quản lý. */
export const getSlotsPaged = (parkingLotId, { zoneId, search, pageNumber = 1, pageSize = 20 } = {}) => {
    const params = new URLSearchParams({ parkingLotId, pageNumber, pageSize });
    if (zoneId) params.append('zoneId', zoneId);
    if (search) params.append('search', search);
    return apiFetch(`/api/slots?${params.toString()}`);
};

export const setSlotMaintenance = (slotId, underMaintenance) =>
    apiFetch(`/api/slots/${slotId}/maintenance?underMaintenance=${underMaintenance}`, { method: 'PUT' });

export const getZones = (parkingLotId) =>
    apiFetch(`/api/slots/zones?parkingLotId=${parkingLotId}`);

/** @param {object} fields - { parkingLotId, name, floor, description } */
export const createZone = (fields) =>
    apiFetch('/api/slots/zones', { method: 'POST', body: fields });

/** @param {object} fields - { name, floor, description } */
export const updateZone = (zoneId, fields) =>
    apiFetch(`/api/slots/zones/${zoneId}`, { method: 'PUT', body: fields });

/** @param {object} fields - { zoneId, code, type, description } */
export const createSlot = (fields) =>
    apiFetch('/api/slots', { method: 'POST', body: fields });

/** @param {object} fields - { code, type, description } */
export const updateSlot = (slotId, fields) =>
    apiFetch(`/api/slots/${slotId}`, { method: 'PUT', body: fields });
