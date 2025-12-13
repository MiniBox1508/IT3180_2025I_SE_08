# Hướng Dẫn Triển Khai Frontend Lên Vercel

## 1. Chuẩn Bị Dự Án

- Đảm bảo bạn đã hoàn thiện source code FE trong thư mục này.
- Kiểm tra file `package.json` đã có đủ các dependencies cần thiết.
- Đảm bảo file `vercel.json` đã được cấu hình đúng (nếu có yêu cầu đặc biệt về build hoặc routing).

## 2. Đăng Nhập Vercel

- Truy cập [https://vercel.com/](https://vercel.com/) và đăng nhập bằng tài khoản GitHub, GitLab hoặc email.

## 3. Kết Nối Repository

- Nếu dự án của bạn đã được lưu trên GitHub/GitLab/Bitbucket, hãy kết nối repository với Vercel.
- Nếu chưa, bạn có thể upload thủ công hoặc khởi tạo một repository mới rồi push code lên.

## 4. Tạo Project Mới Trên Vercel

- Nhấn nút **New Project** trên dashboard Vercel.
- Chọn repository chứa source code FE.
- Chọn thư mục FE làm root (nếu repository chứa cả BE và FE).

## 5. Thiết Lập Build & Output

- Vercel sẽ tự động nhận diện framework (React, Vite, Next.js, v.v.).
- Nếu dùng Vite, Vercel sẽ build với lệnh `vite build` hoặc `npm run build`.
- Đảm bảo output directory là `dist` (mặc định của Vite). Nếu khác, chỉnh lại trong phần cấu hình.

## 6. Cấu Hình Environment Variables (nếu cần)

- Nếu dự án cần biến môi trường (API URL, v.v.), vào tab **Settings > Environment Variables** để thêm.

## 7. Kiểm Tra vercel.json (nếu có)

- Đảm bảo các cấu hình về rewrites, redirects, headers... trong `vercel.json` là chính xác.
- Nếu không có yêu cầu đặc biệt, có thể bỏ qua file này.

## 8. Deploy

- Nhấn **Deploy** để bắt đầu quá trình triển khai.
- Vercel sẽ tự động build và xuất bản website.
- Sau khi hoàn tất, bạn sẽ nhận được link public dạng `https://<project-name>.vercel.app`

## 9. Kiểm Tra Sau Deploy

- Truy cập link public để kiểm tra giao diện và chức năng.
- Nếu có lỗi, kiểm tra lại log build trên Vercel và cấu hình dự án.

## 10. Cập Nhật Code

- Mỗi lần push code mới lên repository, Vercel sẽ tự động build lại và cập nhật website.

---

**Lưu ý:**

- Nếu gặp lỗi về build, hãy kiểm tra lại phiên bản Node.js, các package, và cấu hình build.
- Đảm bảo các file tĩnh (ảnh, CSS, v.v.) nằm đúng vị trí và được import hợp lệ.
- Nếu cần custom domain, vào phần **Domains** trên Vercel để thêm tên miền riêng.

Chúc bạn triển khai thành công FE lên Vercel!
