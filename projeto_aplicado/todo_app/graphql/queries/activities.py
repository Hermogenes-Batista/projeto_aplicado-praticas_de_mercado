import graphene
import graphene_django_optimizer as query_optimizer

from ...models import Activity
from ..types import ActivityType
from handle_oauth.graphql.utils import get_authenticated_user


class ActivitiesQuery(graphene.ObjectType):
    activities = graphene.List(ActivityType, required=True)

    def resolve_activities(self, info):
        user = get_authenticated_user(info.context)
        return query_optimizer.query(Activity.objects.filter(created_by=user), info)
