import graphene

from ...models import Item
from ..types import ItemType
from handle_oauth.graphql.utils import get_authenticated_user


class ItemsQuery(graphene.ObjectType):
    items = graphene.List(ItemType, required=True, is_resolved=graphene.Boolean())

    def resolve_items(self, info, is_resolved=None):
        user = get_authenticated_user(info.context)
        queryset = Item.objects.filter(created_by=user)
        if is_resolved is not None:
            queryset = queryset.filter(is_resolved=is_resolved)
        return queryset
