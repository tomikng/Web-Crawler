from celery import shared_task
from django.utils import timezone

from api.models import WebsiteRecord, Execution, CrawledPage
from .crawler import Crawler


@shared_task
def crawl_website(website_record_label):
    website_record = WebsiteRecord.objects.get(label=website_record_label)
    crawler = Crawler(website_record)
    execution = Execution.objects.create(website_record=website_record)
    crawler.crawl(website_record.url)

    # Update the Execution model with status and other required information
    execution.status = "completed"
    execution.end_time = timezone.now()
    execution.num_sites_crawled = crawler.num_crawled
    execution.save()

    return execution.pk
