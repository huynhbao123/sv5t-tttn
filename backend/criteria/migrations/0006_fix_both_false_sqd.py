from django.db import migrations


def fix_both_false_sqd(apps, schema_editor):
    """
    Sửa các tiêu chí có cả CoSoQuyetDinh=False VÀ KhongSoQuyetDinh=False.
    Trạng thái này không hợp lệ vì sinh viên sẽ không thể chọn hình thức nộp nào.
    => Đặt KhongSoQuyetDinh=True (hình thức mặc định linh hoạt hơn).
    """
    TieuChi = apps.get_model('criteria', 'TieuChi')
    fixed = TieuChi.objects.filter(
        CoSoQuyetDinh=False,
        KhongSoQuyetDinh=False
    ).update(KhongSoQuyetDinh=True)
    if fixed:
        print(f'  Fixed {fixed} TieuChi records with both SQD flags = False.')


class Migration(migrations.Migration):

    dependencies = [
        ('criteria', '0005_allow_both_co_khong_sqd'),
    ]

    operations = [
        migrations.RunPython(fix_both_false_sqd, migrations.RunPython.noop),
    ]
