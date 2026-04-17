from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, LogoutView, MeView, TaiKhoanListView, TaiKhoanDetailView,
    MicrosoftLoginView, ForgotPasswordView, ResetPasswordView
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('microsoft/', MicrosoftLoginView.as_view(), name='microsoft_login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    # Quên / Đặt lại mật khẩu
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    # Admin quản lý tài khoản
    path('accounts/', TaiKhoanListView.as_view(), name='accounts-list'),
    path('accounts/<int:pk>/', TaiKhoanDetailView.as_view(), name='accounts-detail'),
]
