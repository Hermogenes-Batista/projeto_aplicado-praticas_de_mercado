from django.urls import path

from ..views.user import UserMeAPIView

urlpatterns = [
    path("me/", UserMeAPIView.as_view(), name="user_me"),
]
