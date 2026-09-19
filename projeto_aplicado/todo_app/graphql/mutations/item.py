import graphene

from ...models import Item
from ...serializers import ItemSerializer
from ..types import ItemType
from .helpers import authenticated_user, require_owned, serializer_errors


class CreateItem(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        activity_id = graphene.UUID(required=True)
        is_resolved = graphene.Boolean()

    item = graphene.Field(ItemType)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, name, activity_id, is_resolved=False):
        user = authenticated_user(info)
        data = {
            "name": name,
            "activity": activity_id,
            "is_resolved": is_resolved,
        }
        serializer = ItemSerializer(data=data, context={"user": user})
        if not serializer.is_valid():
            return cls(item=None, errors=serializer_errors(serializer))
        item = serializer.save(created_by=user)
        if not item.is_resolved:
            item.activity.is_resolved = False
            item.activity.save(update_fields=("is_resolved", "updated_at"))
        return cls(item=item, errors=[])


class UpdateItem(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        name = graphene.String(required=True)
        activity_id = graphene.UUID(required=True)
        is_resolved = graphene.Boolean(required=True)

    item = graphene.Field(ItemType)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, id, name, is_resolved, activity_id):
        user = authenticated_user(info)
        item = require_owned(Item.objects, id, user, "Item")
        if item.is_resolved and (
            name != item.name or str(activity_id) != str(item.activity_id)
        ):
            return cls(
                item=None,
                errors=["Resolved items cannot be changed."],
            )
        serializer = ItemSerializer(
            item,
            data={
                "name": name,
                "activity": activity_id,
                "is_resolved": is_resolved,
            },
            context={"user": user},
        )
        if not serializer.is_valid():
            return cls(item=None, errors=serializer_errors(serializer))
        updated_item = serializer.save()
        activity = updated_item.activity
        activity.is_resolved = not activity.items.filter(is_resolved=False).exists()
        activity.save(update_fields=("is_resolved", "updated_at"))
        return cls(item=updated_item, errors=[])


class DeleteItem(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, id):
        user = authenticated_user(info)
        item = require_owned(Item.objects, id, user, "Item")
        if item.is_resolved:
            return cls(
                success=False,
                errors=["Resolved items cannot be deleted."],
            )
        activity = item.activity
        item.delete()
        activity.is_resolved = not activity.items.filter(is_resolved=False).exists()
        activity.save(update_fields=("is_resolved", "updated_at"))
        return cls(success=True, errors=[])
