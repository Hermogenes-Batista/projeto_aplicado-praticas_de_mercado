import graphene
from rest_framework_simplejwt.tokens import RefreshToken

from ...serializers import RegisterSerializer
from ..types import UserType
from .helpers import serializer_errors


class RegisterUserMutation(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)
    access = graphene.String()
    refresh = graphene.String()
    user = graphene.Field(UserType)

    @classmethod
    def mutate(cls, root, info, email, password):
        serializer = RegisterSerializer(data={"email": email, "password": password})
        if not serializer.is_valid():
            return cls(success=False, errors=serializer_errors(serializer))

        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        info.context._auth_tokens = (str(refresh.access_token), str(refresh))
        return cls(
            success=True,
            errors=[],
            access=str(refresh.access_token),
            refresh=str(refresh),
            user=user,
        )
