# Hướng dẫn khởi chạy dự án SV5T_TTTN

Sau khi bật máy tính, bạn cần mở **2 cửa sổ Terminal** (Terminal trong VS Code hoặc PowerShell) để chạy đồng thời cả Backend và Frontend.

> [!IMPORTANT]
> **Cấu hình môi trường (.env):**
> Trước khi chạy lần đầu, hãy sao chép file `backend/.env.example` thành `backend/.env`. File này lưu trữ các biến bảo mật không được đưa lên Git.

## 1. Khởi chạy Backend (Django)
Tại thư mục gốc của dự án (`SV5T_TTTN`):
```powershell
# Chạy server Django
backend\venv\Scripts\python.exe backend\manage.py runserver
```
*Server sẽ chạy tại: http://localhost:8000*
*Trang Admin: http://localhost:8000/admin/*

## 2. Khởi chạy Frontend (React + Vite)
Tại thư mục gốc của dự án, bạn cũng có thể gộp lệnh hoặc `cd` vào thư mục `frontend`:
```powershell
cd frontend
npm run dev
```
*Giao diện web sẽ chạy tại: http://localhost:5173*

---

> [!TIP]
> **Cách nhanh nhất:** Bạn chỉ cần mở VS Code lên, các Terminal cũ thường sẽ được lưu lại. Bạn chỉ cần vào các tab Terminal đó và nhấn `mũi tên lên` rồi `Enter` là xong!
