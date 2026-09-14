import graphene

from .login import LoginMutation
from .logout import LogoutMutation


class AuthMutation(graphene.ObjectType):
    login = LoginMutation.Field()
    logout = LogoutMutation.Field()


__all__ = ["AuthMutation"]
