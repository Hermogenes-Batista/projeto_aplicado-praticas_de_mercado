import graphene
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, LogoutSerializer
from .types import UserType


def serializer_errors(serializer):
    return [
        f"{field}: {message}"
        for field, messages in serializer.errors.items()
        for message in messages
    ]


class Login(graphene.Mutation):
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
        return cls(
            success=True,
            errors=[],
            access=str(refresh.access_token),
            refresh=str(refresh),
            user=user,
        )


class Logout(graphene.Mutation):
    class Arguments:
        refresh = graphene.String(required=True)

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, refresh):
        serializer = LogoutSerializer(data={"refresh": refresh})
        if not serializer.is_valid():
            return cls(success=False, errors=serializer_errors(serializer))

        serializer.save()
        return cls(success=True, errors=[])


class Mutation(graphene.ObjectType):
    login = Login.Field()
    logout = Logout.Field()
