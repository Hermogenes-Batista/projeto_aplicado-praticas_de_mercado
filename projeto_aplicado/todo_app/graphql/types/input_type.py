import graphene


class ItemInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    is_resolved = graphene.Boolean(required=False, default=False)
