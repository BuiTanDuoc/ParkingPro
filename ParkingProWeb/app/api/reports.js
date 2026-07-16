import { apiFetch } from './http';

export const getRevenueReport = (parkingLotId, fromDate, toDate) =>
    apiFetch(`/api/reports/revenue?parkingLotId=${parkingLotId}&fromDate=${fromDate}&toDate=${toDate}`);

export const getOccupancyReport = (parkingLotId) =>
    apiFetch(`/api/reports/occupancy?parkingLotId=${parkingLotId}`);
