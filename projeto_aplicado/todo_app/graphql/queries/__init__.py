import graphene

from .activities import ActivitiesQuery
from .items import ItemsQuery


class TodoQuery(ActivitiesQuery, ItemsQuery, graphene.ObjectType):
    pass


__all__ = ["TodoQuery"]
