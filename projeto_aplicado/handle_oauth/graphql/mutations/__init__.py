import graphene

from .login import LoginMutation
from .logout import LogoutMutation
from .refresh import RefreshTokenMutation
from .google import GoogleLoginMutation
from .register import RegisterUserMutation
from .update_profile import UpdateProfileMutation


class AuthMutation(graphene.ObjectType):
    login = LoginMutation.Field()
    logout = LogoutMutation.Field()
    refresh_token = RefreshTokenMutation.Field()
    login_with_google = GoogleLoginMutation.Field()
    register_user = RegisterUserMutation.Field()
    update_profile = UpdateProfileMutation.Field()


__all__ = ["AuthMutation"]
