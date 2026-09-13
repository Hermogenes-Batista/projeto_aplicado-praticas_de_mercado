from django.urls import path
from .views import GoogleConfigAPIView, GoogleAuthAPIView, UserMeAPIView, LogoutAPIView

app_name = 'handle_oauth'

urlpatterns = [
    path('config/', GoogleConfigAPIView.as_view(), name='google_config'),
    path('google/', GoogleAuthAPIView.as_view(), name='google_auth'),
    path('me/', UserMeAPIView.as_view(), name='user_me'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
]
