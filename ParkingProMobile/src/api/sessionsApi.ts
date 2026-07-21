import { apiClient } from './client';
import {
  CheckInResponse,
  CheckOutResponse,
  PagedResult,
  ParkingSessionDto,
  SessionType,
  VehicleType,
} from '../types/api';
import { Asset } from 'react-native-image-picker';

export interface CheckInParams {
  parkingLotId: string;
  licensePlate: string;
  vehicleType: VehicleType;
  sessionType: SessionType;
  preferredSlotId?: string;
  photo?: Asset | null;
}

function appendPhoto(form: FormData, photo?: Asset | null) {
  if (!photo?.uri) return;
  form.append('Photo', {
    uri: photo.uri,
    type: photo.type ?? 'image/jpeg',
    name: photo.fileName ?? `photo_${Date.now()}.jpg`,
  } as unknown as Blob);
}

export const sessionsApi = {
  checkIn: (params: CheckInParams) => {
    const form = new FormData();
    form.append('ParkingLotId', params.parkingLotId);
    form.append('LicensePlate', params.licensePlate);
    form.append('VehicleType', params.vehicleType);
    form.append('SessionType', params.sessionType);
    if (params.preferredSlotId) form.append('PreferredSlotId', params.preferredSlotId);
    appendPhoto(form, params.photo);

    return apiClient
      .post<CheckInResponse>('/sessions/check-in', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  checkOut: (sessionId: string, photo?: Asset | null) => {
    const form = new FormData();
    appendPhoto(form, photo);

    return apiClient
      .post<CheckOutResponse>(`/sessions/${sessionId}/check-out`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  getById: (id: string) =>
    apiClient.get<ParkingSessionDto>(`/sessions/${id}`).then(r => r.data),

  getActive: (parkingLotId: string, pageNumber = 1, pageSize = 50) =>
    apiClient
      .get<PagedResult<ParkingSessionDto>>('/sessions/active', {
        params: { parkingLotId, pageNumber, pageSize },
      })
      .then(r => r.data),

  getActiveBySlot: (slotId: string) =>
    apiClient
      .get<ParkingSessionDto>(`/sessions/by-slot/${slotId}/active`)
      .then(r => r.data)
      .catch(() => null),
};
