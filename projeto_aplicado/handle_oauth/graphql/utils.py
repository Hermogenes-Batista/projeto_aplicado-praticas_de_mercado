from graphql import GraphQLError
from rest_framework_simplejwt.authentication import JWTAuthentication


def get_authenticated_user(request):
    authentication = JWTAuthentication().authenticate(request)
    if authentication is None:
        raise GraphQLError("Authentication required.")
    return authentication[0]
