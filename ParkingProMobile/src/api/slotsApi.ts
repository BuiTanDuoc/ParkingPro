import { apiClient } from './client';
import { PagedResult, SlotStatusDto, UpdateSlotRequest, ZoneDto } from '../types/api';

export const slotsApi = {
  getStatus: (parkingLotId: string) =>
    apiClient
      .get<SlotStatusDto[]>('/slots/status', { params: { parkingLotId } })
      .then(r => r.data),

  getSlots: (parkingLotId: string, pageNumber = 1, pageSize = 50) =>
    apiClient
      .get<PagedResult<SlotStatusDto>>('/slots', {
        params: { parkingLotId, pageNumber, pageSize },
      })
      .then(r => r.data),

  getZones: (parkingLotId: string) =>
    apiClient.get<ZoneDto[]>('/slots/zones', { params: { parkingLotId } }).then(r => r.data),

  setMaintenance: (id: string, underMaintenance: boolean) =>
    apiClient
      .put(`/slots/${id}/maintenance`, null, { params: { underMaintenance } })
      .then(r => r.data),

  updateSlot: (id: string, request: UpdateSlotRequest) =>
    apiClient.put<SlotStatusDto>(`/slots/${id}`, request).then(r => r.data),
};
