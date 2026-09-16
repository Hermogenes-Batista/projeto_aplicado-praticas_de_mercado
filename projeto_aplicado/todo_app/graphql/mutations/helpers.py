from graphql import GraphQLError

from handle_oauth.graphql.utils import get_authenticated_user


def authenticated_user(info):
    return get_authenticated_user(info.context)


def serializer_errors(serializer):
    return [
        f"{field}: {message}"
        for field, messages in serializer.errors.items()
        for message in messages
    ]


def require_owned(queryset, object_id, user, label):
    instance = queryset.filter(id=object_id, created_by=user).first()
    if instance is None:
        raise GraphQLError(f"{label} was not found.")
    return instance
