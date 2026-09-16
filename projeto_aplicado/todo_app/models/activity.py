import uuid

from django.conf import settings
from django.db import models

from todo_app.models.base import BaseModel


class Activity(BaseModel):
    name = models.CharField(max_length=100)
    is_resolved = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="todo_activities",
    )

    class Meta(BaseModel.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=("created_by", "name"),
                name="unique_todo_activity_name_per_user",
            )
        ]

    def __str__(self):
        return self.name
