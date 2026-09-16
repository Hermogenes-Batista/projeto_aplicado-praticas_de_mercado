import graphene

from .mutations import TodoMutation
from .queries import TodoQuery


class QueryRoot(TodoQuery, graphene.ObjectType):
    pass


class MutationRoot(TodoMutation, graphene.ObjectType):
    pass
