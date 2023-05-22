from django.db import models
from django.utils.timezone import make_aware
import re

from django.utils.datetime_safe import datetime

from webcrawler.tasks_helper import create_periodic_crawl_task

from django_celery_beat.models import PeriodicTask

from django.contrib.postgres.fields import ArrayField


class WebsiteRecord(models.Model):
    id = models.AutoField(primary_key=True)
    url = models.URLField()
    boundary_regexp = models.TextField(max_length=256)
    PERIODICITY_CHOICES = [
        ('minute', 'Minute'),
        ('hour', 'Hour'),
        ('day', 'Day'),
    ]
    periodicity = models.TextField(max_length=10, choices=PERIODICITY_CHOICES)
    label = models.TextField()
    active = models.BooleanField(default=True)
    tags = ArrayField(models.TextField(max_length=100), blank=True)

    def __str__(self):
        return self.label

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        create_periodic_crawl_task(self)

    def delete(self, *args, **kwargs):
        PeriodicTask.objects.filter(name=f'crawl_website_{self.label}').delete()
        super().delete(*args, **kwargs)


class Execution(models.Model):
    id = models.AutoField(primary_key=True)

    website_record = models.ForeignKey(WebsiteRecord, on_delete=models.CASCADE)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.TextField(max_length=10, choices=STATUS_CHOICES, default='pending')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    num_sites_crawled = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.website_record.label} - {self.status}"

    class Meta:
        unique_together = []


class CrawledPage(models.Model):
    id = models.AutoField(primary_key=True)
    execution = models.ForeignKey(Execution, on_delete=models.CASCADE)
    url = models.TextField()
    crawl_time = models.DateTimeField(auto_now_add=True)
    title = models.TextField(null=True, blank=True)

    def set_links(self, links, execution):
        for url in links:
            defaults = {'execution': execution, 'crawl_time': make_aware(datetime.now())}
            crawled_page, created = CrawledPage.objects.update_or_create(url=url, defaults=defaults)
            Link.objects.create(from_page=self, to_page=crawled_page)

    def get_links(self):
        return [link.to_page for link in self.links_from.all()]

    def __str__(self):
        return self.url


class Link(models.Model):
    from_page = models.ForeignKey(CrawledPage, related_name='links_from', on_delete=models.CASCADE)
    to_page = models.ForeignKey(CrawledPage, related_name='links_to', on_delete=models.CASCADE)

