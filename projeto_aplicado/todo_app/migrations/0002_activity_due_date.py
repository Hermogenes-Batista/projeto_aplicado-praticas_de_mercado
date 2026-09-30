from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("todo_app", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="activity",
            name="due_date",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
