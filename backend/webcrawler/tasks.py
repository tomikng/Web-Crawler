from celery import shared_task
from django.utils import timezone
from django.utils.datetime_safe import datetime
from django.utils.timezone import make_aware

from api.models import WebsiteRecord, Execution, CrawledPage
from .crawler import Crawler


@shared_task
def crawl_website(website_id):
    """
    Task to crawl a website asynchronously.
    
    Args:
        website_id: The ID of the WebsiteRecord object representing the website to crawl.
    
    Returns:
        The ID of the crawled website.
    """
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
    """
    Create a new execution for the website crawling process.
    
    Args:
        website_record: The WebsiteRecord object representing the website to crawl.
    
    Returns:
        The created Execution object.
    """
    execution = Execution.objects.create(
        website_record=website_record,
        status='pending',
        start_time=make_aware(datetime.now()),
        end_time=None,
        num_sites_crawled=0
    )
    return execution


def execute_crawl(crawler_instance, url, ex_id):
    """
    Execute the crawling process using the Crawler instance.
    
    Args:
        crawler_instance: The Crawler instance for crawling the website.
        url: The starting URL for the crawling process.
        ex_id: The ID of the execution associated with the crawling process.
    """
    crawler_instance.crawl(url, ex_id)


def update_execution(execution, crawler_instance):
    """
    Update the execution details after the crawling process is completed.
    
    Args:
        execution: The Execution object associated with the crawling process.
        crawler_instance: The Crawler instance used for crawling.
    """
    execution.status = 'completed'
    execution.end_time = timezone.now()
    execution.num_sites_crawled = crawler_instance.num_crawled
    execution.save()


def handle_crawl_error(execution, crawler_instance):
    """
    Handle the error that occurred during the crawling process.
    
    Args:
        execution: The Execution object associated with the crawling process.
        crawler_instance: The Crawler instance used for crawling.
    """
    execution.status = 'failed'
    execution.start_time = make_aware(datetime.now())
    execution.end_time = None
    execution.num_sites_crawled = crawler_instance.num_crawled
    execution.save()
