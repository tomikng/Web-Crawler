import graphene
from graphene_django import DjangoObjectType
from api.models import WebsiteRecord, CrawledPage


class WebsiteRecordType(DjangoObjectType):
    class Meta:
        model = WebsiteRecord
        fields = "__all__"


class NodeType(DjangoObjectType):
    class Meta:
        model = CrawledPage
        fields = "__all__"


class Query(graphene.ObjectType):
    websites = graphene.List(WebsiteRecordType)
    nodes = graphene.List(NodeType, web_pages=graphene.List(graphene.ID))

    def resolve_websites(root, info):
        return WebsiteRecord.objects.all()

    def resolve_nodes(root, info, web_pages=None):
        if web_pages:
            return CrawledPage.objects.filter(owner__in=web_pages)
        return CrawledPage.objects.all()


schema = graphene.Schema(query=Query)
