import graphene
from django.conf import settings


class GoogleConfigQuery(graphene.ObjectType):
    google_client_id = graphene.String(required=True)

    def resolve_google_client_id(self, info):
        provider_config = getattr(settings, "SOCIALACCOUNT_PROVIDERS", {}).get(
            "google", {}
        )
        return provider_config.get("APP", {}).get("client_id", "")
