// Đọc cấu hình runtime từ window.__APP_CONFIG__ (nạp bởi <script src="config.js"> trong index.html,
// xem app/index.html). File dist/config.js KHÔNG bị Webpack bundle — có thể sửa trực tiếp trên server
// sau khi đã build production (vd đổi DEFAULT_PARKING_LOT_ID) mà không cần build lại.
//
// Nếu window.__APP_CONFIG__ không có (vd chưa deploy config.js, hoặc đang chạy unit test), dùng lại
// giá trị đã bake tại thời điểm build (buildTimeValue, thường lấy từ process.env qua DefinePlugin).
export const getRuntimeConfig = (key, buildTimeValue = '') => {
    if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
        const value = window.__APP_CONFIG__[key];
        if (value !== undefined && value !== null && value !== '') return value;
    }
    return buildTimeValue;
};
