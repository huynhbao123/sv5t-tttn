from django.db import migrations

def update_khong_so_quyet_dinh(apps, schema_editor):
    TieuChi = apps.get_model('criteria', 'TieuChi')
    # Với các tiêu chí đang yêu cầu SQĐ (CoSoQuyetDinh=True), đặt KhongSoQuyetDinh=False
    TieuChi.objects.filter(CoSoQuyetDinh=True).update(KhongSoQuyetDinh=False)
    # Với các tiêu chí không yêu cầu SQĐ (CoSoQuyetDinh=False), đặt KhongSoQuyetDinh=True
    TieuChi.objects.filter(CoSoQuyetDinh=False).update(KhongSoQuyetDinh=True)

class Migration(migrations.Migration):

    dependencies = [
        ('criteria', '0003_tieuchi_khongsoquyetdinh'),
    ]

    operations = [
        migrations.RunPython(update_khong_so_quyet_dinh),
    ]
