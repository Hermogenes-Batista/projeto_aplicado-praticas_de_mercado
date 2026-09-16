import graphene

from ...models import Activity
from ..types import ActivityType
from handle_oauth.graphql.utils import get_authenticated_user


class ActivitiesQuery(graphene.ObjectType):
    activities = graphene.List(ActivityType, required=True)
    activities = graphene.List(ActivityType, required=True)

    def resolve_activities(self, info):
        user = get_authenticated_user(info.context)
        return Activity.objects.filter(created_by=user)
