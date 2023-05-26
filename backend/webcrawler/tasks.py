from celery import shared_task
from django.utils import timezone
from django.utils.datetime_safe import datetime
from django.utils.timezone import make_aware

from api.models import WebsiteRecord, Execution, CrawledPage
from .crawler import Crawler


@shared_task
def crawl_website(website_id):
    website_record = WebsiteRecord.objects.get(id=website_id)
    execution = create_new_execution(website_record)
    try:
        crawler_instance = Crawler(website_record)
        execute_crawl(crawler_instance, website_record.url, execution.id)
        update_execution(execution, crawler_instance)
    except Exception as e:
        handle_crawl_error(execution, crawler_instance)
        raise e
    return website_id


def create_new_execution(website_record):
    execution = Execution.objects.create(
        website_record=website_record,
        status='pending',
        start_time=make_aware(datetime.now()),
        end_time=None,
        num_sites_crawled=0
    )
    return execution



def execute_crawl(crawler_instance, url, ex_id):
    crawler_instance.crawl(url, ex_id)


def update_execution(execution, crawler_instance):
    execution.status = 'completed'
    execution.end_time = timezone.now()
    execution.num_sites_crawled = crawler_instance.num_crawled
    execution.save()


def handle_crawl_error(execution, crawler_instance):
    execution.status = 'failed'
    execution.start_time = make_aware(datetime.now())
    execution.end_time = None
    execution.num_sites_crawled = crawler_instance.num_crawled
    execution.save()
