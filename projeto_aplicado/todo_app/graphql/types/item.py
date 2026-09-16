import graphene
from graphene_django import DjangoObjectType

from ...models import Item
from .activity import ActivityType


class ItemType(DjangoObjectType):
    class Meta:
        model = Item
        fields = (
            "id",
            "name",
            "created_at",
            "updated_at",
            "is_resolved",
            "activity",
            "created_by",
        )
