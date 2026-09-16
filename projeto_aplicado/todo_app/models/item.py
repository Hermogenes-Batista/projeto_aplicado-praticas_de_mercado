import uuid

from django.conf import settings
from django.db import models

from .activity import Activity


class Item(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_resolved = models.BooleanField(default=False)
    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name="items",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="todo_items",
    )

    class Meta:
        ordering = ("created_at",)

    def __str__(self):
        return self.name
