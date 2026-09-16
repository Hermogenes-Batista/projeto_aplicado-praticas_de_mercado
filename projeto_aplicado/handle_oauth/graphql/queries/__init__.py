import graphene

from .config import GoogleConfigQuery
from .me import MeQuery


class AuthQuery(MeQuery, GoogleConfigQuery, graphene.ObjectType):
    pass


__all__ = ["AuthQuery"]
