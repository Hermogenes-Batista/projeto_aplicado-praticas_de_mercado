import graphene

from .mutations import AuthMutation
from .queries import AuthQuery


class QueryRoot(AuthQuery, graphene.ObjectType):
    pass


class MutationRoot(AuthMutation, graphene.ObjectType):
    pass
