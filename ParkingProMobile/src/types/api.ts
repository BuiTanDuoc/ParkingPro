// Các type này map 1-1 với DTO của ParkingPro.API để tránh lệch field.

export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Customer';

export type SlotStatus = 'Trong' | 'DangDauXe' | 'DaDatTruoc' | 'BaoTri';
export type SlotType = 'Thuong' | 'Vip' | 'DanhChoVeThang';
export type VehicleType = 'XeMay' | 'OToDuoi7Cho' | 'OToTren7Cho' | 'XeTai';
export type SessionType = 'TheoGio' | 'TheoNgay' | 'TheoThang';
export type SessionStatus = 'DangGuiXe' | 'DaThanhToan' | 'DaHuy';
export type ContractStatus = 'DangHoatDong' | 'SapHetHan' | 'HetHan' | 'DaHuy';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  fullName: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  avatarUrl: string;
  isActive: boolean;
}

export interface SlotStatusDto {
  slotId: string;
  zoneId: string;
  code: string;
  zoneName: string;
  status: SlotStatus;
  type: SlotType;
  description?: string | null;
  currentLicensePlate?: string | null;
}

export interface ZoneDto {
  id: string;
  name: string;
  floor: number;
  description?: string | null;
  slotCount: number;
}

export interface UpdateSlotRequest {
  code: string;
  type: SlotType;
  description?: string | null;
}

export interface ParkingSessionDto {
  id: string;
  licensePlate: string;
  slotCode: string;
  sessionType: SessionType;
  status: SessionStatus;
  checkInAtUtc: string;
  checkOutAtUtc?: string | null;
  totalAmount?: number | null;
  checkInImageUrl?: string | null;
  checkOutImageUrl?: string | null;
}

export interface CheckInResponse {
  sessionId: string;
  licensePlate: string;
  slotCode: string;
  checkInAtUtc: string;
  sessionType: SessionType;
  checkInImageUrl: string;
}

export interface CheckOutResponse {
  sessionId: string;
  licensePlate: string;
  checkInAtUtc: string;
  checkOutAtUtc: string;
  totalAmount: number;
  slotCode: string;
  checkOutImageUrl: string;
}

export interface MonthlyContractDto {
  id: string;
  licensePlate: string;
  vehiclePhotoUrl?: string | null;
  customerName: string;
  fixedSlotCode?: string | null;
  startDate: string; // DateOnly -> "yyyy-MM-dd"
  endDate: string;
  monthlyFee: number;
  status: ContractStatus;
  autoRenew: boolean;
}

export interface CreateMonthlyContractParams {
  parkingLotId: string;
  customerUserId: string;
  licensePlate: string;
  fixedSlotId?: string;
  startDate: string; // "yyyy-MM-dd"
  numberOfMonths: number;
  autoRenew: boolean;
  vehiclePhoto?: { uri?: string; type?: string; fileName?: string } | null;
}

export interface UpdateMonthlyContractRequest {
  licensePlate: string;
  autoRenew: boolean;
}

export interface RegisterCustomerRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface RegisterCustomerResponse {
  id: string;
}

export interface RevenueReportDto {
  date: string; // DateOnly -> "yyyy-MM-dd"
  hourlyRevenue: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

export interface OccupancyReportDto {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  maintenanceSlots: number;
  occupancyRatePercent: number; // đã tính sẵn theo % (0-100), không phải phân số 0-1
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ParkingLotDto {
  id: string;
  name: string;
  address: string;
  phoneNumber?: string | null;
  totalSlots: number;
}

export interface ParkingLotSummary {
  id: string;
  name: string;
}

// Sự kiện realtime từ ParkingHub ("/hubs/parking")
export interface SlotStatusChangedEvent {
  slotId: string;
  newStatus: SlotStatus;
}
export interface SessionCheckedInEvent {
  sessionId: string;
}
export interface SessionCheckedOutEvent {
  sessionId: string;
}
