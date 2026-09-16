import graphene

from .activity import CompleteActivity, CreateActivity, DeleteActivity, UpdateActivity
from .item import CreateItem, DeleteItem, UpdateItem


class TodoMutation(graphene.ObjectType):
    create_activity = CreateActivity.Field()
    update_activity = UpdateActivity.Field()
    delete_activity = DeleteActivity.Field()
    complete_activity = CompleteActivity.Field()
    create_item = CreateItem.Field()
    update_item = UpdateItem.Field()
    delete_item = DeleteItem.Field()


__all__ = ["TodoMutation"]
