from django.urls import path

from ..views.logout import LogoutAPIView

urlpatterns = [
    path("logout/", LogoutAPIView.as_view(), name="logout"),
]
