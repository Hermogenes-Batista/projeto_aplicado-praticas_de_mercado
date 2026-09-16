from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("todo_app", "0006_alter_activity_created_by"),
    ]

    operations = [
        migrations.AddField(
            model_name="activity",
            name="is_resolved",
            field=models.BooleanField(default=False),
        ),
    ]
