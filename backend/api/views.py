from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from drf_yasg import openapi


from .filters import ExecutionFilter, WebsiteRecordFilter
from .serializers import WebsiteRecordSerializer, ExecutionSerializer
from .models import WebsiteRecord, Execution


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = 'page_size'
    max_page_size = 100
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ExecutionFilter
    ordering_fields = ['start_time']


@swagger_auto_schema(method='POST', request_body=WebsiteRecordSerializer)
@api_view(['POST'])
def create_website_record(request):
    """
    Create a website record. And straightaway the website will be crawled if is active
    """
    serializer = WebsiteRecordSerializer(data=request.data)
    if serializer.is_valid():
        website_record = serializer.save()
        return Response({'success': True, 'website_record': serializer.data})
    return Response(serializer.errors, status=400)


@swagger_auto_schema(method='PUT', request_body=WebsiteRecordSerializer)
@api_view(['PUT'])
def update_website_record(request, identifier):
    """
    Update a website record. And straightaway the website will be crawled if is active
    """
    website_record = get_object_or_404(WebsiteRecord, pk=identifier)
    serializer = WebsiteRecordSerializer(website_record, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'website_record': serializer.data})
    return Response(serializer.errors, status=400)


@swagger_auto_schema(method='DELETE')
@api_view(['DELETE'])
def delete_website_record(request, identifier):
    """
    Delete a website record.
    """
    website_record = get_object_or_404(WebsiteRecord, pk=identifier)
    website_record.delete()
    return Response({'success': True})


@swagger_auto_schema(
    method='GET',
    responses={200: ExecutionSerializer(many=True)},
    manual_parameters=[
        openapi.Parameter(
            name='ordering',
            in_=openapi.IN_QUERY,
            required=False,
            type=openapi.TYPE_STRING,
            enum=['start_time', '-start_time'],
            description='Order executions by start time (ascending or descending)',
        ),
    ]
)
@api_view(['GET'])
def get_executions(request):
    """
    Get all executions.
    """
    website_records = request.GET.getlist('website_records[]')
    if website_records:
        executions = Execution.objects.filter(website_record__in=website_records)
    else:
        executions = Execution.objects.all()

    execution_filter = ExecutionFilter(request.GET, queryset=executions)
    paginator = StandardResultsSetPagination()
    paginated_executions = paginator.paginate_queryset(execution_filter.qs, request)

    serializer = ExecutionSerializer(paginated_executions, many=True)
    return paginator.get_paginated_response(serializer.data)


@swagger_auto_schema(
    method='GET',
    responses={200: WebsiteRecordSerializer(many=True)},
    manual_parameters = [
        openapi.Parameter(
            name='ordering',
            in_=openapi.IN_QUERY,
            required=False,
            type=openapi.TYPE_STRING,
            enum=['url', '-url'],
            description='Order executions by start time (ascending or descending)',
        ),
    ]
)
@api_view(['GET'])
def get_website_records(request):
    """
    Get all website records.
    Filter by url, label, and tags with /api/website_records?url=<url>&label=<label>&tags=<tags>
    """
    website_records = WebsiteRecord.objects.all()
    website_records_filter = WebsiteRecordFilter(request.GET, queryset=website_records)
    paginator = StandardResultsSetPagination()
    paginated_website_records = paginator.paginate_queryset(website_records_filter.qs, request)

    serializer = WebsiteRecordSerializer(paginated_website_records, many=True)
    return paginator.get_paginated_response(serializer.data)


@swagger_auto_schema(method='GET', responses={200: WebsiteRecordSerializer()})
@api_view(['GET'])
def get_website_record(request, identifier):
    """
    Get a specific website record.
    """
    website_record = get_object_or_404(WebsiteRecord, pk=identifier)
    serializer = WebsiteRecordSerializer(website_record)
    return Response(serializer.data)


@swagger_auto_schema(method='GET', responses={200: ExecutionSerializer()})
@api_view(['GET'])
def get_execution(request, identifier):
    """
    Get a specific execution.
    """
    execution = get_object_or_404(Execution, pk=identifier)
    serializer = ExecutionSerializer(execution)
    return Response(serializer.data)


@swagger_auto_schema(method='POST')
@api_view(['POST'])
def create_execution(request, website_id):
    """
    Create an execution for the specified website.
    """
    website = get_object_or_404(WebsiteRecord, pk=website_id)
    # execution = Execution.objects.create(website_record=website)
    # serializer = ExecutionSerializer(execution)
    from webcrawler.tasks import crawl_website
    crawl_website.delay(website.label)
    return Response({'success': True})


@swagger_auto_schema(method='PUT', request_body=ExecutionSerializer)
@api_view(['PUT'])
def update_execution(request, identifier):
    """
    Update an execution.
    """
    execution = get_object_or_404(Execution, pk=identifier)
    serializer = ExecutionSerializer(execution, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'execution': serializer.data})
    return Response(serializer.errors, status=400)


@swagger_auto_schema(method='DELETE')
@api_view(['DELETE'])
def delete_execution(request, identifier):
    """
    Delete an execution.
    """
    execution = get_object_or_404(Execution, pk=identifier)
    execution.delete()
    return Response({'success': True})
