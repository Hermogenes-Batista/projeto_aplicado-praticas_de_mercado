import graphene

from .mutations import Mutation
from .queries import Query


class QueryRoot(Query, graphene.ObjectType):
    pass


class MutationRoot(Mutation, graphene.ObjectType):
    pass
