from django.contrib import admin
from .models import SinhVien, XacMinh


@admin.register(SinhVien)
class SinhVienAdmin(admin.ModelAdmin):
    list_display = ['MaSV', 'HoTen', 'Lop', 'Khoa', 'TrangThaiHoSo', 'TongDiem']
    list_filter = ['TrangThaiHoSo', 'Khoa', 'LaDangVien']
    search_fields = ['MaSV', 'HoTen', 'Lop']
    readonly_fields = ['TongDiem', 'NgayTao', 'NgayCapNhat']


@admin.register(XacMinh)
class XacMinhAdmin(admin.ModelAdmin):
    list_display = ['SinhVien', 'TruongDuLieu', 'TrangThai', 'NgayCapNhat']
    list_filter = ['TrangThai', 'TruongDuLieu']
