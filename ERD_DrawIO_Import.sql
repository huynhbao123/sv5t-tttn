-- SQL SCHEMA FOR DRAW.IO IMPORT (VERIFIED FOR AUTO-CONNECT)
-- To use this in draw.io:
-- 1. Open draw.io (app.diagrams.net)
-- 2. Click "+" (Insert) -> "Advanced" -> "SQL"
-- 3. Paste the code below and click "Insert"

CREATE TABLE TaiKhoan (
    id BIGINT PRIMARY KEY,
    TenDangNhap VARCHAR(100),
    password VARCHAR(128),
    VaiTro VARCHAR(20),
    TrangThai VARCHAR(20),
    is_staff BOOLEAN,
    is_active BOOLEAN,
    NgayTao DATETIME
);

CREATE TABLE NguoiDung (
    id INT PRIMARY KEY,
    TaiKhoan_id BIGINT,
    HoTen VARCHAR(100),
    Email VARCHAR(100) UNIQUE
);

CREATE TABLE SinhVien (
    id INT PRIMARY KEY,
    TaiKhoan_id BIGINT,
    MaSV VARCHAR(20) UNIQUE,
    HoTen VARCHAR(100),
    Lop VARCHAR(50),
    Khoa VARCHAR(100),
    DiemTBC FLOAT,
    DiemRenLuyen INT,
    DiemTheDuc FLOAT,
    TrinhDoNgoaiNgu VARCHAR(20),
    GPANgoaiNgu FLOAT,
    LaDangVien BOOLEAN,
    TrangThaiHoSo VARCHAR(20),
    TongDiem FLOAT
);

CREATE TABLE XacMinh (
    id INT PRIMARY KEY,
    SinhVien_id INT,
    TruongDuLieu VARCHAR(50),
    TrangThai VARCHAR(30),
    PhanHoiAdmin VARCHAR(500),
    GiaiTrinhSV VARCHAR(1000)
);

CREATE TABLE NhomTieuChi (
    id INT PRIMARY KEY,
    TenNhom VARCHAR(100),
    MoTa VARCHAR(500),
    ThuTu INT
);

CREATE TABLE TieuChi (
    id INT PRIMARY KEY,
    NhomTieuChi_id INT,
    MaTieuChi VARCHAR(50) UNIQUE,
    MoTa VARCHAR(500),
    LoaiTieuChi VARCHAR(10),
    Diem FLOAT,
    CoSoQuyetDinh BOOLEAN
);

CREATE TABLE DiemTheoCapDo (
    id INT PRIMARY KEY,
    TieuChi_id INT,
    CapDo VARCHAR(50),
    Diem FLOAT
);

CREATE TABLE MinhChung (
    id INT PRIMARY KEY,
    SinhVien_id INT,
    TieuChi_id INT,
    TenMinhChung VARCHAR(200),
    CapDo VARCHAR(50),
    LoaiMinhChung VARCHAR(50),
    SoQuyetDinh VARCHAR(100),
    Diem FLOAT,
    TrangThai VARCHAR(30)
);

CREATE TABLE MinhChungFile (
    id INT PRIMARY KEY,
    MinhChung_id INT,
    DuongDanFile VARCHAR(255),
    TenFile VARCHAR(200)
);

CREATE TABLE BaiViet (
    id INT PRIMARY KEY,
    TieuDe VARCHAR(300),
    NoiDung TEXT,
    TrangThai VARCHAR(20),
    NgayDang DATE
);

CREATE TABLE VinhDanh (
    id INT PRIMARY KEY,
    TenSinhVien VARCHAR(100),
    ThanhTich VARCHAR(200),
    NoiDung TEXT,
    HinhAnh VARCHAR(255)
);

-- EXPLICIT CONSTRAINTS FOR DRAW.IO RELATIONSHIP LINES
ALTER TABLE NguoiDung ADD CONSTRAINT fk_nguoidung_taikhoan FOREIGN KEY (TaiKhoan_id) REFERENCES TaiKhoan(id);
ALTER TABLE SinhVien ADD CONSTRAINT fk_sinhvien_taikhoan FOREIGN KEY (TaiKhoan_id) REFERENCES TaiKhoan(id);
ALTER TABLE XacMinh ADD CONSTRAINT fk_xacminh_sinhvien FOREIGN KEY (SinhVien_id) REFERENCES SinhVien(id);
ALTER TABLE TieuChi ADD CONSTRAINT fk_tieuchi_nhom FOREIGN KEY (NhomTieuChi_id) REFERENCES NhomTieuChi(id);
ALTER TABLE DiemTheoCapDo ADD CONSTRAINT fk_diemcapdo_tieuchi FOREIGN KEY (TieuChi_id) REFERENCES TieuChi(id);
ALTER TABLE MinhChung ADD CONSTRAINT fk_minhchung_sinhvien FOREIGN KEY (SinhVien_id) REFERENCES SinhVien(id);
ALTER TABLE MinhChung ADD CONSTRAINT fk_minhchung_tieuchi FOREIGN KEY (TieuChi_id) REFERENCES TieuChi(id);
ALTER TABLE MinhChungFile ADD CONSTRAINT fk_minhchungfile_minhchung FOREIGN KEY (MinhChung_id) REFERENCES MinhChung(id);
