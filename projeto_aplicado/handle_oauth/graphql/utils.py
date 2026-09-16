from graphql import GraphQLError
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..cookies import ACCESS_COOKIE


def get_authenticated_user(request):
    if not request.META.get("HTTP_AUTHORIZATION"):
        access_token = request.COOKIES.get(ACCESS_COOKIE)
        if access_token:
            request.META["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
    authentication = JWTAuthentication().authenticate(request)
    if authentication is None:
        raise GraphQLError("Authentication required.")
    return authentication[0]
