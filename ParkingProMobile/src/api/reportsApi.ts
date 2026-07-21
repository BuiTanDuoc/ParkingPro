import { apiClient } from './client';
import { OccupancyReportDto, RevenueReportDto } from '../types/api';

export const reportsApi = {
  getRevenue: (fromDate: string, toDate: string) =>
    apiClient
      .get<RevenueReportDto[]>('/reports/revenue', { params: { fromDate, toDate } })
      .then(r => r.data),

  getOccupancy: (parkingLotId: string) =>
    apiClient
      .get<OccupancyReportDto>('/reports/occupancy', { params: { parkingLotId } })
      .then(r => r.data),
};
