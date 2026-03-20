from django.core.management.base import BaseCommand
from django.db import transaction

class Command(BaseCommand):
    help = 'Seed initial admin and staff accounts for production'

    def handle(self, *args, **options):
        from accounts.models import TaiKhoan, NguoiDung

        users = [
            {
                'TenDangNhap': 'admin',
                'password': 'Admin@123',
                'VaiTro': 'Admin',
                'is_staff': True,
                'is_superuser': True,
                'HoTen': 'Quản trị viên',
                'Email': 'admin@due.edu.vn',
            },
            {
                'TenDangNhap': 'thuky',
                'password': 'ThuKy@123',
                'VaiTro': 'ThuKy',
                'is_staff': True,
                'is_superuser': False,
                'HoTen': 'Thư ký',
                'Email': 'thuky@due.edu.vn',
            },
        ]

        for u in users:
            ho_ten = u.pop('HoTen')
            email = u.pop('Email')
            password = u.pop('password')

            if not TaiKhoan.objects.filter(TenDangNhap=u['TenDangNhap']).exists():
                with transaction.atomic():
                    acc = TaiKhoan.objects.create_user(password=password, **u)
                    NguoiDung.objects.create(TaiKhoan=acc, HoTen=ho_ten, Email=email)
                self.stdout.write(self.style.SUCCESS(f"Created user: {u['TenDangNhap']}"))
            else:
                self.stdout.write(f"User already exists: {u['TenDangNhap']}")
