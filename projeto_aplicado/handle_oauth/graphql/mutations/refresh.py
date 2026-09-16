import graphene
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from ...cookies import REFRESH_COOKIE


class RefreshTokenMutation(graphene.Mutation):
    class Meta:
        name = "RefreshToken"

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)
    access = graphene.String()
    refresh = graphene.String()

    @classmethod
    def mutate(cls, root, info):
        raw_refresh = info.context.COOKIES.get(REFRESH_COOKIE)
        if not raw_refresh:
            return cls(success=False, errors=["Refresh token não encontrado."])

        try:
            old_refresh = RefreshToken(raw_refresh)
            user = get_user_model().objects.get(pk=old_refresh["user_id"])
            new_refresh = RefreshToken.for_user(user)
            old_refresh.blacklist()
        except (TokenError, get_user_model().DoesNotExist):
            return cls(success=False, errors=["Refresh token inválido ou expirado."])

        info.context._auth_tokens = (
            str(new_refresh.access_token),
            str(new_refresh),
        )
        return cls(
            success=True,
            errors=[],
            access=str(new_refresh.access_token),
            refresh=str(new_refresh),
        )
