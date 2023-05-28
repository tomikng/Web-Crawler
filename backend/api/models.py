from django.db import models
from django.utils.timezone import make_aware
import re

from django.utils.datetime_safe import datetime

from webcrawler.tasks_helper import create_periodic_crawl_task

from django_celery_beat.models import PeriodicTask

from django.contrib.postgres.fields import ArrayField


class WebsiteRecord(models.Model):
    """
    Represents a website record for a URL that needs to be crawled periodically.

    Each website record includes the following fields:
      - url: the URL of the website
      - boundary_regexp: a regular expression for determining the boundary of the site
      - periodicity: how often the site should be crawled
      - label: a human-readable label for the site
      - active: whether or not the site is currently being crawled
      - tags: a list of tags associated with the site
    """

    id = models.AutoField(primary_key=True)
    url = models.TextField(max_length=256, unique=True,error_messages={
            'unique': "This URL is already in use. Please use another URL."
        })
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
        """
        Overridden save method. Calls super save and creates a periodic task
        for this website record using create_periodic_crawl_task helper function.
        """
        super().save(*args, **kwargs)
        create_periodic_crawl_task(self)

    def delete(self, *args, **kwargs):
        """
        Overridden delete method. Deletes the periodic task associated with this
        website record and then calls super delete.
        """
        PeriodicTask.objects.filter(name=f'crawl_website_{self.label}').delete()
        super().delete(*args, **kwargs)


class Execution(models.Model):
    """
    Represents an execution of a website crawl.

    Each execution includes the following fields:
      - website_record: the website that is being crawled
      - status: the current status of the crawl
      - start_time: when the crawl started
      - end_time: when the crawl ended
      - num_sites_crawled: the number of sites that were crawled
    """
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


class CrawledPage(models.Model):
    """
    Represents a single page that has been crawled during an execution.

    Each crawled page includes the following fields:
      - execution: the execution during which the page was crawled
      - url: the URL of the page
      - crawl_time: when the page was crawled
      - title: the title of the page
    """
    id = models.AutoField(primary_key=True)
    execution = models.ForeignKey(Execution, on_delete=models.CASCADE)
    url = models.TextField()
    crawl_time = models.DateTimeField(auto_now_add=True)
    title = models.TextField(null=True, blank=True)

    def set_links(self, links, execution):
        """
        For each link in 'links', updates or creates a crawled page and creates
        a link from this page to the crawled page.

        Args:
            links: List of links to be crawled
            execution: The Execution instance during which these pages are crawled
        """
        for url in links:
            defaults = {'execution': execution, 'crawl_time': make_aware(datetime.now())}
            crawled_page, created = CrawledPage.objects.update_or_create(url=url, defaults=defaults)
            Link.objects.get_or_create(from_page=self, to_page=crawled_page)

    def get_links(self):
        """
        Returns all the pages that this page links to.

        Returns:
            A list of CrawledPage instances that this page links to.
        """
        return [link.to_page for link in self.links_from.all()]

    def __str__(self):
        return self.url


class Link(models.Model):
    """
    Represents a link from one crawled page to another.

    Each link includes the following fields:
      - from_page: the page the link is from
      - to_page: the page the link goes to
    """
    from_page = models.ForeignKey(CrawledPage, related_name='links_from', on_delete=models.CASCADE)
    to_page = models.ForeignKey(CrawledPage, related_name='links_to', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('from_page', 'to_page')
