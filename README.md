# Building Management System

Hệ thống quản lý tòa nhà, bao gồm quản lý cư dân và thanh toán phí dịch vụ.

## Công nghệ sử dụng

### Frontend

- React + Vite
- Tailwind CSS
- Các thư viện: axios, react-router-dom, ...

### Backend

- Node.js + Express
- MySQL
- CORS để hỗ trợ cross-origin requests
- Các thư viện: dayjs, mysql2, ...

## Đường dẫn dự án

- Frontend: [https://it-3180-2025-1-se-08.vercel.app](https://it-3180-2025-1-se-08.vercel.app)
- Backend API: [https://deploybe-two.vercel.app](https://deploybe-two.vercel.app)

## Hướng dẫn cài đặt

### Backend (BE)

1. Di chuyển vào thư mục BE:

```bash
cd BE
```

2. Cài đặt các dependencies:

```bash
npm install
```

3. Cài đặt các package cần thiết:

```bash
# Cài đặt CORS để cho phép cross-origin requests
npm install cors

# Cài đặt dayjs và plugins để xử lý timezone
npm install dayjs

# Các package khác nếu thiếu
npm install express mysql2
```

4. Tạo file `.env` với nội dung:

```env
PORT=3000
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=building_management
```

5. Khởi chạy server development:

```bash
npm run dev
```

### Frontend (FE)

1. Di chuyển vào thư mục FE:

```bash
cd FE
```

2. Cài đặt các dependencies:

```bash
npm install
```

3. Cài đặt và cấu hình Tailwind CSS:

```bash
# Cài đặt Tailwind CSS và các dependencies
npm install -D tailwindcss postcss autoprefixer

# Khởi tạo file cấu hình Tailwind
npx tailwindcss init -p
```

4. Tạo file `.env` với nội dung:

```env
VITE_API_BASE_URL=http://localhost:3000
```

4. Khởi chạy server development:

```bash
npm run dev
```

## Cấu trúc thư mục

```
├── BE/                 # Backend source code
│   ├── app.js         # Express server & API endpoints
│   └── FILE.sql       # Database schema
├── FE/                # Frontend source code
│   ├── src/
│   │   ├── layouts/   # Common layouts
│   │   └── pages/     # React components by feature
│   └── package.json
└── README.md
```

## Link demo

1. Link demo 3-11-2025: https://drive.google.com/file/d/1T5CA9tu9Wm4PaGRermAaTMNcgHef_5mP/view?usp=sharing
