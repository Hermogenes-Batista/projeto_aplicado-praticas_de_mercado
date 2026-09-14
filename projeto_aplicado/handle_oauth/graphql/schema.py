import graphene

from .mutations import AuthMutation
from .queries import MeQuery


class QueryRoot(MeQuery, graphene.ObjectType):
    pass


class MutationRoot(AuthMutation, graphene.ObjectType):
    pass
