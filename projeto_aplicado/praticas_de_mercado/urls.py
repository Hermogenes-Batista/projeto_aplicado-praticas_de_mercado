"""
URL configuration for praticas_de_mercado project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.db import connection
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health_check(request):
    db_ok = True
    db_vendor = "unknown"
    error_message = None
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_vendor = connection.vendor
    except Exception as e:
        db_ok = False
        error_message = str(e)

    response_data = {
        "status": "ok" if db_ok else "error",
        "service": "django",
        "database": {
            "status": "connected" if db_ok else "disconnected",
            "vendor": db_vendor,
        }
    }
    if error_message:
        response_data["database"]["error"] = error_message

    return JsonResponse(response_data, status=200 if db_ok else 503)




urlpatterns = [
    path('not-logical/', admin.site.urls),
    path('accounts/', include('allauth.urls')),  # Inclui todas as rotas de login/signup/oauth

    # Health check endpoint for Docker / Frontend verification
    path('api/health/', health_check, name='health_check'),

    # REST authentication API for the frontend (Next.js / DRF / GraphQL)
    path('api/auth/', include('handle_oauth.urls')),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # A simple home page for testing the button
    path('', TemplateView.as_view(template_name='oauth/home.html'), name='home'),
]
