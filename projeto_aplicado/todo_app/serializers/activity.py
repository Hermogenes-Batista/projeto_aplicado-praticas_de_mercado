from rest_framework import serializers

from ..models import Activity
from .item import ItemSerializer


class ActivitySerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, required=False, allow_empty=True)

    class Meta:
        model = Activity
        fields = (
            "id",
            "name",
            "due_date",
            "is_resolved",
            "created_at",
            "updated_at",
            "created_by",
            "items",
        )
        read_only_fields = ("id", "created_at", "updated_at", "created_by")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "items" in self.fields:
            self.fields["items"].child.fields["activity"].required = False

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])

        activity = super().create(validated_data)

        user = self.context.get("user")
        for item_data in items_data:
            item_data["activity"] = activity.pk
            item_data["created_by_id"] = user.id
            item_serializer = ItemSerializer(data=item_data, context={"user": user})

            error = item_serializer.is_valid(raise_exception=False)
            if not item_serializer.is_valid():
                print("falou a validação", error)
            item_serializer.save(activity=activity, created_by=user)

        return activity
