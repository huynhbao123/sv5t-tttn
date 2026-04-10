from django.core.management.base import BaseCommand
from django.db import transaction

class Command(BaseCommand):
    help = 'Seed initial admin and staff accounts for production'

    def handle(self, *args, **options):
        from accounts.models import TaiKhoan, NguoiDung

        users = [
            {
                'TenDangNhap': 'admin',
                'password': 'admin123',
                'VaiTro': 'Admin',
                'is_staff': True,
                'is_superuser': True,
                'HoTen': 'Quản trị viên',
                'Email': 'admin@due.edu.vn',
            },
            {
                'TenDangNhap': 'admin2',
                'password': 'admin123',
                'VaiTro': 'Admin',
                'is_staff': True,
                'is_superuser': True,
                'HoTen': 'Quản trị dự phòng',
                'Email': 'admin2@due.edu.vn',
            },
            {
                'TenDangNhap': 'thuky',
                'password': 'admin123',
                'VaiTro': 'ThuKy',
                'is_staff': True,
                'is_superuser': False,
                'HoTen': 'Thư ký',
                'Email': 'thuky@due.edu.vn',
            },
            {
                'TenDangNhap': '221121514105',
                'password': 'admin123',
                'VaiTro': 'SinhVien',
                'is_staff': False,
                'is_superuser': False,
                'HoTen': 'Sinh viên mẫu',
                'Email': 'student@due.udn.vn',
                'Lop': '22KT01',
                'Khoa': 'Kinh tế',
            },
        ]

        for u in users:
            ho_ten = u.pop('HoTen')
            email = u.pop('Email')
            password = u.pop('password')
            lop = u.pop('Lop', '')
            khoa = u.pop('Khoa', '')

            acc, created = TaiKhoan.objects.get_or_create(
                TenDangNhap=u['TenDangNhap'],
                defaults={
                    'VaiTro': u['VaiTro'],
                    'is_staff': u['is_staff'],
                    'is_superuser': u['is_superuser'],
                    'TrangThai': 'Active'
                }
            )
            
            # GIẢNG VIÊN YÊU CẦU: Cập nhật lại mật khẩu mặc định mỗi lần khởi động dự án
            # để đảm bảo người quản trị luôn biết mật khẩu vào hệ thống (admin123)
            acc.set_password(password)
            acc.save()
            
            if created:
                
                if acc.VaiTro == 'SinhVien':
                    from students.models import SinhVien
                    SinhVien.objects.create(
                        TaiKhoan=acc,
                        HoTen=ho_ten,
                        MaSV=acc.TenDangNhap,
                        Lop=lop,
                        Khoa=khoa
                    )
                else:
                    NguoiDung.objects.create(TaiKhoan=acc, HoTen=ho_ten, Email=email)
                self.stdout.write(self.style.SUCCESS(f"Created user: {u['TenDangNhap']}"))
            else:
                acc.TrangThai = 'Active'
                acc.save()
                self.stdout.write(f"User already exists, set to Active: {u['TenDangNhap']}")
