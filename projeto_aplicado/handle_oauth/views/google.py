import logging

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from ..cookies import set_auth_cookies
logger = logging.getLogger(__name__)
User = get_user_model()


class GoogleAuthAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        id_token = data.get("id_token") or data.get("credential")
        code = data.get("code")
        redirect_uri = data.get(
            "redirect_uri", "http://localhost:3000/auth/callback"
        )

        user_info = self._get_user_info(id_token, code, redirect_uri)
        if isinstance(user_info, Response):
            return user_info
        if not user_info or not user_info.get("email"):
            return Response(
                {"error": "The Google profile email could not be retrieved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = self._get_or_create_user(user_info)
        self._link_social_account(user, user_info)
        refresh = RefreshToken.for_user(user)
        response = Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "picture": user_info.get("picture", ""),
                },
                "message": "Google authentication completed successfully.",
            },
            status=status.HTTP_200_OK,
        )
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response

    def _get_user_info(self, id_token, code, redirect_uri):
        if id_token:
            return self._get_user_info_from_id_token(id_token)
        if code:
            return self._get_user_info_from_code(code, redirect_uri)
        return None

    def _get_user_info_from_id_token(self, id_token):
        try:
            response = requests.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
                timeout=10,
            )
            if response.status_code != 200:
                logger.warning(
                    "Failed to validate Google ID token: %s", response.text
                )
                return Response(
                    {
                        "error": "The Google token is invalid or expired.",
                        "details": response.text,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token_info = response.json()
            return self._normalize_profile(token_info)
        except requests.RequestException as exc:
            logger.error("Error connecting to the Google API: %s", exc)
            return Response(
                {
                    "error": (
                        "Communication with the Google authentication "
                        "service failed."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

    def _get_user_info_from_code(self, code, redirect_uri):
        provider_config = getattr(
            settings, "SOCIALACCOUNT_PROVIDERS", {}
        ).get("google", {})
        app_config = provider_config.get("APP", {})
        try:
            token_response = requests.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": app_config.get("client_id"),
                    "client_secret": app_config.get("secret"),
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
                timeout=10,
            )
            if token_response.status_code != 200:
                return Response(
                    {
                        "error": "The Google authorization code is invalid.",
                        "details": token_response.text,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            access_token = token_response.json().get("access_token")
            profile_response = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10,
            )
            if profile_response.status_code != 200:
                return Response(
                    {"error": "Failed to retrieve the Google profile."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return self._normalize_profile(profile_response.json())
        except requests.RequestException as exc:
            logger.error("Error exchanging the Google authorization code: %s", exc)
            return Response(
                {"error": "Communication with Google failed."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

    @staticmethod
    def _normalize_profile(profile):
        return {
            "email": profile.get("email"),
            "sub": profile.get("sub"),
            "name": profile.get("name", ""),
            "given_name": profile.get("given_name", ""),
            "family_name": profile.get("family_name", ""),
            "picture": profile.get("picture", ""),
            "email_verified": profile.get("email_verified", True)
            in ("true", True),
        }

    @staticmethod
    def _get_or_create_user(user_info):
        email = user_info["email"].lower().strip()
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
            )
            user.set_unusable_password()
            user.save()
            return user

        updated = False
        if not user.first_name and user_info.get("given_name"):
            user.first_name = user_info["given_name"]
            updated = True
        if not user.last_name and user_info.get("family_name"):
            user.last_name = user_info["family_name"]
            updated = True
        if updated:
            user.save()
        return user

    @staticmethod
    def _link_social_account(user, user_info):
        try:
            from allauth.socialaccount.models import SocialAccount

            SocialAccount.objects.get_or_create(
                user=user,
                provider="google",
                defaults={
                    "uid": user_info.get("sub") or user.email,
                    "extra_data": user_info,
                },
            )
        except Exception as exc:
            logger.debug("SocialAccount linkage notice: %s", exc)
