from django.db import models
from django.utils.timezone import make_aware
import re

from django.utils.datetime_safe import datetime


class WebsiteRecord(models.Model):
    id = models.AutoField(primary_key=True)

    url = models.URLField()
    boundary_regexp = models.CharField(max_length=256)
    PERIODICITY_CHOICES = [
        ('minute', 'Minute'),
        ('hour', 'Hour'),
        ('day', 'Day'),
    ]
    periodicity = models.CharField(max_length=10, choices=PERIODICITY_CHOICES)
    label = models.CharField(max_length=100)
    active = models.BooleanField(default=True)
    tags = models.TextField(blank=True)

    def __str__(self):
        return self.label


class Execution(models.Model):
    id = models.AutoField(primary_key=True)

    website_record = models.ForeignKey(WebsiteRecord, on_delete=models.CASCADE)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    num_sites_crawled = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.website_record.label} - {self.status}"

    class Meta:
        unique_together = ('website_record', 'status')


class CrawledPage(models.Model):
    id = models.AutoField(primary_key=True)

    execution = models.ForeignKey(Execution, on_delete=models.CASCADE)
    url = models.URLField(unique=True)
    crawl_time = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=200, null=True, blank=True)
    links = models.ManyToManyField('self', blank=True)

    def set_links(self, links, execution):
        for url in links:
            defaults = {'execution': execution,
                        'crawl_time': make_aware(datetime.now())}
            crawled_page, created = CrawledPage.objects.update_or_create(url=url, defaults=defaults)
            self.links.add(crawled_page)

    def get_links(self):
        return self.links.all()

    def __str__(self):
        return self.url





