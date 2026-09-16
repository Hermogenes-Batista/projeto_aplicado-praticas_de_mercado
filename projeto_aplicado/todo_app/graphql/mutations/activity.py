import graphene

from ...models import Activity
from ...serializers import ActivitySerializer
from ..types import ActivityType
from .helpers import authenticated_user, require_owned, serializer_errors


class CreateActivity(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)

    activity = graphene.Field(ActivityType)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, name):
        user = authenticated_user(info)
        serializer = ActivitySerializer(data={"name": name}, context={"user": user})
        if not serializer.is_valid():
            return cls(activity=None, errors=serializer_errors(serializer))
        return cls(
            activity=serializer.save(created_by=user, is_resolved=False),
            errors=[],
        )


class UpdateActivity(graphene.Mutation):
    class Arguments:
        id = graphene.UUID(required=True)
        name = graphene.String(required=True)

    activity = graphene.Field(ActivityType)
    errors = graphene.List(graphene.String, required=True)

    @classmethod
    def mutate(cls, root, info, id, name):
        user = authenticated_user(info)
        activity = require_owned(Activity.objects, id, user, "Activity")
        serializer = ActivitySerializer(
            activity, data={"name": name}, context={"user": user}
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
