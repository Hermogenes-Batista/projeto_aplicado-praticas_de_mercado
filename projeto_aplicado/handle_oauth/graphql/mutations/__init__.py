import graphene

from .login import LoginMutation
from .logout import LogoutMutation
from .refresh import RefreshTokenMutation
from .google import GoogleLoginMutation


class AuthMutation(graphene.ObjectType):
    login = LoginMutation.Field()
    logout = LogoutMutation.Field()
    refresh_token = RefreshTokenMutation.Field()
    login_with_google = GoogleLoginMutation.Field()


__all__ = ["AuthMutation"]
