from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class TaiKhoanManager(BaseUserManager):
    def create_user(self, TenDangNhap, password=None, **extra_fields):
        if not TenDangNhap:
            raise ValueError('Phải có tên đăng nhập')
        user = self.model(TenDangNhap=TenDangNhap, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, TenDangNhap, password=None, **extra_fields):
        extra_fields.setdefault('VaiTro', 'Admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(TenDangNhap, password, **extra_fields)


class TaiKhoan(AbstractBaseUser, PermissionsMixin):
    VAI_TRO_CHOICES = [
        ('SinhVien', 'Sinh viên'),
        ('Admin', 'Quản trị viên'),
        ('ThuKy', 'Thư ký'),
        ('ThamDinh', 'Thẩm định'),
    ]
    TRANG_THAI_CHOICES = [
        ('Active', 'Hoạt động'),
        ('Inactive', 'Không hoạt động'),
    ]

    TenDangNhap = models.CharField(max_length=100, unique=True)
    VaiTro = models.CharField(max_length=20, choices=VAI_TRO_CHOICES, default='SinhVien')
    TrangThai = models.CharField(max_length=20, choices=TRANG_THAI_CHOICES, default='Active')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    NgayTao = models.DateTimeField(auto_now_add=True)
    NgayCapNhat = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'TenDangNhap'
    REQUIRED_FIELDS = []

    objects = TaiKhoanManager()

    class Meta:
        db_table = 'TaiKhoan'
        verbose_name = 'Tài khoản'

    def __str__(self):
        return f"{self.TenDangNhap} ({self.VaiTro})"

    @property
    def is_admin(self):
        return self.VaiTro in ['Admin', 'ThuKy', 'ThamDinh']


class NguoiDung(models.Model):
    """Profile cho Admin / Thư ký / Thẩm định"""
    TaiKhoan = models.OneToOneField(
        TaiKhoan, on_delete=models.CASCADE, related_name='nguoi_dung'
    )
    HoTen = models.CharField(max_length=100)
    Email = models.EmailField(max_length=100, unique=True)
    NgayTao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'NguoiDung'
        verbose_name = 'Người dùng quản trị'

    def __str__(self):
        return self.HoTen
