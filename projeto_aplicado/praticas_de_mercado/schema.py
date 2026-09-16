import graphene

from handle_oauth.graphql.schema import (
    MutationRoot as AuthMutationRoot,
    QueryRoot as AuthQueryRoot,
)
from todo_app.graphql.schema import (
    MutationRoot as TodoMutationRoot,
    QueryRoot as TodoQueryRoot,
)


class QueryRoot(AuthQueryRoot, TodoQueryRoot, graphene.ObjectType):
    pass


class MutationRoot(AuthMutationRoot, TodoMutationRoot, graphene.ObjectType):
    pass


schema = graphene.Schema(query=QueryRoot, mutation=MutationRoot)
