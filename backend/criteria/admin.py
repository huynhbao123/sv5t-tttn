from django.contrib import admin
from .models import NhomTieuChi, TieuChi, DiemTheoCapDo


class DiemTheoCapDoInline(admin.TabularInline):
    model = DiemTheoCapDo
    extra = 1


class TieuChiInline(admin.TabularInline):
    model = TieuChi
    extra = 0


@admin.register(NhomTieuChi)
class NhomTieuChiAdmin(admin.ModelAdmin):
    list_display = ['TenNhom', 'ThuTu']
    inlines = [TieuChiInline]


@admin.register(TieuChi)
class TieuChiAdmin(admin.ModelAdmin):
    list_display = ['MoTa', 'NhomTieuChi', 'LoaiTieuChi', 'Diem', 'CoSoQuyetDinh']
    list_filter = ['LoaiTieuChi', 'NhomTieuChi', 'CoSoQuyetDinh']
    inlines = [DiemTheoCapDoInline]
