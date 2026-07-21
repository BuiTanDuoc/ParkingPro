# ParkingPro Mobile

App React Native (CLI, TypeScript) cho ParkingPro — dùng chung cho **nhân viên bãi xe** (check-in/out) và **quản lý/admin** (báo cáo, hợp đồng tháng, quản lý người dùng), phân quyền theo `role` trả về từ `/api/auth/login`.

## Tính năng

| Màn hình | Vai trò | Mô tả |
|---|---|---|
| Đăng nhập | Tất cả | JWT login, tự refresh token khi hết hạn (401 → gọi `/auth/refresh-token`, retry request gốc) |
| **Sơ đồ bãi xe (realtime)** | Tất cả | Kết nối SignalR `/hubs/parking`, join group `lot-{id}`, cập nhật màu slot theo `SlotStatusChanged`/`SessionCheckedIn`/`SessionCheckedOut` không cần reload |
| Check-in | Tất cả | Nhập biển số, loại xe, hình thức gửi, chụp ảnh xe (camera), gọi `/sessions/check-in` (multipart) |
| Check-out | Tất cả | Từ sơ đồ bãi xe hoặc danh sách đang gửi → chụp ảnh, xác nhận, hiển thị số tiền thu |
| Đang gửi xe | Tất cả | Danh sách session đang hoạt động, thời gian đã đậu |
| Hợp đồng tháng | Manager, Admin | Danh sách sắp hết hạn, gia hạn / huỷ |
| Báo cáo | Manager, Admin | Tỷ lệ lấp đầy hiện tại, biểu đồ doanh thu 7 ngày |
| Nhân viên | Admin | Danh sách user, khoá/mở tài khoản |
| Hồ sơ | Tất cả | Đổi ảnh đại diện, xem thông tin, đổi bãi xe, đăng xuất |

## Cấu hình trước khi chạy

### 1. Địa chỉ backend

Sửa `src/config/env.ts`:

```ts
export const API_BASE_URL = __DEV__
  ? `http://${LOCAL_HOST}:5000/api`   // đổi cổng nếu backend chạy port khác
  : 'https://parkingpro.adgps.vn/api'; // domain thật khi build production
```

- **Android emulator**: đã tự dùng `10.0.2.2` để trỏ về `localhost` của máy host — không cần sửa nếu chạy backend local.
- **Thiết bị thật / iOS simulator**: đổi `LOCAL_HOST` thành IP LAN của máy chạy backend (vd `192.168.1.5`).

### 2. Giới hạn hiện tại: chưa có endpoint danh sách bãi xe

Backend hiện **không có** `GET /api/parking-lots` — mọi endpoint (`/slots/status`, `/sessions/active`, `/reports/occupancy`...) đều yêu cầu `parkingLotId` do client tự truyền vào, và hệ thống hiện chỉ seed đúng 1 bãi xe ("Bãi xe Trung Tâm Quận 1").

App xử lý tạm bằng màn hình **"Cài đặt bãi xe"** hiện ra sau khi đăng nhập lần đầu: nhân viên copy `Id` của bãi xe từ Admin Web (trang Dashboard) và dán vào, chỉ cần làm 1 lần/thiết bị (lưu ở `AsyncStorage`).

**Khuyến nghị**: thêm endpoint `GET /api/parking-lots` ở backend để app tự load danh sách và bỏ bước nhập tay này, đặc biệt quan trọng nếu sau này quản lý nhiều bãi xe.

## Cài đặt & chạy

```bash
npm install

# Android
npm run android

# iOS (cần macOS + Xcode)
cd ios && pod install && cd ..
npm run ios
```

Yêu cầu: Node ≥ 22.11, JDK 17, Android SDK (theo đúng setup đã dùng ở dự án Sổ Tiết Kiệm — Gradle 8.10.2 + Java 17 nếu gặp lỗi build).

## Kiến trúc thư mục

```
src/
  api/            # axios instance (auto refresh token) + các module gọi API theo controller
  config/env.ts   # base URL, hub URL
  contexts/        # AuthContext (session), ParkingLotContext (bãi xe đang chọn)
  hooks/useParkingHub.ts  # kết nối SignalR, join/leave lot group
  navigation/      # RootNavigator (Login → Setup → MainTabs), MainTabNavigator (tab theo role)
  screens/         # màn hình theo tính năng
  theme/colors.ts  # dark theme + label tiếng Việt cho enum backend (status, loại xe...)
  types/api.ts     # type khớp 1-1 với DTO backend
  utils/           # format tiền/ngày giờ, lưu token vào AsyncStorage
```

## Việc tiếp theo (gợi ý)

- Thêm `GET /api/parking-lots` ở backend, bỏ màn "Cài đặt bãi xe" thủ công.
- Quét mã QR biển số bằng camera (hiện đang chụp ảnh thường + nhập tay biển số).
- Push notification khi hợp đồng tháng sắp hết hạn (Manager/Admin).
- Ứng dụng camera thực (react-native-vision-camera) nếu cần OCR biển số tự động.
