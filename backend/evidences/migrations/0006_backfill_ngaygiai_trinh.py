from django.db import migrations


def backfill_ngay_giai_trinh(apps, schema_editor):
    MinhChung = apps.get_model('evidences', 'MinhChung')
    for mc in MinhChung.objects.filter(
        GiaiTrinhSV__isnull=False,
        NgayGiaiTrinh__isnull=True
    ).exclude(GiaiTrinhSV=''):
        mc.NgayGiaiTrinh = mc.NgayCapNhat
        mc.save(update_fields=['NgayGiaiTrinh'])


class Migration(migrations.Migration):

    dependencies = [
        ('evidences', '0005_minhchung_ngaygiaitrinh_minhchung_ngayminhchung'),
    ]

    operations = [
        migrations.RunPython(backfill_ngay_giai_trinh, migrations.RunPython.noop),
    ]
