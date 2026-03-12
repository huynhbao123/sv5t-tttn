from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import TaiKhoan, NguoiDung


@admin.register(TaiKhoan)
class TaiKhoanAdmin(UserAdmin):
    model = TaiKhoan
    list_display = ['TenDangNhap', 'VaiTro', 'TrangThai', 'NgayTao']
    list_filter = ['VaiTro', 'TrangThai']
    search_fields = ['TenDangNhap']
    ordering = ['-NgayTao']
    fieldsets = (
        (None, {'fields': ('TenDangNhap', 'password')}),
        ('Thông tin', {'fields': ('VaiTro', 'TrangThai')}),
        ('Quyền', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('TenDangNhap', 'password1', 'password2', 'VaiTro'),
        }),
    )


@admin.register(NguoiDung)
class NguoiDungAdmin(admin.ModelAdmin):
    list_display = ['HoTen', 'Email', 'NgayTao']
    search_fields = ['HoTen', 'Email']
