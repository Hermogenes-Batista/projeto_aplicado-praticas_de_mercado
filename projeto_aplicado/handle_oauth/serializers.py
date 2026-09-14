from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
        )
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        identifier = attrs["username"]
        user = authenticate(
            request=self.context.get("request"),
            username=identifier,
            password=attrs["password"],
        )
        if user is None:
            user_by_email = User.objects.filter(email__iexact=identifier).first()
            if user_by_email:
                user = authenticate(
                    request=self.context.get("request"),
                    username=user_by_email.username,
                    password=attrs["password"],
                )
        if user is None or not user.is_active:
            raise serializers.ValidationError("Invalid username or password.")

        attrs["user"] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            RefreshToken(value)
        except TokenError as exc:
            raise serializers.ValidationError("Invalid or expired refresh token.") from exc
        return value

    def save(self, **kwargs):
        refresh = RefreshToken(self.validated_data["refresh"])
        refresh.blacklist()
        return True
