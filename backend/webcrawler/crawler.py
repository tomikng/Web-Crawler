import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from collections import deque
import concurrent.futures

from django.utils.datetime_safe import datetime

from api.models import CrawledPage, Execution


class Crawler:
    def __init__(self, website_record):
        self.website_record = website_record
        self.visited_urls = set()
        self.num_crawled = 0

    def crawl(self, start_url):
        queue = deque([start_url])
        execution = self.create_execution()

        with concurrent.futures.ThreadPoolExecutor() as executor:
            while queue:
                url = queue.popleft()

                if url in self.visited_urls:
                    continue

                self.visited_urls.add(url)

                future = executor.submit(self.process_url, url, execution)
                links = future.result()

                self.num_crawled += len(links)

                self.enqueue_valid_links(links, queue)

    def create_execution(self):
        execution = Execution.objects.get(website_record=self.website_record)

        execution.status = 'pending'
        execution.start_time = datetime.now()
        execution.end_time = None
        execution.num_sites_crawled = 0

        return execution

    def process_url(self, url, execution):
        response = self.get_response(url)
        html = response.text
        links = self.extract_links(url, html)

        crawled_page = self.save_crawled_page(url, response, html, execution, links)

        return links

    def get_response(self, url):
        response = requests.get(url)
        return response

    def extract_links(self, url, html):
        soup = BeautifulSoup(html, 'html.parser')
        links = set()
        for a_tag in soup.find_all('a', href=True):
            link = a_tag['href']
            absolute_link = urljoin(url, link)
            normalized_link = self.normalize_link(absolute_link)
            if normalized_link:
                links.add(normalized_link)
        return links

    def normalize_link(self, link):
        parsed_link = urlparse(link)
        if parsed_link.scheme and parsed_link.netloc:
            return parsed_link.geturl()
        return None

    def save_crawled_page(self, url, response, html, execution, links):
        crawled_page = CrawledPage.objects.create(
            url=url,
            crawl_time=response.elapsed.total_seconds(),
            title=self.extract_title(html),
            execution=execution,
        )
        crawled_page.set_links(links)
        crawled_page.save()
        return crawled_page

    def extract_title(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        title_tag = soup.find('title')
        return title_tag.string if title_tag else ''

    def enqueue_valid_links(self, links, queue):
        for link in links:
            if self.is_valid_link(link):
                queue.append(link)

    def is_valid_link(self, link):
        boundary_regexp = self.website_record.boundary_regexp
        return re.match(boundary_regexp, link) is not None
