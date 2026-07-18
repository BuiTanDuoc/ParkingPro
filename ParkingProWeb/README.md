# ParkingPro Admin Web

Frontend quản trị cho hệ thống bãi giữ xe ô tô — dựa trên template [Airframe React](https://github.com/0wczar/airframe-react)
(React 16 + Bootstrap 4 + reactstrap + React Router v5 + Webpack 4), tùy biến để gọi thẳng backend `ParkingPro.API`.

## Đã thay đổi so với template gốc

- **Đã xóa** toàn bộ các trang/route demo (Dashboards, Widgets, Cards, Layouts, Interface, Forms, Graphs, Tables, Apps, Icons...) để giảm nhiễu — chỉ giữ lại phần khung layout dùng chung (Sidebar, Navbar, Theme, các component UI lõi trong `app/components`).
- **Trang mới** (`app/routes/`): `Dashboard`, `ParkingMap` (sơ đồ bãi xe realtime — icon/màu theo loại slot, menu thao tác đầy đủ trên từng slot), `Sessions` (check-in/check-out theo giờ/ngày), `MonthlyContracts` (vé tháng), `Reports` (doanh thu), `Profile` (avatar, chỉnh sửa hồ sơ, đổi mật khẩu), `SlotsManagement` (2 tab: Khu vực / Danh sách slot có phân trang+lọc+tìm kiếm — Admin/Manager), `Users` (danh sách tài khoản, tạo Staff/Manager/Admin, khóa/mở khóa — Admin).
- **`app/routes/components/ParkingPro/`**: các modal dùng chung giữa nhiều trang — `CheckInModal`, `CheckOutModal`, `SlotFormModal`, `ZoneFormModal`, `CreateContractModal`, `ViewContractModal` (mới, xem hợp đồng theo slot).

- **Đăng nhập thật**: `app/routes/Pages/Login` gọi `/api/auth/login`, lưu JWT + refresh token vào `localStorage`.
- **`app/api/`**: lớp gọi API dùng chung (`http.js` — tự đính JWT, tự refresh khi hết hạn 401) + service theo domain (`auth`, `users`, `slots`, `sessions`, `contracts`, `reports`, `signalr`).
- **`app/auth/`**: `AuthContext` (trạng thái đăng nhập toàn app) + `PrivateRoute` (chặn route theo role).
- **`app/config/parkingLot.js`**: hằng số `DEFAULT_PARKING_LOT_ID` — xem phần "Giới hạn" bên dưới.

## Cài đặt & chạy

```bash
npm install
npm start   # chạy dev server tại http://localhost:4100 (mặc định webpack-dev-server)
```

Biến môi trường đọc từ file `.env` ở thư mục gốc (tự động nạp qua package `dotenv` trong
`build/webpack.config.client.*.js` — không cần `export` thủ công, chạy được cả trên Windows/Mac/Linux).
File `.env` mẫu đã có sẵn giá trị thực tế để test:

```
API_BASE_URL=https://localhost:7080
DEFAULT_PARKING_LOT_ID=7D3B31FC-1F7D-4CFA-8B6C-C526CDD0637A
BASE_PATH=/
```

⚠️ `API_BASE_URL` dùng `https://localhost:7080` (cổng HTTPS mặc định của backend khi `dotnet run`).
Nếu trình duyệt báo lỗi kết nối/chứng chỉ không tin cậy, chạy `dotnet dev-certs https --trust` một lần
trên máy backend để tin cậy chứng chỉ HTTPS dev của .NET, rồi tải lại trang.

⚠️ File `.env` đã được thêm vào `.gitignore` — sửa giá trị trong đó tùy máy, không cần sửa `.env.example`.

Biến môi trường cần thiết:

| Biến | Ý nghĩa | Mặc định |
|---|---|---|
| `API_BASE_URL` | Địa chỉ backend `ParkingPro.API` | `http://localhost:5080` |
| `DEFAULT_PARKING_LOT_ID` | GUID của bãi xe (xem giới hạn bên dưới) | rỗng |
| `BASE_PATH` | Base path khi deploy dưới subpath | `/` |

Tài khoản đăng nhập mẫu (từ Data Seeder của backend): `admin@parkingpro.vn` / `Admin@123`
(hoặc `manager@...`/`Manager@123`, `staff@...`/`Staff@123`).

## ⚠️ Giới hạn quan trọng của bản scaffold này

1. **Chỉ hỗ trợ 1 bãi xe** — `DEFAULT_PARKING_LOT_ID` là hằng số cấu hình cứng qua biến môi trường, lấy từ bảng `ParkingLots` sau khi backend chạy Data Seeder (xem log hoặc query DB để lấy đúng GUID). Muốn hỗ trợ nhiều bãi xe cần thêm 1 bộ chọn bãi xe (dropdown) và lưu lựa chọn vào Context.
2. **Tạo hợp đồng vé tháng cần nhập tay `CustomerUserId` (GUID)** — chưa có UI tìm kiếm/autocomplete khách hàng theo tên/số điện thoại. Cần khách hàng đã đăng ký tài khoản qua `/api/auth/register-customer` trước.
3. **Chưa xử lý hết lỗi 403 Forbidden** (vd Staff cố vào trang Reports) một cách thân thiện — `PrivateRoute` mới chỉ redirect về Dashboard, chưa có trang "Không có quyền truy cập" riêng.

## Cấu trúc thư mục chính

```
app/
├── api/            # Gọi API backend (http.js, auth.js, sessions.js, contracts.js, slots.js, reports.js, users.js, signalr.js)
├── auth/           # AuthContext, PrivateRoute
├── config/         # parkingLot.js (DEFAULT_PARKING_LOT_ID)
├── components/     # Thư viện UI lõi của Airframe (giữ nguyên từ template)
├── layout/         # Layout khung (Sidebar/Navbar) — đã chỉnh SidebarMiddleNav, SidebarTopA, DefaultNavbar
└── routes/
    ├── Dashboard/
    ├── ParkingMap/
    ├── Sessions/
    ├── MonthlyContracts/
    ├── Reports/
    ├── Profile/
    ├── SlotsManagement/   # Admin/Manager
    ├── Users/             # Admin
    └── Pages/Login, Pages/Error404   # còn giữ từ template gốc
```

## Giao diện: chọn Nav Color / Nav Style (Configurator)

Nút bấm hình cây cọ ở góc trái màn hình (từ template gốc, component `ThemeSelector`) cho phép đổi màu
và kiểu Sidebar/Navbar. Lựa chọn được lưu vào `localStorage` (key `parkingpro_theme`, xem
`app/components/Theme/ThemeProvider.js`) nên **tải lại trang hoặc đóng mở lại trình duyệt vẫn giữ
nguyên lựa chọn** — trước đây chỉ lưu trong state React nên bị mất khi tải lại.

## Realtime (SignalR)

`ParkingMap` tự kết nối tới `/hubs/parking` (qua `app/api/signalr.js`), join group theo `DEFAULT_PARKING_LOT_ID`,
và lắng nghe 3 sự kiện từ backend: `SlotStatusChanged`, `SessionCheckedIn`, `SessionCheckedOut` — mỗi khi có
sự kiện thì gọi lại `GET /api/slots/status` để cập nhật toàn bộ sơ đồ (đơn giản, chưa tối ưu patch từng ô).

## Đã kiểm tra trong quá trình scaffold

- `npm install` chạy thành công, dependency graph hợp lệ.
- `npm run build:dev` build thành công, **0 lỗi** — ra đủ `app.bundle.js`, `app.css`, `index.html`, fonts, static assets.
- Đã thay `node-sass` (native, hay lỗi trên Node mới/Windows — xem phần "Các lỗi đã sửa" bên dưới) bằng `sass` (Dart Sass, thuần JS, không cần build native).
- Đã gỡ `react-grid-layout`/`FloatGrid` (chỉ phục vụ trang Widgets demo đã xóa) vì bản mới của dependency này (`react-draggable`) phát hành dạng ESM không tương thích Webpack 4.

## Các lỗi đã sửa (nếu bạn từng gặp ở bản trước)

1. **`npm install` lỗi `node-sass`/`node-gyp`** (không có Python, hoặc `binding.node is not a valid Win32 application` trên Windows + Node 22): đã bỏ hẳn `node-sass`, chuyển sang `sass` (Dart Sass) — không còn bước build native nào nữa.
2. **Lỗi webpack `Can't import the named export ... from non EcmaScript module`** (từ `react-resizable`/`react-draggable`): đã gỡ `react-grid-layout` và component `FloatGrid` liên quan (không dùng trong ParkingPro).
3. **Lỗi `Can't resolve 'react-grid-layout/css/styles.css'`**: đã bỏ 2 dòng `@import` tương ứng trong `app/styles/plugins/plugins.css` và `plugins.scss`.

Nếu bạn đã tải bản ZIP cũ hơn, hãy tải lại bản mới nhất hoặc so sánh `package.json`/`app/styles/plugins/*` với bản này.
