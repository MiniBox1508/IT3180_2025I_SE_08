# 🏢 Phần Mềm Quản Lý Chung Cư Blue Moon

Đây là kho lưu trữ cho dự án Phần Mềm Quản Lý Chung Cư **Blue Moon**, được phát triển bằng React (Frontend) và Node.js/Express (Backend) với cơ sở dữ liệu MySQL.

## 🚀 Tổng Quan Dự Án

Hệ thống được thiết kế để quản lý thông tin cư dân, thông báo, và các giao dịch thanh toán phí dịch vụ, phí quản lý trong chung cư.

### Cấu Trúc Dự Án

Dự án được chia thành hai phần chính:

1.  **Frontend (FE):** Ứng dụng React được xây dựng bằng Vite.
2.  **Backend (BE):** API Server được xây dựng bằng Node.js và Express, kết nối với MySQL.

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Giao diện người dùng (UI) và logic phía client. |
| **Styling** | Tailwind CSS | Framework CSS Utility-first. |
| **Backend** | Node.js, Express | Xây dựng RESTful API Server. |
| **Database**| MySQL | Cơ sở dữ liệu quan hệ. |

## ⚙️ Hướng Dẫn Cài Đặt và Khởi Chạy

Bạn cần cài đặt Node.js, npm, và MySQL Server để chạy dự án.

### Bước 1: Cài Đặt Database (MySQL)

1.  **Tạo Database:** Tạo một cơ sở dữ liệu mới với tên mặc định là `building_management`.
    ```sql
    CREATE DATABASE building_management;
    USE building_management;
    ```
2.  **Cấu hình kết nối:** Cập nhật thông tin kết nối trong file `BE/app.js` nếu cần thiết (mặc định là `host: 'localhost'`, `user: 'root'`, `password: 'hungnohb123'`).
3.  **Tạo Bảng/Dữ liệu mẫu:** Chạy các lệnh SQL trong file `BE/FILE.sql` để tạo schema và chèn dữ liệu mẫu.

### Bước 2: Khởi Chạy Backend Server

1.  **Di chuyển vào thư mục Backend:**
    ```bash
    cd dang9805/wasd/wasd-BE3/BE
    ```
2.  **Cài đặt Dependencies:**
    ```bash
    npm install
    ```
3.  **Khởi động Server:** Server sẽ chạy trên cổng `3000`.
    ```bash
    node app.js
    ```

### Bước 3: Khởi Chạy Frontend (React App)

1.  **Di chuyển đến thư mục gốc của dự án:**
    ```bash
    cd dang9805/wasd/wasd-BE3
    ```
2.  **Cài đặt Dependencies:**
    ```bash
    npm install
    ```
3.  **Khởi động Ứng dụng:** Ứng dụng sẽ chạy ở chế độ phát triển (thường là cổng 5173). Vite proxy sẽ chuyển tiếp các yêu cầu `/api` sang Backend (cổng 3000).
    ```bash
    npm run dev
    ```

Ứng dụng sẽ tự động mở trong trình duyệt của bạn (hoặc bạn có thể truy cập thủ công).

## 🔑 Thông Tin Đăng Nhập

Truy cập `/welcome` để chọn vai trò.

| Vai trò | Đường dẫn Dashboard | Mặc định Username/Password (Email/Password) |
| :--- | :--- | :--- |
| **Ban Quản Trị** | `/dashboard` | Ví dụ: `dovanb@gmail.com` |
| **Dân Cư** | `/resident_dashboard` | Ví dụ: `dovanb@gmail.com` |

**(Lưu ý: Username/Password phụ thuộc vào dữ liệu bạn đã chèn vào MySQL)**.