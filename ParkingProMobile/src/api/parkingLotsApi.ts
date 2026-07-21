import { apiClient } from './client';
import { ParkingLotDto } from '../types/api';

export const parkingLotsApi = {
  getAll: () => apiClient.get<ParkingLotDto[]>('/parking-lots').then(r => r.data),

  getById: (id: string) =>
    apiClient.get<ParkingLotDto>(`/parking-lots/${id}`).then(r => r.data),
};
