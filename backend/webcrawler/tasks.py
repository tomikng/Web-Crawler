from celery import shared_task
from django.utils import timezone
from django.utils.datetime_safe import datetime
from django.utils.timezone import make_aware

from api.models import WebsiteRecord, Execution, CrawledPage
from .crawler import Crawler


@shared_task
def crawl_website(website_record_label):
    website_record = WebsiteRecord.objects.get(label=website_record_label)
    execution = create_or_get_execution(website_record)
    try:
        crawler_instance = Crawler(website_record)
        execute_crawl(crawler_instance, website_record.url)
        update_execution(execution, crawler_instance)
    except Exception as e:
        handle_crawl_error(website_record, execution)
        raise e
    return execution.pk


def create_or_get_execution(website_record):
    defaults = {
        'status': 'pending',
        'start_time': make_aware(datetime.now()),
        'end_time': None,
        'num_sites_crawled': 0
    }
    execution, created = Execution.objects.get_or_create(
        website_record=website_record,
        defaults=defaults
    )
    return execution


def execute_crawl(crawler_instance, url):
    crawler_instance.crawl(url)


def update_execution(execution, crawler_instance):
    execution.status = 'completed'
    execution.end_time = timezone.now()
    execution.num_sites_crawled = crawler_instance.num_crawled
    execution.save()


def handle_crawl_error(website_record, execution):
    execution.status = 'failed'
    execution.save()
    Execution.objects.get_or_create(
        website_record=website_record,
        defaults={
            'status': 'failed',
            'start_time': make_aware(datetime.now()),
            'end_time': None,
            'num_sites_crawled': 0
        }
    )

