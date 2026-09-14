import graphene

from handle_oauth.schema import MutationRoot, QueryRoot


schema = graphene.Schema(query=QueryRoot, mutation=MutationRoot)
