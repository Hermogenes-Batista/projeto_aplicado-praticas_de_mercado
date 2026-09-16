from django.db import migrations, models
import django.db.models.deletion


def remove_uncategorized_items(apps, schema_editor):
    Item = apps.get_model("todo_app", "Item")
    Item.objects.filter(category__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("todo_app", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            remove_uncategorized_items,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="item",
            name="category",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="items",
                to="todo_app.category",
            ),
        ),
    ]
