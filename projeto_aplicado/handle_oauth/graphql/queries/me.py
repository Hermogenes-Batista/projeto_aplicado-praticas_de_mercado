import graphene
from graphql import GraphQLError

from ..types import UserType
from ..utils import get_authenticated_user


class MeQuery(graphene.ObjectType):
    me = graphene.Field(UserType)

    def resolve_me(self, info):
        user = get_authenticated_user(info.context)
        if not user.is_active:
            raise GraphQLError("User is inactive.")
        return user
