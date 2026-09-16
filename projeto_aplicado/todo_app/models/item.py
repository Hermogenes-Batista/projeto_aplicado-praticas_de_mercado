
import uuid

from django.conf import settings
from django.db import models

from .activity import Activity
from .base import BaseModel


class Item(BaseModel):
    name = models.CharField(max_length=255)
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

    class Meta(BaseModel.Meta):
        pass

    def __str__(self):
        return self.name
