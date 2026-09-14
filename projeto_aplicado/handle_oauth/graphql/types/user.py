import graphene
from graphene_django import DjangoObjectType

from ...models import User


class UserType(DjangoObjectType):
    id = graphene.UUID(required=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
        )
