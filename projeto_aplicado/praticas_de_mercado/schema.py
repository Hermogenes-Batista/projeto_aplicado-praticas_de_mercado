import graphene

from handle_oauth.graphql.schema import MutationRoot, QueryRoot


schema = graphene.Schema(query=QueryRoot, mutation=MutationRoot)
