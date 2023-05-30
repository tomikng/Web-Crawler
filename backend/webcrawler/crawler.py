import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from collections import deque
import concurrent.futures

from django.utils.datetime_safe import datetime
from django.utils.timezone import make_aware

from api.models import CrawledPage, Execution


class Crawler:
    def __init__(self, website_record):
        """
        Initialize the Crawler object.
        
        Args:
            website_record: The website record object representing the website to crawl.
        """
        self.website_record = website_record
        self.visited_urls = set()
        self.num_crawled = 0

    def crawl(self, start_url, ex_id):
        """
        Perform the crawling process starting from the specified URL.
        
        Args:
            start_url: The starting URL for the crawling process.
            ex_id: The ID of the execution associated with the crawling process.
        """
        queue = deque([start_url])
        execution = self.get_execution(ex_id)
        execution.save()

        with concurrent.futures.ThreadPoolExecutor() as executor:
            while queue:
                url = queue.popleft()

                if url in self.visited_urls:
                    continue

                self.visited_urls.add(url)

                future = executor.submit(self.process_url, url, execution)
                links = future.result()

                self.enqueue_valid_links(links, queue)

    def get_execution(self, execution_id):
        """
        Get the execution object associated with the specified ID.
        
        Args:
            execution_id: The ID of the execution.
        
        Returns:
            The Execution object if found, None otherwise.
        """
        try:
            execution = Execution.objects.get(id=execution_id)
        except Execution.DoesNotExist:
            return None

        execution.status = 'running'
        execution.start_time = make_aware(datetime.now())
        execution.end_time = None
        execution.num_sites_crawled = self.num_crawled

        return execution

    def process_url(self, url, execution):
        """
        Process the specified URL during the crawling process.
        
        Args:
            url: The URL to process.
            execution: The Execution object associated with the crawling process.
        
        Returns:
            A set of valid links extracted from the HTML of the URL.
        """
        response = self.get_response(url)
        html = response.text
        links = self.extract_links(url, html)
        self.num_crawled += 1

        crawled_page = self.save_crawled_page(url, response, html, execution, links)

        return links

    def get_response(self, url):
        """
        Send an HTTP GET request to the specified URL and return the response object.
        
        Args:
            url: The URL to send the request to.
        
        Returns:
            The response object.
        """
        response = requests.get(url)
        return response

    def extract_links(self, url, html):
        """
        Extract links from the HTML of the specified URL.
        
        Args:
            url: The URL from which to extract links.
            html: The HTML content of the URL.
        
        Returns:
            A set of valid links extracted from the HTML.
        """
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
        """
        Normalize the specified link by removing any fragments and ensuring it is an absolute URL.
        
        Args:
            link: The link to normalize.
        
        Returns:
            The normalized link if it is a valid absolute URL, None otherwise.
        """
        parsed_link = urlparse(link)
        if parsed_link.scheme and parsed_link.netloc:
            return parsed_link.geturl()
        return None

    def save_crawled_page(self, url, response, html, execution, links):
        """
        Save the crawled page information to the database.
        
        Args:
            url: The URL of the crawled page.
            response: The response object for the page.
            html: The HTML content of the page.
            execution: The Execution object associated with the crawling process.
            links: The set of valid links extracted from the page.
        
        Returns:
            The saved CrawledPage object.
        """
        crawl_time = datetime.now()
        title = self.extract_title(html)

        crawled_page, created = CrawledPage.objects.get_or_create(
            url=url,
            defaults={
                'crawl_time': make_aware(crawl_time),
                'title': title,
                'execution': execution,
            }
        )

        if not created:
            crawled_page.crawl_time = make_aware(crawl_time)
            crawled_page.title = title
            crawled_page.execution = execution
            crawled_page.save()

        crawled_page.set_links(links, execution=execution)
        crawled_page.save()

        return crawled_page

    def extract_title(self, html):
        """
        Extract the title from the HTML content.
        
        Args:
            html: The HTML content.
        
        Returns:
            The extracted title string.
        """
        soup = BeautifulSoup(html, 'html.parser')
        title_tag = soup.find('title')
        return title_tag.string if title_tag else ''

    def enqueue_valid_links(self, links, queue):
        """
        Enqueue the valid links to the crawling queue.
        
        Args:
            links: The set of links to enqueue.
            queue: The crawling queue.
        """
        for link in links:
            if self.is_valid_link(link):
                queue.append(link)

    def is_valid_link(self, link):
        """
        Check if the specified link is valid based on the website's boundary regular expression.
        
        Args:
            link: The link to check.
        
        Returns:
            True if the link is valid, False otherwise.
        """
        boundary_regexp = self.website_record.boundary_regexp
        return re.match(boundary_regexp, link) is not None
