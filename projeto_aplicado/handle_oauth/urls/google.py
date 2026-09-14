from django.urls import path

from ..views.google import GoogleAuthAPIView

urlpatterns = [
    path("google/", GoogleAuthAPIView.as_view(), name="google_auth"),
]
