from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken


class LogoutAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                return Response(
                    {"detail": "The refresh token is invalid or expired."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response({"detail": "Session ended."}, status=status.HTTP_200_OK)
