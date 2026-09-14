from django.contrib.auth import authenticate
from rest_framework import serializers

from ..models import User


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        identifier = attrs["username"]
        password = attrs["password"]
        user = authenticate(
            request=self.context.get("request"),
            username=identifier,
            password=password,
        )
        if user is None:
            user_by_email = User.objects.filter(email__iexact=identifier).first()
            if user_by_email:
                user = authenticate(
                    request=self.context.get("request"),
                    username=user_by_email.username,
                    password=password,
                )
        if user is None or not user.is_active:
            raise serializers.ValidationError("Invalid username or password.")

        attrs["user"] = user
        return attrs
