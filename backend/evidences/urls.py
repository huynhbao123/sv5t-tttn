from django.urls import path
from .views import (
    MinhChungListView, MinhChungDetailView, MinhChungExplainView,
    AdminMinhChungListView, AdminMinhChungReviewView,
)

urlpatterns = [
    # Sinh viên
    path('evidences/', MinhChungListView.as_view(), name='evidences-list'),
    path('evidences/<int:pk>/', MinhChungDetailView.as_view(), name='evidences-detail'),
    path('evidences/<int:pk>/explain/', MinhChungExplainView.as_view(), name='evidences-explain'),
    # Admin
    path('admin/evidences/', AdminMinhChungListView.as_view(), name='admin-evidences-list'),
    path('admin/evidences/<int:pk>/<str:action>/', AdminMinhChungReviewView.as_view(), name='admin-evidences-review'),
]
