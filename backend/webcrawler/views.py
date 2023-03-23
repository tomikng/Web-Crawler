from numpy import record
from rest_framework import generics, status
from .models import WebsiteRecord, Tag, Execution, CrawledWeb, Link
from .serializers import WebsiteRecordSerializer, TagSerializer, ExecutionSerializer, CrawledWebSerializer, LinkSerializer, CreateRecordSerializer
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from django_celery_beat.models import PeriodicTask, IntervalSchedule
import json


# Create your views here.
class WebsiteRecordList(generics.ListAPIView):
    queryset = WebsiteRecord.objects.all()
    serializer_class = WebsiteRecordSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class WebsiteRecordDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = WebsiteRecord.objects.all()
    serializer_class = WebsiteRecordSerializer

    def put(self, request, *args, **kwargs):
        website_record = WebsiteRecord.objects.all().get(recordId = self.kwargs['pk'])
        active = request.POST.get('active', website_record.active)
        periodicity = request.POST.get('periodicity', website_record.periodicity)

        schedule, created = IntervalSchedule.objects.get_or_create(
                every=periodicity,
                period=IntervalSchedule.SECONDS,
        )        
        PeriodicTask.objects.filter(name='priorit-webcrawler-' + str(self.kwargs['pk'])).update(enabled=True)
        PeriodicTask.objects.filter(name='webcrawler-scheduler-' + str(self.kwargs['pk'])).update(interval = schedule, enabled=active)
        return self.update(request, *args, **kwargs)


    def destroy(self, request, *args, **kwargs):
        PeriodicTask.objects.filter(name='priorit-webcrawler' + str(self.kwargs['pk'])).delete()
        PeriodicTask.objects.filter(name='webcrawler-scheduler-' + str(self.kwargs['pk'])).delete()
        return super().destroy(request, *args, **kwargs)    


class TagList(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'


class ExecutionList(generics.ListAPIView):
    queryset = Execution.objects.all()
    serializer_class = ExecutionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'
    

class CrawledWebList(generics.ListAPIView):
    queryset = CrawledWeb.objects.all()
    serializer_class = CrawledWebSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'


class LinkList(generics.ListAPIView):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'


class CreateRecord(generics.CreateAPIView):
    serializer_class = CreateRecordSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        website_record = serializer.save()
        self.create_tags(website_record.tags, website_record)

        priorit_schedule, created = IntervalSchedule.objects.get_or_create(
            every=5,                
            period=IntervalSchedule.SECONDS,
        )
        PeriodicTask.objects.create(
            interval=priorit_schedule,                  
            name='priorit-webcrawler-' + str(website_record.recordId),        
            task='crawl_web',
            args=json.dumps([website_record.url, website_record.regex, website_record.recordId]),
            priority = 0,
            one_off = True,
        )
        

        schedule, created = IntervalSchedule.objects.get_or_create(
            every=website_record.periodicity,                
            period=IntervalSchedule.SECONDS,
        )
        PeriodicTask.objects.create(
            interval=schedule,                  
            name='webcrawler-scheduler-' + str(website_record.recordId),        
            task='crawl_web',
            args=json.dumps([website_record.url, website_record.regex, website_record.recordId]),
            priority = 255,
            enabled = website_record.active
        )
        return Response(self.serializer_class(website_record).data, status=status.HTTP_201_CREATED)


    def create_tags(self, tags, website_record):
        tags = tags.split("; ")
        if (tags[0] != ""):
            for tag in tags:
                Tag.objects.create(name=tag, recordId=website_record)