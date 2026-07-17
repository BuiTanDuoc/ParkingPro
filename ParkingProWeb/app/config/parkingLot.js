// Bản scaffold hiện chỉ làm việc với 1 bãi xe duy nhất (khớp với DataSeeder ở backend).
// Khi cần hỗ trợ nhiều bãi xe, thay hằng số này bằng 1 bộ chọn bãi xe (dropdown) lưu vào Context/URL.
// Xem giá trị thật của bãi xe mẫu qua Swagger/DB sau khi backend seed dữ liệu (bảng ParkingLots).
export const DEFAULT_PARKING_LOT_ID =
    (typeof process !== 'undefined' && process.env && process.env.DEFAULT_PARKING_LOT_ID) || '';
