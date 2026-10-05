import re

from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from ..models import User


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        max_length=128,
    )

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "Já existe uma conta com este e-mail. Tente entrar com Google ou faça login."
            )
        return email

    def validate(self, attrs):
        local_part = attrs["email"].split("@", maxsplit=1)[0]
        base_username = re.sub(r"[^\w.@+-]", "", local_part)[:150] or "user"
        username = base_username
        suffix = 1
        while User.objects.filter(username__iexact=username).exists():
            suffix_text = str(suffix)
            username = f"{base_username[: 150 - len(suffix_text)]}{suffix_text}"
            suffix += 1

        password_user = User(username=username, email=attrs["email"])
        try:
            password_validation.validate_password(attrs["password"], password_user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages}) from error

        attrs["username"] = username
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
