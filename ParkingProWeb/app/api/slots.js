import { apiFetch } from './http';

export const getSlotStatuses = (parkingLotId) =>
    apiFetch(`/api/slots/status?parkingLotId=${parkingLotId}`);

export const setSlotMaintenance = (slotId, underMaintenance) =>
    apiFetch(`/api/slots/${slotId}/maintenance?underMaintenance=${underMaintenance}`, { method: 'PUT' });
