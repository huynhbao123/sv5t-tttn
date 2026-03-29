from django.db import migrations


def backfill_ngay_giai_trinh_xacminh(apps, schema_editor):
    XacMinh = apps.get_model('students', 'XacMinh')
    for xm in XacMinh.objects.filter(
        GiaiTrinhSV__isnull=False,
        NgayGiaiTrinh__isnull=True
    ).exclude(GiaiTrinhSV=''):
        xm.NgayGiaiTrinh = xm.NgayCapNhat
        xm.save(update_fields=['NgayGiaiTrinh'])


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0006_add_ngay_giai_trinh_to_xac_minh'),
    ]

    operations = [
        migrations.RunPython(backfill_ngay_giai_trinh_xacminh, migrations.RunPython.noop),
    ]
