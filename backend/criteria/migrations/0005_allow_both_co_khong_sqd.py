from django.db import migrations


def allow_both_co_va_khong_sqd(apps, schema_editor):
    """
    Migration 0004 đã ép buộc KhongSoQuyetDinh = !CoSoQuyetDinh (loại trừ lẫn nhau).
    Migration này fix lại: các tiêu chí CÓ SQĐ cũng được phép KHÔNG SQĐ
    nếu chúng nên support cả hai hình thức (do admin cấu hình).
    
    Cụ thể: Với các tiêu chí có CoSoQuyetDinh=True nhưng KhongSoQuyetDinh=False,
    ta đặt KhongSoQuyetDinh=True để cho phép sinh viên nộp cả hai hình thức.
    
    Admin có thể quay lại AdminDashboard > Quản lý tiêu chí để tắt KhongSoQuyetDinh
    cho các tiêu chí BẮT BUỘC phải có SQĐ.
    """
    TieuChi = apps.get_model('criteria', 'TieuChi')
    # Các tiêu chí có CoSoQuyetDinh=True bây giờ cũng cho phép KhongSoQuyetDinh=True
    # (tức là sinh viên có thể nộp bằng cả hai hình thức)
    TieuChi.objects.filter(CoSoQuyetDinh=True, KhongSoQuyetDinh=False).update(KhongSoQuyetDinh=True)


class Migration(migrations.Migration):

    dependencies = [
        ('criteria', '0004_fix_khongsoquyetdinh_data'),
    ]

    operations = [
        migrations.RunPython(allow_both_co_va_khong_sqd, migrations.RunPython.noop),
    ]
