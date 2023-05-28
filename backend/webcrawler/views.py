import requests
from django.http import JsonResponse
from requests import RequestException

from webcrawler.tasks import crawl_website
from api.models import WebsiteRecord


def start_crawling(request, label):
    """
    Start the crawling process for a website.
    
    Args:
        request: The HTTP request object.
        label: The label of the website to crawl.
    
    Returns:
        A JSON response indicating the status of the crawling process.
    """
    try:
        website_record = WebsiteRecord.objects.get(label=label)
        crawl_website.delay(website_record.id)
        return JsonResponse({'message': f"Crawling of {website_record.url} has started."})
    except WebsiteRecord.DoesNotExist:
        return JsonResponse({'message': 'Website Record does not exist.'}, status=404)
