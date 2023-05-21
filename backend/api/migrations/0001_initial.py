# Generated by Django 4.2.1 on 2023-05-13 13:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='WebsiteRecord',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('url', models.URLField()),
                ('boundary_regexp', models.CharField(max_length=256)),
                ('periodicity', models.CharField(choices=[('minute', 'Minute'), ('hour', 'Hour'), ('day', 'Day')], max_length=10)),
                ('label', models.CharField(max_length=100)),
                ('active', models.BooleanField(default=True)),
                ('tags', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Execution',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('running', 'Running'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=10)),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('num_sites_crawled', models.PositiveIntegerField(default=0)),
                ('website_record', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.websiterecord')),
            ],
            options={
                'unique_together': {('website_record', 'status')},
            },
        ),
        migrations.CreateModel(
            name='CrawledPage',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('url', models.URLField(unique=True)),
                ('crawl_time', models.DateTimeField(auto_now_add=True)),
                ('title', models.CharField(blank=True, max_length=200, null=True)),
                ('execution', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.execution')),
                ('links', models.ManyToManyField(blank=True, to='api.crawledpage')),
            ],
        ),
    ]
