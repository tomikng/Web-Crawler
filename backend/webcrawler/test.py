import re
from collections import deque
from urllib.parse import urljoin
import concurrent.futures

import requests
from bs4 import BeautifulSoup


class Crawler:
    def __init__(self):
        # self.website_record = website_record
        self.visited_urls = set()
        self.pages = []

    def crawl(self, start_url):
        queue = deque([start_url])
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            while queue:
                url = queue.popleft()

                if url in self.visited_urls:
                    continue

                self.visited_urls.add(url)
                response = requests.get(url)
                html = response.text
                links = self.extract_links(url, html)

                # Save the crawled page data
                page_data = {
                    'url': url,
                    'crawl_time': response.elapsed.total_seconds(),
                    'title': self.extract_title(html),
                    'links': links
                }
                print(page_data)
                self.pages.append(page_data)

                for link in links:
                    # if self.is_valid_link(link):
                    queue.append(link)

    def extract_title(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        title_tag = soup.find('title')
        return title_tag.string if title_tag else ''

    def extract_links(self, url, html):
        soup = BeautifulSoup(html, 'html.parser')
        links = set()
        for a_tag in soup.find_all('a', href=True):
            link = a_tag['href']
            absolute_link = urljoin(url, link)
            links.add(absolute_link)
        return links

    # def is_valid_link(self, link):
    #     boundary_regexp = self.website_record.boundary_regexp
    #     return re.match(boundary_regexp, link) is not None


c = Crawler()

c.crawl("https://www.mff.cuni.cz")
