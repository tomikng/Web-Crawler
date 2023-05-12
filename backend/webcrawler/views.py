import requests
from django.http import JsonResponse
from requests import RequestException

from webcrawler.tasks import crawl_website
from api.models import WebsiteRecord


def start_crawling(request, label):
    try:
        website_record = WebsiteRecord.objects.get(label=label)
        crawl_website(website_record.label)
        return JsonResponse({'message': f"Crawling of {website_record.url} was successful."})
    except WebsiteRecord.DoesNotExist:
        return JsonResponse({'message': 'Website Record does not exist.'}, status=404)
    except RequestException:
        return JsonResponse({'message': 'An error occurred while making the request.'}, status=500)
