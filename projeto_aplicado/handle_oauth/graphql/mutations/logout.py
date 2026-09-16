import graphene

from ...serializers import LogoutSerializer
from .helpers import serializer_errors


class LogoutMutation(graphene.Mutation):
    class Arguments:
        refresh = graphene.String()

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, refresh=None):
        refresh = refresh or info.context.COOKIES.get("refresh_token")
        if not refresh:
            info.context._clear_auth_cookies = True
            return cls(success=True, errors=[])
        serializer = LogoutSerializer(data={"refresh": refresh})
        if not serializer.is_valid():
            return cls(success=False, errors=serializer_errors(serializer))

        serializer.save()
        info.context._clear_auth_cookies = True
        return cls(success=True, errors=[])
