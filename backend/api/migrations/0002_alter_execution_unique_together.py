# Generated by Django 4.2.1 on 2023-05-18 09:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='execution',
            unique_together=set(),
        ),
    ]
