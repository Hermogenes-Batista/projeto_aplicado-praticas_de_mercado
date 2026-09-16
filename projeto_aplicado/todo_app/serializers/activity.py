from rest_framework import serializers

from ..models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = (
            "id",
            "name",
            "is_resolved",
            "created_at",
            "updated_at",
            "created_by",
        )
        read_only_fields = ("id", "created_at", "updated_at", "created_by")
