# Generated by Django 2.0.2 on 2018-06-06 14:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('word_proc', '0010_auto_20180606_1338'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userwords',
            name='rating',
            field=models.DecimalField(decimal_places=9, max_digits=14),
        ),
    ]
