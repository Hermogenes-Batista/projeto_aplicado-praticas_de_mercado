def serializer_errors(serializer):
    return [
        f"{field}: {message}"
        for field, messages in serializer.errors.items()
        for message in messages
    ]
