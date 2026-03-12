from django.contrib import admin
from .models import MinhChung


@admin.register(MinhChung)
class MinhChungAdmin(admin.ModelAdmin):
    list_display = ['TenMinhChung', 'SinhVien', 'TieuChi', 'CapDo', 'Diem', 'TrangThai', 'NgayNop']
    list_filter = ['TrangThai', 'CapDo', 'LoaiMinhChung']
    search_fields = ['TenMinhChung', 'SinhVien__MaSV', 'SinhVien__HoTen']
    readonly_fields = ['NgayNop', 'NgayTao', 'NgayCapNhat']
