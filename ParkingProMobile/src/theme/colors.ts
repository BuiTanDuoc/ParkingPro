/**
 * Bảng màu dark theme cho app — đồng bộ tinh thần thiết kế dark UI
 * đã dùng ở các dự án khác (nền tối, accent nổi bật, rõ ràng).
 */
export const colors = {
  background: '#0f1117',
  surface: '#171a23',
  surfaceElevated: '#1f2330',
  border: '#2a2e3a',

  textPrimary: '#f5f6fa',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  accent: '#22c55e', // xanh lá — slot trống / thành công
  accentMuted: '#16a34a',

  primary: '#4f8ef7', // xanh dương — hành động chính, giữ nhất quán với web admin
  primaryMuted: '#3b6fd1',

  danger: '#ef4444', // slot đang đậu xe
  warning: '#f59e0b', // slot đã đặt trước
  info: '#38bdf8',
  disabled: '#4b5563', // slot bảo trì

  white: '#ffffff',
} as const;

export const slotStatusColor: Record<string, string> = {
  Trong: colors.accent,
  DangDauXe: colors.danger,
  DaDatTruoc: colors.warning,
  BaoTri: colors.disabled,
};

export const slotStatusLabel: Record<string, string> = {
  Trong: 'Trống',
  DangDauXe: 'Đang đậu xe',
  DaDatTruoc: 'Đã đặt trước',
  BaoTri: 'Bảo trì',
};

// Màu theo LOẠI slot — dùng làm màu nền chính của ô trên sơ đồ bãi xe.
// Trạng thái (trống/đang đậu/bảo trì...) được thể hiện riêng bằng chấm trạng thái ở góc ô.
export const slotTypeColor: Record<string, string> = {
  Thuong: colors.primary, // xanh dương — slot thường
  Vip: '#f59e0b', // vàng gold — slot VIP
  DanhChoVeThang: '#a855f7', // tím — slot dành cho vé tháng
};

export const slotTypeLabel: Record<string, string> = {
  Thuong: 'Thường',
  Vip: 'VIP',
  DanhChoVeThang: 'Vé tháng',
};

export const contractStatusColor: Record<string, string> = {
  DangHoatDong: colors.accent,
  SapHetHan: colors.warning,
  HetHan: colors.danger,
  DaHuy: colors.disabled,
};

export const contractStatusLabel: Record<string, string> = {
  DangHoatDong: 'Đang hoạt động',
  SapHetHan: 'Sắp hết hạn',
  HetHan: 'Đã hết hạn',
  DaHuy: 'Đã huỷ',
};

export const vehicleTypeLabel: Record<string, string> = {
  XeMay: 'Xe máy',
  OToDuoi7Cho: 'Ô tô dưới 7 chỗ',
  OToTren7Cho: 'Ô tô trên 7 chỗ',
  XeTai: 'Xe tải',
};

export const sessionTypeLabel: Record<string, string> = {
  TheoGio: 'Theo giờ',
  TheoNgay: 'Theo ngày',
  TheoThang: 'Theo tháng',
};

export const sessionStatusLabel: Record<string, string> = {
  DangGuiXe: 'Đang gửi xe',
  DaThanhToan: 'Đã thanh toán',
  DaHuy: 'Đã huỷ',
};

export const roleLabel: Record<string, string> = {
  Admin: 'Quản trị viên',
  Manager: 'Quản lý',
  Staff: 'Nhân viên',
  Customer: 'Khách hàng',
};
