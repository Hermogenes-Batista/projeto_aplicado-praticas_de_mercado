from rest_framework import serializers

from ..models import Activity, Item


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = (
            "id",
            "name",
            "created_at",
            "updated_at",
            "is_resolved",
            "activity",
            "created_by",
        )
        read_only_fields = ("id", "created_at", "updated_at", "created_by")

    def validate_activity(self, activity):
        user = self.context["user"]
        if activity.created_by_id != user.id:
            raise serializers.ValidationError("The activity belongs to another user.")
        return activity
