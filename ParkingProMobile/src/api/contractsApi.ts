import { apiClient } from './client';
import {
  CreateMonthlyContractParams,
  MonthlyContractDto,
  PagedResult,
  UpdateMonthlyContractRequest,
} from '../types/api';

function buildCreateForm(params: CreateMonthlyContractParams): FormData {
  const form = new FormData();
  form.append('ParkingLotId', params.parkingLotId);
  form.append('CustomerUserId', params.customerUserId);
  form.append('LicensePlate', params.licensePlate);
  if (params.fixedSlotId) form.append('FixedSlotId', params.fixedSlotId);
  form.append('StartDate', params.startDate);
  form.append('NumberOfMonths', String(params.numberOfMonths));
  form.append('AutoRenew', String(params.autoRenew));
  if (params.vehiclePhoto?.uri) {
    form.append('VehiclePhoto', {
      uri: params.vehiclePhoto.uri,
      type: params.vehiclePhoto.type ?? 'image/jpeg',
      name: params.vehiclePhoto.fileName ?? `contract_vehicle_${Date.now()}.jpg`,
    } as unknown as Blob);
  }
  return form;
}

export const contractsApi = {
  create: (params: CreateMonthlyContractParams) =>
    apiClient
      .post<MonthlyContractDto>('/monthly-contracts', buildCreateForm(params), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data),

  update: (id: string, request: UpdateMonthlyContractRequest) =>
    apiClient.put<MonthlyContractDto>(`/monthly-contracts/${id}`, request).then(r => r.data),

  renew: (id: string, additionalMonths: number) =>
    apiClient
      .post<MonthlyContractDto>(`/monthly-contracts/${id}/renew`, null, {
        params: { additionalMonths },
      })
      .then(r => r.data),

  /** UI gọi đây khi người dùng bấm "Xoá hợp đồng" — thực chất là huỷ (giữ lịch sử thanh toán), không xoá cứng khỏi CSDL. */
  cancel: (id: string) => apiClient.post(`/monthly-contracts/${id}/cancel`).then(r => r.data),

  getAll: (
    parkingLotId: string,
    opts: { status?: string; search?: string; pageNumber?: number; pageSize?: number } = {},
  ) =>
    apiClient
      .get<PagedResult<MonthlyContractDto>>('/monthly-contracts', {
        params: {
          parkingLotId,
          status: opts.status,
          search: opts.search,
          pageNumber: opts.pageNumber ?? 1,
          pageSize: opts.pageSize ?? 50,
        },
      })
      .then(r => r.data),

  getExpiringSoon: (parkingLotId: string, withinDays = 7, pageNumber = 1, pageSize = 20) =>
    apiClient
      .get<PagedResult<MonthlyContractDto>>('/monthly-contracts/expiring-soon', {
        params: { parkingLotId, withinDays, pageNumber, pageSize },
      })
      .then(r => r.data),

  getBySlot: (slotId: string) =>
    apiClient
      .get<MonthlyContractDto>(`/monthly-contracts/by-slot/${slotId}`)
      .then(r => r.data)
      .catch(() => null),
};
