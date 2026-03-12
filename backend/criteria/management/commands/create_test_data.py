"""Management command to create test accounts for development"""
from django.core.management.base import BaseCommand
from accounts.models import TaiKhoan, NguoiDung
from students.models import SinhVien


class Command(BaseCommand):
    help = 'Tạo tài khoản test: admin và 1 sinh viên mẫu'

    def handle(self, *args, **options):
        # Admin
        if not TaiKhoan.objects.filter(TenDangNhap='admin').exists():
            admin = TaiKhoan.objects.create_superuser('admin', 'admin123')
            admin.VaiTro = 'Admin'
            admin.save()
            NguoiDung.objects.create(TaiKhoan=admin, HoTen='Quản trị viên', Email='admin@due.edu.vn')
            self.stdout.write(self.style.SUCCESS('✓ Admin: admin / admin123'))

        # Sinh viên mẫu
        if not TaiKhoan.objects.filter(TenDangNhap='20123456').exists():
            sv_acc = TaiKhoan.objects.create_user('20123456', 'sv123456', VaiTro='SinhVien')
            SinhVien.objects.create(
                TaiKhoan=sv_acc,
                HoTen='Nguyễn Văn A',
                MaSV='20123456',
                Lop='K20.CNTT',
                Khoa='Khoa Công nghệ Thông tin',
                DiemTBC=3.2,
                DiemRenLuyen=85,
                DiemTheDuc=7.5,
                TrinhDoNgoaiNgu='B2',
                GPANgoaiNgu=2.8,
                LaDangVien=False,
                KhongViPham=True,
            )
            self.stdout.write(self.style.SUCCESS('✓ Sinh viên: 20123456 / sv123456'))

        self.stdout.write(self.style.SUCCESS('\n✅ Tạo tài khoản test hoàn tất!'))
