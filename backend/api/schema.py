import graphene
from graphene_django import DjangoObjectType
from .models import WebsiteRecord, CrawledPage, Link
from django.utils import timezone


class WebPage(DjangoObjectType):
    identifier = graphene.ID(source='pk', required=True)
    regexp = graphene.String(source='boundary_regexp', required=True)

    class Meta:
        model = WebsiteRecord
        fields = ("label", "url", "tags", "active")


class LinkNode(DjangoObjectType):
    class Meta:
        model = Link
        fields = ("from_page", "to_page")


class Node(DjangoObjectType):
    class Meta:
        model = CrawledPage
        fields = ("title", "url", "crawl_time")

    owner = graphene.Field(WebPage, required=True)
    crawl_time = graphene.String()
    links = graphene.List(lambda: Node)

    def resolve_owner(self, info):
        return self.execution.website_record

    def resolve_crawl_time(self, info):
        return str(self.crawl_time)

    def resolve_links(self, info):
        return [link.to_page for link in self.links_from.all()]



class Query(graphene.ObjectType):
    websites = graphene.List(graphene.NonNull(WebPage), required=True)
    nodes = graphene.List(graphene.NonNull(Node), web_pages=graphene.List(graphene.NonNull(graphene.ID)), required= True)

    def resolve_websites(root, info):
        return WebsiteRecord.objects.all()

    def resolve_nodes(root, info, web_pages=None):
        if web_pages:
            return CrawledPage.objects.filter(execution__website_record__in=web_pages)
        return CrawledPage.objects.all()



schema = graphene.Schema(query=Query)
