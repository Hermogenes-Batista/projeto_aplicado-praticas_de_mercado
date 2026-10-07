import graphene

from ...serializers import ProfileSerializer
from ..types import UserType
from ..utils import get_authenticated_user
from .helpers import serializer_errors


class UpdateProfileMutation(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        password = graphene.String()

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)
    user = graphene.Field(UserType)

    @classmethod
    def mutate(cls, root, info, username, first_name, last_name, password=None):
        user = get_authenticated_user(info.context)
        serializer = ProfileSerializer(
            user,
            data={
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                **({"password": password} if password else {}),
            },
            partial=True,
        )
        if not serializer.is_valid():
            return cls(success=False, errors=serializer_errors(serializer))

        return cls(success=True, errors=[], user=serializer.save())
