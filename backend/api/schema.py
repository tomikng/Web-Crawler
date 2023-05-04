import graphene
from graphene_django import DjangoObjectType
from .models import WebsiteRecord, CrawledPage
from django.utils import timezone


class WebPageType(DjangoObjectType):
    identifier = graphene.ID(source='pk')
    regexp = graphene.String(source='boundary_regexp')

    class Meta:
        model = WebsiteRecord
        fields = ("label", "url", "tags", "active", "periodicity")


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


class CreateWebsiteRecordMutation(graphene.Mutation):
    class Arguments:
        label = graphene.String(required=True)
        url = graphene.String(required=True)
        regexp = graphene.String(required=True)
        tags = graphene.List(graphene.String)
        active = graphene.Boolean(required=True)
        periodicity = graphene.String(required=True)

    success = graphene.Boolean()
    website_record = graphene.Field(lambda: WebPageType)

    def mutate(root, info, label, url, regexp, tags, active, periodicity):
        website_record = WebsiteRecord(label=label, url=url, boundary_regexp=regexp, tags=','.join(tags), active=active,
                                       periodicity=periodicity)
        website_record.save()
        return CreateWebsiteRecordMutation(success=True, website_record=website_record)


class UpdateWebsiteRecordMutation(graphene.Mutation):
    class Arguments:
        identifier = graphene.ID(required=True)
        label = graphene.String()
        url = graphene.String()
        regexp = graphene.String()
        tags = graphene.List(graphene.String)
        active = graphene.Boolean()
        periodicity = graphene.String()

    success = graphene.Boolean()
    website_record = graphene.Field(lambda: WebPageType)

    def mutate(root, info, identifier, label=None, url=None, regexp=None, tags=None, active=None, periodicity=None):
        website_record = WebsiteRecord.objects.get(pk=identifier)
        if label is not None:
            website_record.label = label
        if url is not None:
            website_record.url = url
        if regexp is not None:
            website_record.boundary_regexp = regexp
        if tags is not None:
            website_record.tags = ','.join(tags)
        if active is not None:
            website_record.active = active
        if periodicity is not None:
            website_record.periodicity = periodicity
        website_record.save()
        return UpdateWebsiteRecordMutation(success=True, website_record=website_record)


class DeleteWebsiteRecordMutation(graphene.Mutation):
    class Arguments:
        identifier = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(root, info, identifier):
        website_record = WebsiteRecord.objects.get(pk=identifier)
        website_record.delete()
        return DeleteWebsiteRecordMutation(success=True)


# Update the Mutation class to include the new mutations
class Mutation(graphene.ObjectType):
    create_website_record = CreateWebsiteRecordMutation.Field()
    update_website_record = UpdateWebsiteRecordMutation.Field()
    delete_website_record = DeleteWebsiteRecordMutation.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
