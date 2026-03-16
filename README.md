# Hệ thống Quản lý Sinh Viên 5 Tốt (SV5T)

Hệ thống hỗ trợ nộp minh chứng, xét duyệt và vinh danh Sinh viên 5 Tốt hướng tới sự chuyên nghiệp và minh bạch.

## ✨ Tính năng nổi bật
*   **Xác thực bảo mật**: Sử dụng JWT với cơ chế Token Rotation và Refresh tự động.
*   **Xét duyệt đa cấp**: Admin có thể duyệt từng minh chứng hoặc duyệt nhanh (Batch actions).
*   **Audit Trail**: Mọi thay đổi trạng thái hồ sơ đều được lưu vết (LichSuHoSo) để đối soát.
*   **Điểm số linh hoạt**: Logic tính điểm hoàn toàn dựa trên cấu hình Database (DiemTheoCapDo).
*   **Giao diện hiện đại**: Responsive UI với các thông báo Toast chuyên nghiệp.

## 🚀 Hướng dẫn cài đặt

### Backend (Django)
1. Cài đặt Python 3.9+
2. Tạo venv: `python -m venv venv`
3. Cài đặt thư viện: `pip install -r requirements.txt`
4. Tạo file `.env` từ mẫu `.env.example`
5. Migrate DB: `python manage.py migrate`
6. Chạy server: `python manage.py runserver`

### Frontend (React + Vite)
1. Cài đặt Node.js
2. Cài đặt thư viện: `npm install`
3. Chạy dev: `npm run dev`

---
*Dự án được phát triển phục vụ đồ án tốt nghiệp với tiêu chuẩn mã nguồn sạch và kiến trúc mở rộng.*
