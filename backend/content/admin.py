from django.contrib import admin
from .models import BaiViet, VinhDanh


@admin.register(BaiViet)
class BaiVietAdmin(admin.ModelAdmin):
    list_display = ['TieuDe', 'TrangThai', 'NgayDang']
    list_filter = ['TrangThai']
    search_fields = ['TieuDe']


@admin.register(VinhDanh)
class VinhDanhAdmin(admin.ModelAdmin):
    list_display = ['TenSinhVien', 'ThanhTich', 'NgayTao']
    search_fields = ['TenSinhVien']
