from django.urls import path
from .views import (
    NhomTieuChiListView, NhomTieuChiDetailView,
    TieuChiListView, TieuChiDetailView,
    DiemTheoCapDoView,
)

urlpatterns = [
    path('criteria/', NhomTieuChiListView.as_view(), name='criteria-list'),
    path('criteria/<int:pk>/', NhomTieuChiDetailView.as_view(), name='criteria-detail'),
    # Admin
    path('admin/criteria/tieuchi/', TieuChiListView.as_view(), name='tieuchi-list'),
    path('admin/criteria/tieuchi/<int:pk>/', TieuChiDetailView.as_view(), name='tieuchi-detail'),
    path('admin/criteria/tieuchi/<int:tc_pk>/scores/', DiemTheoCapDoView.as_view(), name='diem-cap-do'),
]
