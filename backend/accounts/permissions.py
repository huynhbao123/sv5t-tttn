from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Admin, ThuKy, ThamDinh có thể truy cập"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.VaiTro in ['Admin', 'ThuKy', 'ThamDinh']
        )


class IsSinhVien(BasePermission):
    """Chỉ sinh viên có thể truy cập"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.VaiTro == 'SinhVien'
        )


class IsAdminOrReadOnly(BasePermission):
    """Admin thì full, còn lại chỉ đọc"""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.VaiTro in ['Admin', 'ThuKy', 'ThamDinh']
        )
