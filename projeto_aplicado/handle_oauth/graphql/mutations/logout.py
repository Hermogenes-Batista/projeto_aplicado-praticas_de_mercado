import graphene

from ...serializers import LogoutSerializer
from .helpers import serializer_errors


class LogoutMutation(graphene.Mutation):
    class Arguments:
        refresh = graphene.String(required=True)

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, refresh):
        serializer = LogoutSerializer(data={"refresh": refresh})
        if not serializer.is_valid():
            return cls(success=False, errors=serializer_errors(serializer))

        serializer.save()
        return cls(success=True, errors=[])
