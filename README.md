# Bài tập thực hành số 3 — Đăng ký, đăng nhập React + ASP.NET Core + SQLite

Đây là **bản dự án TH3 độc lập**, xây dựng theo kiến trúc của repo TH2 tại <https://github.com/hackbynnam09/TH2>: giữ CRUD sản phẩm bằng ASP.NET Core / EF Core / SQLite, chuyển frontend từ JavaScript thuần sang React và bổ sung luồng xác thực.

> Chú ý: Bản ZIP được dựng từ cấu trúc và API công khai của TH2, **không phải bản clone nguyên trạng repository TH2**. Tệp CSDL sử dụng `practice3.db` độc lập để tránh xung đột migration của TH2.

## 1. Tính năng đáp ứng đề bài

- Đăng ký qua email/password; kiểm tra email, tối thiểu 8 ký tự, có chữ và số, nhập lại mật khẩu ở giao diện.
- Validate cả frontend **và** backend, báo lỗi email trùng/đăng nhập thất bại.
- API lưu `Users` vào SQLite qua EF Core. `NormalizedEmail` có unique index.
- Mật khẩu lưu bằng `PasswordHasher<User>` (hash), **không lưu mật khẩu gốc**.
- Đăng nhập truy vấn bảng `Users`, xác minh hash, cấp JWT có thời hạn 8 giờ.
- React Context quản lý `user`, `checking`, `login`, `register`, `logout`.
- localStorage giữ `th3_token` (JWT) và `th3_user` (thông tin công khai). F5 vẫn đăng nhập; API `/api/auth/me` xác thực lại token.
- Dashboard quản lý sản phẩm: xem, tạo, sửa, xóa, tìm kiếm, thống kê; endpoint sản phẩm yêu cầu `Authorization: Bearer <token>`.

## 2. Yêu cầu hệ thống

- .NET **10 SDK**: chạy `dotnet --version` để kiểm tra.
- Node.js **20.19+ hoặc 22.12+**: chạy `node -v`, `npm -v`.
- Có Internet khi chạy `dotnet restore` và `npm install` lần đầu.

## 3. Cách chạy (hai terminal)

### Terminal 1 — backend

```bash
cd backend/ProductApi
dotnet restore
dotnet run --urls http://localhost:5050
```

Cấu hình chạy mặc định ở `Properties/launchSettings.json` đặt môi trường `Development` để nạp khóa JWT demo. Nếu chạy với `--no-launch-profile`, cần tự đặt `ASPNETCORE_ENVIRONMENT=Development` và khóa JWT qua biến môi trường.

Lần đầu chạy, `db.Database.Migrate()` tự tạo file `backend/ProductApi/practice3.db`, gồm hai bảng **Products** và **Users**. Test backend tại <http://localhost:5050/>.

Có thể xem danh sách migration (nếu đã cài `dotnet-ef`):

```bash
dotnet tool install --global dotnet-ef --version 10.0.0
dotnet ef migrations list
```

Nếu đã có `dotnet-ef` thì dùng `dotnet tool update --global dotnet-ef --version 10.0.0`.

**Bảo mật khóa JWT:** `appsettings.Development.json` chứa khóa *chỉ dành cho demo học tập*. KHÔNG sử dụng khóa này khi triển khai thực tế. Nếu đổi môi trường, đặt `Jwt__Key` bằng biến môi trường chứa chuỗi bí mật ngẫu nhiên dài ít nhất 32 byte. Tránh commit khóa thật lên Git.

### Terminal 2 — frontend

```bash
cd frontend
npm install
npm run dev
```

Mở <http://localhost:5173>. Frontend mặc định gọi API `http://localhost:5050`. Để đổi, sao chép `frontend/.env.example` thành `frontend/.env` và sửa `VITE_API_BASE_URL`.

## 4. Luồng demo khi nộp bài

1. Truy cập trang, nhấn **Đăng ký**, nhập email sai → thấy validation.
2. Nhập email hợp lệ và mật khẩu yếu → nhận lỗi; nhập password hợp lệ và confirm khớp → đăng ký thành công.
3. Thử đăng ký **trùng email** (kể cả khác chữ hoa/chữ thường) → bị từ chối.
4. Thử đăng nhập bằng mật khẩu sai → nhận lỗi; đăng nhập đúng → vào dashboard.
5. Mở DevTools > Application > Local Storage → xem `th3_token` và `th3_user` (không có mật khẩu).
6. F5 → vẫn đăng nhập vì Context phục hồi từ localStorage và kiểm chứng token qua API `/api/auth/me`.
7. CRUD sản phẩm bằng dashboard.
8. Nhấn **Đăng xuất** → xóa dữ liệu phiên ở localStorage, quay lại login.
9. Mở endpoint `http://localhost:5050/api/products` bằng tab mới không có JWT → trả về **401 Unauthorized**.

## 5. Các endpoint

| Method | Endpoint | Kết quả | Cần đăng nhập? |
|---|---|---|---|
| POST | `/api/auth/register` | 201 (đăng ký thành công), 400 (invalid), 409 (trùng) | Không |
| POST | `/api/auth/login` | 200 (JWT + user), 401 (sai thông tin) | Không |
| GET | `/api/auth/me` | 200 (profile), 401 (token lỗi/hết hạn) | Có |
| GET | `/api/products` | Danh sách sản phẩm | Có |
| GET | `/api/products/{id}` | Sản phẩm theo ID | Có |
| POST | `/api/products` | Tạo sản phẩm | Có |
| PUT | `/api/products/{id}` | Sửa sản phẩm | Có |
| DELETE | `/api/products/{id}` | Xóa sản phẩm | Có |

### Ví dụ POST đăng ký

```json
{ "email": "student@example.com", "password": "Student123" }
```

### Ví dụ POST đăng nhập

```json
{ "email": "student@example.com", "password": "Student123" }
```

API login trả về `token` và `user` (Id, Email, CreatedAtUtc), **không trả password hash**.

## 6. Kiến trúc & vị trí code

```
TH3_React_Auth_Fullstack/
├── backend/ProductApi/
│   ├── Controllers/
│   │   ├── AuthController.cs         Đăng ký, đăng nhập, lấy profile
│   │   └── ProductsController.cs     CRUD sản phẩm có [Authorize]
│   ├── Data/AppDbContext.cs         DbSet<User> + DbSet<Product>
│   ├── Dtos/AuthRequests.cs         DataAnnotations validate
│   ├── Dtos/ProductRequest.cs       Validate sản phẩm
│   ├── Models/User.cs               User, PasswordHash, NormalizedEmail
│   ├── Models/Product.cs            Entity Product
│   ├── Migrations/                  Migration Products + Users
│   ├── Properties/launchSettings.json   Cấu hình chạy Development/5050
│   ├── Program.cs                   EF Core, CORS, JWT bearer auth
│   ├── appsettings.json
│   └── appsettings.Development.json Demo JWT key
└── frontend/
    ├── src/
    │   ├── api/client.js           Axios + token interceptor
    │   ├── context/AuthContext.jsx  React Context + localStorage
    │   ├── components/Dashboard.jsx Quản lý sản phẩm
    │   ├── App.jsx                  Đăng ký / Đăng nhập + phân quyền UI
    │   ├── main.jsx
    │   └── style.css
    ├── package.json
    └── vite.config.js
```

## 7. Lưu ý quan trọng

- Đây là **bài thực hành học tập**. Trong ứng dụng triển khai thực tế, nên ưu tiên cơ chế session/refresh token qua cookie `HttpOnly`, HTTPS, rate limiting, xác minh email và xử lý bảo mật XSS/CSRF phù hợp. `localStorage` có thể bị đọc bởi mã JS độc hại khi xảy ra XSS.
- JWT lưu localStorage theo yêu cầu bài; `th3_user` chỉ là cache giao diện, **không phải bằng chứng đăng nhập**. Backend luôn xác thực JWT cho API được bảo vệ.
- Dashboard và cơ sở dữ liệu là phần chung cho các tài khoản trong bản demo, không phải dữ liệu riêng từng người. Muốn cô lập sản phẩm theo user cần bổ sung OwnerId và lọc query.
- API không trả mật khẩu gốc hay password hash về trình duyệt.
- Chạy bản TH3 tại thư mục này, không trỏ sang file `products.db` đã dùng cho TH2 vì lịch sử migration hai dự án không giống nhau.
