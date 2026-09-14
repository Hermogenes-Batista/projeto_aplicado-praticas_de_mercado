from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class GoogleConfigAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        provider_config = getattr(
            settings, "SOCIALACCOUNT_PROVIDERS", {}
        ).get("google", {})
        client_id = provider_config.get("APP", {}).get("client_id", "")
        return Response({"client_id": client_id})
