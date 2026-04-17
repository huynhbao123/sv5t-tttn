from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import os
import requests

from .models import TaiKhoan, NguoiDung
from .serializers import (
    LoginSerializer, TaiKhoanSerializer,
    TaiKhoanCreateSerializer, NguoiDungSerializer, MeSerializer
)
from .permissions import IsAdmin


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': MeSerializer(user).data,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Đăng xuất thành công.'})
        except Exception:
            return Response({'detail': 'Token không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)


class TaiKhoanListView(APIView):
    """Admin: Quản lý tài khoản"""
    permission_classes = [IsAdmin]

    def get(self, request):
        vai_tro = request.query_params.get('vaiTro')
        qs = TaiKhoan.objects.all()
        if vai_tro:
            qs = qs.filter(VaiTro=vai_tro)
        serializer = TaiKhoanSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaiKhoanCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(TaiKhoanSerializer(user).data, status=status.HTTP_201_CREATED)


class TaiKhoanDetailView(APIView):
    permission_classes = [IsAdmin]

    def get_object(self, pk):
        try:
            return TaiKhoan.objects.get(pk=pk)
        except TaiKhoan.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return Response({'detail': 'Không tìm thấy.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TaiKhoanSerializer(obj).data)

    def delete(self, request, pk):
        obj = self.get_object(pk)
        if not obj:
            return Response({'detail': 'Không tìm thấy.'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({'detail': 'Đã xóa tài khoản.'}, status=status.HTTP_204_NO_CONTENT)

class MicrosoftLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        if not code or not redirect_uri:
            return Response({'detail': 'Thiếu mã code hoặc redirect_uri'}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = os.getenv('MICROSOFT_TENANT_ID', 'common')
        client_id = os.getenv('MICROSOFT_CLIENT_ID')
        client_secret = os.getenv('MICROSOFT_CLIENT_SECRET')

        # 1. Exchange code for access token
        token_url = f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token'
        
        token_data = {
            'client_id': client_id,
            'scope': 'openid profile email User.Read',
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
            'client_secret': client_secret,
        }

        try:
            token_r = requests.post(token_url, data=token_data, timeout=15)
            if not token_r.ok:
                print(f"MS Token Error: {token_r.text}")
                return Response({
                    'detail': 'Lấy token từ Microsoft thất bại', 
                    'ms_error': token_r.json()
                }, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.Timeout:
            return Response({'detail': 'Kết nối đổi mã token Microsoft quá hạn.'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception as e:
            return Response({'detail': f'Lỗi hệ thống khi gọi Microsoft: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        access_token = token_r.json().get('access_token')

        # 2. Get user profile from Graph API
        user_url = 'https://graph.microsoft.com/v1.0/me'
        try:
            user_r = requests.get(user_url, headers={'Authorization': f'Bearer {access_token}'}, timeout=10)
            if not user_r.ok:
                return Response({'detail': 'Không thể lấy thông tin người dùng từ Microsoft'}, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.Timeout:
            return Response({'detail': 'Lấy profile Microsoft quá hạn.'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception as e:
            return Response({'detail': f'Lỗi lấy profile: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        ms_user = user_r.json()
        email = ms_user.get('mail') or ms_user.get('userPrincipalName')
        display_name = ms_user.get('displayName') or 'Người dùng Microsoft'

        if not email:
            return Response({'detail': 'Không tìm thấy email liên kết với tài khoản này'}, status=status.HTTP_400_BAD_REQUEST)

        username = email.split('@')[0]

        # 3. Handle Login/Register
        from .models import TaiKhoan
        
        user, created = TaiKhoan.objects.get_or_create(
            TenDangNhap=username,
            defaults={
                'VaiTro': 'SinhVien',
                'TrangThai': 'Active'
            }
        )

        if user.TrangThai != 'Active':
            return Response({'detail': 'Tài khoản của bạn đã bị khóa.'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure SinhVien profile exists for student role
        if user.VaiTro == 'SinhVien':
            from students.models import SinhVien
            SinhVien.objects.get_or_create(
                TaiKhoan=user,
                defaults={
                    'HoTen': display_name,
                    'MaSV': username,
                    'Lop': 'Chưa cập nhật',
                    'Khoa': 'Chưa cập nhật'
                }
            )
            if created:
                user.set_unusable_password()
                user.save()
        
        # 4. Issue Local JWT Token
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': MeSerializer(user).data,
        })


class ForgotPasswordView(APIView):
    """
    Quên mật khẩu: Nhận email → Tìm tài khoản → Tạo token → Gửi email chứa link reset.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Vui lòng nhập email.'}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm tài khoản qua email trong NguoiDung (Admin/ThuKy) hoặc SinhVien
        from students.models import SinhVien
        from .models import PasswordResetToken
        from django.core.mail import send_mail
        from django.conf import settings
        from django.utils import timezone

        user = None

        # 1. Tìm trong NguoiDung (Admin, ThuKy, ThamDinh)
        try:
            nguoi_dung = NguoiDung.objects.get(Email__iexact=email)
            user = nguoi_dung.TaiKhoan
        except NguoiDung.DoesNotExist:
            pass

        # 2. Tìm trong SinhVien
        if not user:
            try:
                sinh_vien = SinhVien.objects.get(Email__iexact=email)
                user = sinh_vien.TaiKhoan
            except SinhVien.DoesNotExist:
                pass

        if not user:
            # Không tiết lộ email có tồn tại hay không (bảo mật)
            return Response({
                'detail': 'Nếu email này có trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu.'
            }, status=status.HTTP_200_OK)

        # Vô hiệu hóa tất cả token cũ chưa dùng
        PasswordResetToken.objects.filter(
            TaiKhoan=user, DaSuDung=False
        ).update(DaSuDung=True)

        # Tạo token mới (15 phút)
        token_obj = PasswordResetToken.objects.create(
            TaiKhoan=user,
            HetHan=timezone.now() + timezone.timedelta(minutes=15)
        )

        # Tạo link reset
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password?token={token_obj.Token}"

        # Gửi email
        subject = '🔐 Đặt lại mật khẩu - Hệ thống Sinh viên 5 Tốt'
        message = (
            f"Xin chào,\n\n"
            f"Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản: {user.TenDangNhap}\n\n"
            f"Nhấn vào liên kết dưới đây để đặt mật khẩu mới (có hiệu lực trong 15 phút):\n\n"
            f"{reset_link}\n\n"
            f"Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n"
            f"Trân trọng,\n"
            f"Hệ thống Sinh viên 5 Tốt - ĐH Kinh tế - ĐHĐN"
        )

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"[ForgotPassword] Email send error: {e}")
            return Response({
                'detail': 'Lỗi khi gửi email. Vui lòng thử lại sau hoặc liên hệ Admin.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'detail': 'Nếu email này có trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu.'
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    Đặt lại mật khẩu: Nhận token + mật khẩu mới → Xác minh token → Cập nhật mật khẩu.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.data.get('token', '').strip()
        new_password = request.data.get('password', '')

        if not token_str:
            return Response({'detail': 'Token không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 6:
            return Response({'detail': 'Mật khẩu phải có ít nhất 6 ký tự.'}, status=status.HTTP_400_BAD_REQUEST)

        from .models import PasswordResetToken

        try:
            token_obj = PasswordResetToken.objects.get(Token=token_str)
        except (PasswordResetToken.DoesNotExist, ValueError):
            return Response({'detail': 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'}, status=status.HTTP_400_BAD_REQUEST)

        if not token_obj.is_valid():
            return Response({'detail': 'Link đặt lại mật khẩu đã hết hạn. Vui lòng thử lại.'}, status=status.HTTP_400_BAD_REQUEST)

        # Đặt mật khẩu mới
        user = token_obj.TaiKhoan
        user.set_password(new_password)
        user.save()

        # Đánh dấu token đã sử dụng
        token_obj.DaSuDung = True
        token_obj.save()

        return Response({'detail': 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập bằng mật khẩu mới.'})
