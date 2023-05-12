from celery import shared_task
from django.utils import timezone
from django.utils.datetime_safe import datetime

from api.models import WebsiteRecord, Execution, CrawledPage
from .crawler import Crawler


@shared_task
def crawl_website(website_record_label):
    website_record = WebsiteRecord.objects.get(label=website_record_label)
    crawler = Crawler(website_record)
    execution, created = Execution.objects.get_or_create(
        website_record=website_record,
        defaults={
            'status': 'pending',
            'start_time': datetime.now(),
            'end_time': None,
            'num_sites_crawled': 0
        }
    )

    crawler.crawl(website_record.url)

    # Update the Execution model with status and other required information
    execution.status = "completed"
    execution.end_time = timezone.now()
    execution.num_sites_crawled = crawler.num_crawled
    execution.save()

    return execution.pk
