from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import TaiKhoan, NguoiDung


class LoginSerializer(serializers.Serializer):
    TenDangNhap = serializers.CharField()
    MatKhau = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['TenDangNhap'], password=data['MatKhau'])
        if not user:
            raise serializers.ValidationError('Tên đăng nhập hoặc mật khẩu không đúng.')
        if user.TrangThai != 'Active':
            raise serializers.ValidationError('Tài khoản đã bị khóa.')
        data['user'] = user
        return data


class TaiKhoanSerializer(serializers.ModelSerializer):
    HoTen = serializers.SerializerMethodField()
    Email = serializers.SerializerMethodField()

    class Meta:
        model = TaiKhoan
        fields = ['id', 'TenDangNhap', 'VaiTro', 'TrangThai', 'NgayTao', 'HoTen', 'Email']
        read_only_fields = ['id', 'NgayTao']

    def get_HoTen(self, obj):
        if obj.VaiTro == 'SinhVien':
            try:
                return obj.sinh_vien.HoTen
            except Exception:
                return obj.TenDangNhap
        else:
            try:
                return obj.nguoi_dung.HoTen
            except Exception:
                return obj.TenDangNhap

    def get_Email(self, obj):
        if obj.VaiTro == 'SinhVien':
            return f"{obj.TenDangNhap}@due.udn.vn" # Giả lập email SV
        else:
            try:
                return obj.nguoi_dung.Email
            except Exception:
                return f"{obj.TenDangNhap}@due.udn.vn"


class TaiKhoanCreateSerializer(serializers.ModelSerializer):
    MatKhau = serializers.CharField(write_only=True)
    HoTen = serializers.CharField(required=True)
    Email = serializers.EmailField(required=False, allow_blank=True)
    Lop = serializers.CharField(required=False, allow_blank=True)
    Khoa = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = TaiKhoan
        fields = ['TenDangNhap', 'MatKhau', 'VaiTro', 'HoTen', 'Email', 'Lop', 'Khoa']

    def create(self, validated_data):
        from django.db import transaction
        
        password = validated_data.pop('MatKhau')
        ho_ten = validated_data.pop('HoTen')
        email = validated_data.pop('Email', '')
        lop = validated_data.pop('Lop', 'Chưa cập nhật')
        khoa = validated_data.pop('Khoa', 'Chưa cập nhật')
        
        vai_tro = validated_data.get('VaiTro', 'SinhVien')
        
        # Validate email unique for non-student roles
        if vai_tro != 'SinhVien' and email:
            from .models import NguoiDung
            if NguoiDung.objects.filter(Email=email).exists():
                raise serializers.ValidationError({'Email': ['Email này đã được sử dụng bởi một tài khoản khác.']})
        
        with transaction.atomic():
            user = TaiKhoan(**validated_data)
            user.set_password(password)
            user.save()
            
            if vai_tro == 'SinhVien':
                from students.models import SinhVien
                SinhVien.objects.create(
                    TaiKhoan=user,
                    HoTen=ho_ten,
                    MaSV=user.TenDangNhap,
                    Lop=lop or 'Chưa cập nhật',
                    Khoa=khoa or 'Chưa cập nhật'
                )
            else:
                if not email:
                    email = f"{user.TenDangNhap}@due.udn.vn"
                NguoiDung.objects.create(
                    TaiKhoan=user,
                    HoTen=ho_ten,
                    Email=email
                )
        return user


class NguoiDungSerializer(serializers.ModelSerializer):
    TenDangNhap = serializers.CharField(source='TaiKhoan.TenDangNhap', read_only=True)
    VaiTro = serializers.CharField(source='TaiKhoan.VaiTro', read_only=True)

    class Meta:
        model = NguoiDung
        fields = ['id', 'HoTen', 'Email', 'TenDangNhap', 'VaiTro']


class MeSerializer(serializers.ModelSerializer):
    """Thông tin tài khoản hiện tại + profile"""
    profile = serializers.SerializerMethodField()

    class Meta:
        model = TaiKhoan
        fields = ['id', 'TenDangNhap', 'VaiTro', 'TrangThai', 'profile']

    def get_profile(self, obj):
        if obj.VaiTro == 'SinhVien':
            try:
                from students.serializers import SinhVienProfileSerializer
                return SinhVienProfileSerializer(obj.sinh_vien).data
            except Exception:
                return None
        else:
            try:
                from .models import NguoiDung
                nd = obj.nguoi_dung
                return NguoiDungSerializer(nd).data
            except Exception:
                return None
