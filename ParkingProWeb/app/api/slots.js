import { apiFetch } from './http';

export const getSlotStatuses = (parkingLotId) =>
    apiFetch(`/api/slots/status?parkingLotId=${parkingLotId}`);

export const setSlotMaintenance = (slotId, underMaintenance) =>
    apiFetch(`/api/slots/${slotId}/maintenance?underMaintenance=${underMaintenance}`, { method: 'PUT' });

export const getZones = (parkingLotId) =>
    apiFetch(`/api/slots/zones?parkingLotId=${parkingLotId}`);

/** @param {object} fields - { parkingLotId, name, floor } */
export const createZone = (fields) =>
    apiFetch('/api/slots/zones', { method: 'POST', body: fields });

/** @param {object} fields - { zoneId, code, type } */
export const createSlot = (fields) =>
    apiFetch('/api/slots', { method: 'POST', body: fields });

/** @param {object} fields - { code, type } */
export const updateSlot = (slotId, fields) =>
    apiFetch(`/api/slots/${slotId}`, { method: 'PUT', body: fields });
