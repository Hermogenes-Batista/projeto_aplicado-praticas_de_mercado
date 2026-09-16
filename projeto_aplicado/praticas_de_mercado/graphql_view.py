from graphene_django.views import GraphQLView

from handle_oauth.cookies import clear_auth_cookies, set_auth_cookies


class SecureGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        auth_tokens = getattr(request, "_auth_tokens", None)
        if auth_tokens:
            set_auth_cookies(response, *auth_tokens)
        if getattr(request, "_clear_auth_cookies", False):
            clear_auth_cookies(response)
        return response
