from graphene_django import DjangoObjectType

from ...models import Activity


class ActivityType(DjangoObjectType):
    class Meta:
        model = Activity
        fields = (
            "id",
            "name",
            "due_date",
            "is_resolved",
            "created_at",
            "updated_at",
            "created_by",
            "items",
        )
