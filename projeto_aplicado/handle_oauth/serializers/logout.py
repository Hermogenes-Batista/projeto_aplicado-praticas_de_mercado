from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            RefreshToken(value)
        except TokenError as exc:
            raise serializers.ValidationError(
                "Invalid or expired refresh token."
            ) from exc
        return value

    def save(self, **kwargs):
        refresh = RefreshToken(self.validated_data["refresh"])
        refresh.blacklist()
        return True
