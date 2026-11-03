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
from django.db import DatabaseError, connection
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from praticas_de_mercado.graphql_view import SecureGraphQLView
from .schema import schema


def health_check(request):
    """Check backend and database connectivity for Docker and deployment health checks."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError:
        return JsonResponse({"status": "error", "database": "unavailable"}, status=503)

    return JsonResponse({"status": "ok", "database": "ok"})


urlpatterns = [
    path("not-logical/", admin.site.urls),
    # path('accounts/', include('allauth.urls')),
    path(
        "graphql/",
        csrf_exempt(SecureGraphQLView.as_view(schema=schema, graphiql=True)),
        name="graphql",
    ),
    path("api/health/", health_check, name="health_check"),
]
