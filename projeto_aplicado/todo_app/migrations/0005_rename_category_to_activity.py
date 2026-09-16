from django.db import migrations
from django.db import models


class Migration(migrations.Migration):
    dependencies = [
        ("todo_app", "0004_alter_category_options"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Category",
            new_name="Activity",
        ),
        migrations.RenameField(
            model_name="item",
            old_name="category",
            new_name="activity",
        ),
        migrations.RemoveConstraint(
            model_name="activity",
            name="unique_todo_category_name_per_user",
        ),
        migrations.AddConstraint(
            model_name="activity",
            constraint=models.UniqueConstraint(
                fields=("created_by", "name"),
                name="unique_todo_activity_name_per_user",
            ),
        ),
    ]
