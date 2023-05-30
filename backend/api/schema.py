import graphene
from graphene_django import DjangoObjectType
from .models import WebsiteRecord, CrawledPage, Link
from django.utils import timezone


class WebPage(DjangoObjectType):
    """
    GraphQL type for the WebsiteRecord model.
    
    It includes the following fields:
      - identifier: the primary key of the WebsiteRecord
      - regexp: the boundary regular expression for the WebsiteRecord
    """
    identifier = graphene.ID(source='pk', required=True)
    regexp = graphene.String(source='boundary_regexp', required=True)

    class Meta:
        model = WebsiteRecord
        fields = ("label", "url", "tags", "active")


class LinkNode(DjangoObjectType):
    """
    GraphQL type for the Link model.
    """
    class Meta:
        model = Link
        fields = ("from_page", "to_page")


class Node(DjangoObjectType):
    """
    GraphQL type for the CrawledPage model.

    It includes the following fields:
      - owner: the WebsiteRecord associated with the CrawledPage
      - crawl_time: the time the page was crawled
      - links: the links from the CrawledPage to other pages
    """
    class Meta:
        model = CrawledPage
        fields = ("title", "url", "crawl_time")

    owner = graphene.Field(WebPage, required=True)
    crawl_time = graphene.String()
    links = graphene.List(lambda: Node)

    def resolve_owner(self, info):
        """
        Resolver for the 'owner' field. Returns the WebsiteRecord
        associated with the CrawledPage.
        """
        return self.execution.website_record

    def resolve_crawl_time(self, info):
        """
        Resolver for the 'crawl_time' field. Returns the crawl time as a string.
        """
        return str(self.crawl_time)

    def resolve_links(self, info):
        """
        Resolver for the 'links' field. Returns a list of CrawledPages that
        this page links to.
        """
        return [link.to_page for link in self.links_from.all()]


class Query(graphene.ObjectType):
    """
    Root GraphQL query type.

    It includes the following fields:
      - websites: a list of all WebsiteRecords
      - nodes: a list of all CrawledPages, optionally filtered by WebsiteRecord
    """
    websites = graphene.List(graphene.NonNull(WebPage), required=True)
    nodes = graphene.List(graphene.NonNull(Node), web_pages=graphene.List(graphene.NonNull(graphene.ID)), required= True)

    def resolve_websites(root, info):
        """
        Resolver for the 'websites' field. Returns all WebsiteRecords.
        """
        return WebsiteRecord.objects.all()

    def resolve_nodes(root, info, web_pages=None):
        """
        Resolver for the 'nodes' field. Returns all CrawledPages,
        optionally filtered by WebsiteRecord.

        Args:
            web_pages: A list of WebsiteRecord primary keys to filter by.
        """
        if web_pages:
            return CrawledPage.objects.filter(execution__website_record__in=web_pages)
        return CrawledPage.objects.all()


schema = graphene.Schema(query=Query)
