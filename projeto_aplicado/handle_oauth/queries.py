import graphene
from graphql import GraphQLError

from .graphql_utils import get_authenticated_user
from .types import UserType


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)

    def resolve_me(self, info):
        user = get_authenticated_user(info.context)
        if not user.is_active:
            raise GraphQLError("User is inactive.")
        return user
