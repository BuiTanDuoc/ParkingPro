// Bản scaffold hiện chỉ làm việc với 1 bãi xe duy nhất (khớp với DataSeeder ở backend).
// Khi cần hỗ trợ nhiều bãi xe, thay hằng số này bằng 1 bộ chọn bãi xe (dropdown) lưu vào Context/URL.
// Xem giá trị thật của bãi xe mẫu qua Swagger/DB sau khi backend seed dữ liệu (bảng ParkingLots).
//
// Giá trị này đọc theo thứ tự ưu tiên: window.__APP_CONFIG__ (dist/config.js, sửa được sau khi build)
// -> process.env.DEFAULT_PARKING_LOT_ID (bake lúc build, xem .env) -> ''.
import { getRuntimeConfig } from './runtimeConfig';

const buildTimeValue =
    (typeof process !== 'undefined' && process.env && process.env.DEFAULT_PARKING_LOT_ID) || '';

export const DEFAULT_PARKING_LOT_ID = getRuntimeConfig('DEFAULT_PARKING_LOT_ID', buildTimeValue);
