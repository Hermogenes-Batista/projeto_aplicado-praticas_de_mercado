import graphene
from graphql import Undefined
from rest_framework.exceptions import ValidationError

from ...models import Activity
from ...serializers import ActivitySerializer
from ..types import ActivityType, ItemInput
from .helpers import authenticated_user, require_owned, serializer_errors


class CreateActivity(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        due_date = graphene.DateTime()
        items = graphene.List(graphene.NonNull(ItemInput))

    activity = graphene.Field(ActivityType)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, name, due_date=None, items=None):
        user = authenticated_user(info)
        items_data = items if items is not None else []

        data = {"name": name, "due_date": due_date, "items": items_data}
        serializer = ActivitySerializer(data=data, context={"user": user})
        if not serializer.is_valid():
            return cls(activity=None, errors=serializer_errors(serializer))

        try:
            activity = serializer.save(created_by=user, is_resolved=False)
        except ValidationError:
            return cls(activity=None, errors=serializer_errors(serializer))

        return cls(activity=activity, errors=[])


class UpdateActivity(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        name = graphene.String(required=True)
        due_date = graphene.DateTime()

    activity = graphene.Field(ActivityType)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, id, name, due_date=Undefined):
        user = authenticated_user(info)
        activity = require_owned(Activity.objects, id, user, "Activity")
        data = {"name": name}
        if due_date is not Undefined:
            data["due_date"] = due_date
        serializer = ActivitySerializer(
            activity,
            data=data,
            context={"user": user},
        )
        if not serializer.is_valid():
            return cls(activity=None, errors=serializer_errors(serializer))
        return cls(activity=serializer.save(), errors=[])


class DeleteActivity(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)

    success = graphene.Boolean(required=True)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, id):
        user = authenticated_user(info)
        activity = require_owned(Activity.objects, id, user, "Activity")
        if activity.items.filter(is_resolved=True).exists():
            return cls(
                success=False,
                errors=["Activities with resolved items cannot be deleted."],
            )
        activity.delete()
        return cls(success=True, errors=[])


class CompleteActivity(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        is_resolved = graphene.Boolean(required=True)

    activity = graphene.Field(ActivityType)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, id, is_resolved):
        user = authenticated_user(info)
        activity = require_owned(Activity.objects, id, user, "Activity")
        activity.items.update(is_resolved=is_resolved)
        activity.is_resolved = is_resolved
        activity.save(update_fields=("is_resolved", "updated_at"))
        return cls(activity=activity, errors=[])
