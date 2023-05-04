import graphene
from graphene_django import DjangoObjectType
from .models import WebsiteRecord, CrawledPage


class WebPageType(DjangoObjectType):
    identifier = graphene.ID(source='pk')
    regexp = graphene.String(source='boundary_regexp')

    class Meta:
        model = WebsiteRecord
        fields = ("label", "url", "tags", "active")


class NodeType(DjangoObjectType):
    class Meta:
        model = CrawledPage
        fields = ("title", "url", "crawl_time", "links")

    owner = graphene.Field(WebPageType)

    def resolve_owner(self, info):
        return self.execution.website_record


class Query(graphene.ObjectType):
    websites = graphene.List(WebPageType)
    nodes = graphene.List(NodeType, web_pages=graphene.List(graphene.ID))

    def resolve_websites(root, info):
        return WebsiteRecord.objects.all()

    def resolve_nodes(root, info, web_pages=None):
        if web_pages:
            return CrawledPage.objects.filter(execution__website_record__in=web_pages)
        return CrawledPage.objects.all()


schema = graphene.Schema(query=Query)
