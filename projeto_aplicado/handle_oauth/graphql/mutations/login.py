import graphene
from rest_framework_simplejwt.tokens import RefreshToken

from ...serializers import LoginSerializer
from ..types import UserType
from .helpers import serializer_errors


class LoginMutation(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)
    access = graphene.String()
    refresh = graphene.String()
    user = graphene.Field(UserType)

    @classmethod
    def mutate(cls, root, info, username, password):
        serializer = LoginSerializer(
            data={"username": username, "password": password},
            context={"request": info.context},
        )
        if not serializer.is_valid():
            return cls(success=False, errors=serializer_errors(serializer))

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        info.context._auth_tokens = (
            str(refresh.access_token),
            str(refresh),
        )
        return cls(
            success=True,
            errors=[],
            access=str(refresh.access_token),
            refresh=str(refresh),
            user=user,
        )
