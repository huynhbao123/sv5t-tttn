from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView, MeView, TaiKhoanListView, TaiKhoanDetailView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    # Admin quản lý tài khoản
    path('accounts/', TaiKhoanListView.as_view(), name='accounts-list'),
    path('accounts/<int:pk>/', TaiKhoanDetailView.as_view(), name='accounts-detail'),
]
