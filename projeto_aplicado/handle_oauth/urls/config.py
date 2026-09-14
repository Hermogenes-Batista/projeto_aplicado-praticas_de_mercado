from django.urls import path

from ..views.google_config import GoogleConfigAPIView

urlpatterns = [
    path("config/", GoogleConfigAPIView.as_view(), name="google_config"),
]
