# Generated by Django 2.0.2 on 2018-06-04 21:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('word_proc', '0007_userwords_success_run'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userwords',
            name='last_drilled',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='userwords',
            name='last_rating_update',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
