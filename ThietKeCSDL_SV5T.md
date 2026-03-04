# THIẾT KẾ CƠ SỞ DỮ LIỆU

## Hệ thống Xét duyệt Sinh viên 5 Tốt - Trường ĐH Kinh tế Đà Nẵng

---

## 4.1. Thiết kế cơ sở dữ liệu

### 4.1.1. Các bảng CSDL

**TaiKhoan**(<u>MaTaiKhoan</u>, TenDangNhap, MatKhau, VaiTro, TrangThai)

**SinhVien**(<u>MaSinhVien</u>, <u>MaTaiKhoan</u>, HoTen, MaSV, Lop, Khoa, DiemTBC, DiemRenLuyen, DiemTheDuc, TrinhDoNgoaiNgu, GPANgoaiNgu, LaDangVien, KhongViPham, TrangThaiHoSo, TongDiem, PhanHoiChung)

**NhomTieuChi**(<u>MaNhomTC</u>, TenNhom, MoTa)

**TieuChi**(<u>MaTieuChi</u>, <u>MaNhomTC</u>, MoTa, LoaiTieuChi, Diem, CoSoQuyetDinh)

**DiemTheoCapDo**(<u>MaDiemCapDo</u>, <u>MaTieuChi</u>, CapDo, Diem)

**MinhChung**(<u>MaMinhChung</u>, <u>MaSinhVien</u>, <u>MaTieuChi</u>, TenMinhChung, CapDo, LoaiMinhChung, SoQuyetDinh, DuongDanFile, TenFile, NgayNop, Diem, LaTieuChiCung, TrangThai, PhanHoiAdmin, GiaiTrinhSV)

**XacMinh**(<u>MaXacMinh</u>, <u>MaSinhVien</u>, TruongDuLieu, TrangThai, PhanHoi)

**NguoiDung**(<u>MaNguoiDung</u>, <u>MaTaiKhoan</u>, HoTen, Email, VaiTro)

**BaiViet**(<u>MaBaiViet</u>, TieuDe, NoiDung, NgayDang, TrangThai)

**VinhDanh**(<u>MaVinhDanh</u>, TenSinhVien, ThanhTich, NoiDung, HinhAnh)

---

### 4.1.2. Chi tiết các bảng

---

#### Bảng 1: **TaiKhoan** – Lưu thông tin tài khoản đăng nhập

| STT | Tên trường      | Kiểu dữ liệu   | Ràng buộc      | Mô tả                                    |
|-----|-----------------|-----------------|-----------------|-------------------------------------------|
| 1   | MaTaiKhoan      | INT             | PRIMARY KEY, AI | Mã tài khoản (tự tăng)                   |
| 2   | TenDangNhap     | NVARCHAR(100)   | NOT NULL, UNIQUE| Tên đăng nhập (mã SV hoặc username)      |
| 3   | MatKhau         | NVARCHAR(255)   | NOT NULL        | Mật khẩu (đã mã hóa)                     |
| 4   | VaiTro          | NVARCHAR(20)    | NOT NULL        | 'SinhVien' / 'Admin' / 'ThuKy' / 'ThamDinh' |
| 5   | TrangThai       | NVARCHAR(20)    | DEFAULT 'Active'| 'Active' / 'Inactive'                     |

---

#### Bảng 2: **SinhVien** – Lưu thông tin và hồ sơ sinh viên xét duyệt SV5T

| STT | Tên trường      | Kiểu dữ liệu   | Ràng buộc       | Mô tả                                    |
|-----|-----------------|-----------------|------------------|-------------------------------------------|
| 1   | MaSinhVien      | INT             | PRIMARY KEY, AI  | Mã sinh viên (tự tăng)                   |
| 2   | MaTaiKhoan      | INT             | FK → TaiKhoan    | Liên kết tài khoản đăng nhập             |
| 3   | HoTen           | NVARCHAR(100)   | NOT NULL         | Họ và tên sinh viên                      |
| 4   | MaSV            | NVARCHAR(20)    | NOT NULL, UNIQUE | Mã số sinh viên (VD: 20123456)           |
| 5   | Lop             | NVARCHAR(50)    | NOT NULL         | Lớp học (VD: K20.CNTT)                   |
| 6   | Khoa            | NVARCHAR(100)   | NOT NULL         | Khoa (VD: Khoa CNTT)                     |
| 7   | DiemTBC         | FLOAT           | DEFAULT 0        | Điểm trung bình tích lũy (thang 4.0)    |
| 8   | DiemRenLuyen    | INT             | DEFAULT 0        | Điểm rèn luyện (0–100)                  |
| 9   | DiemTheDuc      | FLOAT           | DEFAULT 0        | Điểm trung bình môn thể dục (thang 10)  |
| 10  | TrinhDoNgoaiNgu | NVARCHAR(20)    | DEFAULT 'None'   | 'None' / 'B1' / 'B2'                    |
| 11  | GPANgoaiNgu     | FLOAT           | DEFAULT 0        | GPA ngoại ngữ tích lũy (thang 4.0)      |
| 12  | LaDangVien      | BIT             | DEFAULT 0        | Là Đảng viên (1: Có, 0: Không)          |
| 13  | KhongViPham     | BIT             | DEFAULT 1        | Không vi phạm pháp luật, nội quy        |
| 14  | TrangThaiHoSo   | NVARCHAR(20)    | DEFAULT 'Draft'  | 'Draft' / 'Submitted' / 'Processing' / 'Approved' / 'Rejected' |
| 15  | TongDiem        | FLOAT           | DEFAULT 0        | Tổng điểm tích lũy dự kiến             |
| 16  | PhanHoiChung    | NVARCHAR(500)   |                  | Phản hồi chung từ Admin                 |

---

#### Bảng 3: **NhomTieuChi** – Nhóm 5 tiêu chí đánh giá SV5T

| STT | Tên trường | Kiểu dữ liệu | Ràng buộc      | Mô tả                                    |
|-----|------------|---------------|-----------------|-------------------------------------------|
| 1   | MaNhomTC   | INT           | PRIMARY KEY, AI | Mã nhóm tiêu chí                         |
| 2   | TenNhom    | NVARCHAR(50)  | NOT NULL, UNIQUE| 'Đạo đức tốt' / 'Học tập tốt' / 'Thể lực tốt' / 'Tình nguyện tốt' / 'Hội nhập tốt' |
| 3   | MoTa       | NVARCHAR(500) |                 | Mô tả chi tiết nhóm tiêu chí            |

---

#### Bảng 4: **TieuChi** – Chi tiết từng tiêu chí trong mỗi nhóm

| STT | Tên trường      | Kiểu dữ liệu   | Ràng buộc       | Mô tả                                    |
|-----|-----------------|-----------------|------------------|-------------------------------------------|
| 1   | MaTieuChi       | INT             | PRIMARY KEY, AI  | Mã tiêu chí                              |
| 2   | MaNhomTC        | INT             | FK → NhomTieuChi | Thuộc nhóm tiêu chí nào                 |
| 3   | MoTa            | NVARCHAR(500)   | NOT NULL         | Mô tả tiêu chí (VD: "Điểm rèn luyện đạt từ 80 điểm trở lên") |
| 4   | LoaiTieuChi     | NVARCHAR(10)    | NOT NULL         | 'Cung' (Cứng) / 'Cong' (Cộng)           |
| 5   | Diem            | FLOAT           |                  | Điểm cố định (nếu có, VD: 0.4 cho Đảng viên) |
| 6   | CoSoQuyetDinh   | BIT             | DEFAULT 0        | Có yêu cầu Số quyết định/GCN hay không  |
| 7   | SoLuongToiThieu | INT             |                  | Số lượng tối thiểu (VD: 3 ngày tình nguyện) |

---

#### Bảng 5: **DiemTheoCapDo** – Bảng điểm theo cấp độ cho từng tiêu chí

| STT | Tên trường   | Kiểu dữ liệu  | Ràng buộc      | Mô tả                                    |
|-----|-------------|----------------|-----------------|-------------------------------------------|
| 1   | MaDiemCapDo | INT            | PRIMARY KEY, AI | Mã bản ghi                               |
| 2   | MaTieuChi   | INT            | FK → TieuChi   | Tiêu chí áp dụng                         |
| 3   | CapDo       | NVARCHAR(50)   | NOT NULL        | 'Cấp Khoa/CLB' / 'Cấp Trường/Phường/Xã' / 'Cấp ĐHĐN' / 'Cấp Tỉnh/TP' / 'Cấp Trung ương' |
| 4   | Diem        | FLOAT          | NOT NULL        | Điểm tương ứng cấp độ (VD: 0.1, 0.2, ..., 0.5) |

---

#### Bảng 6: **MinhChung** – Minh chứng sinh viên nộp kèm hồ sơ

| STT | Tên trường      | Kiểu dữ liệu   | Ràng buộc        | Mô tả                                    |
|-----|-----------------|-----------------|-------------------|-------------------------------------------|
| 1   | MaMinhChung     | INT             | PRIMARY KEY, AI   | Mã minh chứng                            |
| 2   | MaSinhVien      | INT             | FK → SinhVien     | Sinh viên nộp minh chứng                 |
| 3   | MaTieuChi       | INT             | FK → TieuChi      | Tiêu chí mà minh chứng thuộc về         |
| 4   | TenMinhChung    | NVARCHAR(200)   | NOT NULL          | Tên minh chứng                           |
| 5   | CapDo           | NVARCHAR(50)    | NOT NULL          | Cấp độ minh chứng (Khoa/Trường/ĐHĐN/Tỉnh/TW) |
| 6   | LoaiMinhChung   | NVARCHAR(50)    | NOT NULL          | 'Không Sqđ/GCN thường' / 'Có Sqđ/GCN có mã số' / 'Giấy khen/Bằng khen' |
| 7   | SoQuyetDinh     | NVARCHAR(100)   |                   | Số quyết định / giấy chứng nhận (nếu có)|
| 8   | DuongDanFile    | NVARCHAR(500)   | NOT NULL          | Đường dẫn file minh chứng đã tải lên    |
| 9   | TenFile         | NVARCHAR(200)   |                   | Tên file gốc                            |
| 10  | NgayNop         | DATE            | NOT NULL          | Ngày nộp minh chứng                      |
| 11  | Diem            | FLOAT           | DEFAULT 0         | Điểm được tính cho minh chứng            |
| 12  | LaTieuChiCung   | BIT             | DEFAULT 0         | Là minh chứng tiêu chí cứng (1) hay cộng (0) |
| 13  | TrangThai       | NVARCHAR(30)    | DEFAULT 'Pending' | 'Pending' / 'Approved' / 'Rejected' / 'NeedsExplanation' |
| 14  | PhanHoiAdmin    | NVARCHAR(500)   |                   | Phản hồi / lý do từ Admin               |
| 15  | GiaiTrinhSV     | NVARCHAR(500)   |                   | Giải trình của sinh viên                 |

---

#### Bảng 7: **XacMinh** – Kết quả xác minh dữ liệu thủ công của Admin

| STT | Tên trường    | Kiểu dữ liệu  | Ràng buộc        | Mô tả                                    |
|-----|--------------|----------------|-------------------|-------------------------------------------|
| 1   | MaXacMinh    | INT            | PRIMARY KEY, AI   | Mã bản ghi xác minh                      |
| 2   | MaSinhVien   | INT            | FK → SinhVien     | Sinh viên được xác minh                  |
| 3   | TruongDuLieu | NVARCHAR(50)   | NOT NULL          | 'gpa' / 'trainingPoints' / 'peScore' / 'english' / 'partyMember' |
| 4   | TrangThai    | NVARCHAR(30)   | DEFAULT 'Pending' | 'Pending' / 'Approved' / 'Rejected' / 'NeedsExplanation' |
| 5   | PhanHoi      | NVARCHAR(500)  |                   | Phản hồi chi tiết                        |

---

#### Bảng 8: **NguoiDung** – Quản lý người dùng hệ thống (Admin, Thư ký, Thẩm định viên)

| STT | Tên trường   | Kiểu dữ liệu  | Ràng buộc        | Mô tả                                    |
|-----|-------------|----------------|-------------------|-------------------------------------------|
| 1   | MaNguoiDung | INT            | PRIMARY KEY, AI   | Mã người dùng                            |
| 2   | MaTaiKhoan  | INT            | FK → TaiKhoan     | Liên kết tài khoản đăng nhập             |
| 3   | HoTen       | NVARCHAR(100)  | NOT NULL          | Họ và tên                                |
| 4   | Email       | NVARCHAR(100)  | NOT NULL, UNIQUE  | Email                                    |
| 5   | VaiTro      | NVARCHAR(30)   | NOT NULL          | 'Admin' / 'Thư ký' / 'Thẩm định viên'  |

---

#### Bảng 9: **BaiViet** – Quản lý bài viết / thông báo

| STT | Tên trường  | Kiểu dữ liệu  | Ràng buộc        | Mô tả                                    |
|-----|------------|----------------|-------------------|-------------------------------------------|
| 1   | MaBaiViet  | INT            | PRIMARY KEY, AI   | Mã bài viết                              |
| 2   | TieuDe     | NVARCHAR(300)  | NOT NULL          | Tiêu đề bài viết                        |
| 3   | NoiDung    | NTEXT          |                   | Nội dung bài viết                        |
| 4   | NgayDang   | DATE           | NOT NULL          | Ngày đăng                                |
| 5   | TrangThai  | NVARCHAR(20)   | DEFAULT 'draft'   | 'draft' / 'published'                   |

---

#### Bảng 10: **VinhDanh** – Gương mặt sinh viên tiêu biểu (vinh danh)

| STT | Tên trường    | Kiểu dữ liệu  | Ràng buộc       | Mô tả                                    |
|-----|--------------|----------------|------------------|-------------------------------------------|
| 1   | MaVinhDanh   | INT            | PRIMARY KEY, AI  | Mã vinh danh                             |
| 2   | TenSinhVien  | NVARCHAR(100)  | NOT NULL         | Tên sinh viên được vinh danh             |
| 3   | ThanhTich    | NVARCHAR(200)  | NOT NULL         | Thành tích nổi bật                       |
| 4   | NoiDung      | NTEXT          |                  | Nội dung giới thiệu chi tiết            |
| 5   | HinhAnh      | NVARCHAR(500)  |                  | Đường dẫn hình ảnh                       |

---

### 4.1.3. Sơ đồ quan hệ giữa các bảng

```
TaiKhoan (1) ──── (1) SinhVien
TaiKhoan (1) ──── (1) NguoiDung

NhomTieuChi (1) ──── (N) TieuChi
TieuChi (1) ──── (N) DiemTheoCapDo
TieuChi (1) ──── (N) MinhChung

SinhVien (1) ──── (N) MinhChung
SinhVien (1) ──── (N) XacMinh
```

### 4.1.4. Mô tả quan hệ

| Quan hệ                        | Loại | Mô tả                                                        |
|---------------------------------|------|---------------------------------------------------------------|
| TaiKhoan – SinhVien             | 1:1  | Mỗi tài khoản sinh viên liên kết một hồ sơ sinh viên        |
| TaiKhoan – NguoiDung            | 1:1  | Mỗi tài khoản quản trị liên kết một người dùng               |
| NhomTieuChi – TieuChi           | 1:N  | Mỗi nhóm (Đạo đức, Học tập,...) có nhiều tiêu chí con       |
| TieuChi – DiemTheoCapDo         | 1:N  | Mỗi tiêu chí có điểm khác nhau theo 5 cấp độ                |
| TieuChi – MinhChung             | 1:N  | Mỗi tiêu chí có thể có nhiều minh chứng từ nhiều sinh viên  |
| SinhVien – MinhChung            | 1:N  | Mỗi sinh viên nộp nhiều minh chứng                           |
| SinhVien – XacMinh              | 1:N  | Mỗi sinh viên có nhiều bản ghi xác minh (GPA, RL, TD,...)   |
