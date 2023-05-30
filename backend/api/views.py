from django.db.models import Max
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from drf_yasg import openapi

from .serializers import WebsiteRecordSerializer, ExecutionSerializer
from .models import WebsiteRecord, Execution


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100


@swagger_auto_schema(method='POST', request_body=WebsiteRecordSerializer)
@api_view(['POST'])
def create_website_record(request):
    """
    Create a website record. And straightaway the website will be crawled if is active.
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
    responses:
        200:
            description: A successful response with the created website record.
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            success:
                                type: boolean
                            website_record:
                                $ref: '#/components/schemas/WebsiteRecord'
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
    Update a website record. And straightaway the website will be crawled if is active.
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
        - name: identifier
          description: The identifier of the website record to update.
          required: true
          in: path
          type: integer
    responses:
        200:
            description: A successful response with the updated website record.
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            success:
                                type: boolean
                            website_record:
                                $ref: '#/components/schemas/WebsiteRecord'
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
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
        - name: identifier
          description: The identifier of the website record to delete.
          required: true
          in: path
          type: integer
    responses:
        200:
            description: A successful response indicating the website record was deleted.
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            success:
                                type: boolean
    """
    website_record = get_object_or_404(WebsiteRecord, pk=identifier)
    website_record.delete()
    return Response({'success': True})


@swagger_auto_schema(
    method='GET',
    responses={200: WebsiteRecordSerializer(many=True)},
    manual_parameters=[
        openapi.Parameter('url', openapi.IN_QUERY, description="URL of the website to filter",
                          type=openapi.TYPE_STRING),
        openapi.Parameter('label', openapi.IN_QUERY, description="Label of the website to filter",
                          type=openapi.TYPE_STRING),
        openapi.Parameter('tags[]', openapi.IN_QUERY, description="Tags of the website to filter",
                          type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
        openapi.Parameter('sort', openapi.IN_QUERY,
                          description="Sort the results by 'url', '-url', 'last_crawled', or '-last_crawled'",
                          type=openapi.TYPE_STRING),
        openapi.Parameter('page', openapi.IN_QUERY, description="Page number for pagination",
                          type=openapi.TYPE_INTEGER),
        openapi.Parameter('page_size', openapi.IN_QUERY, description="Number of items per page",
                          type=openapi.TYPE_INTEGER)
    ]
)
@api_view(['GET'])
def get_website_records(request):
    """
    Get all website records.
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
    responses:
        200:
            description: A successful response with a list of website records.
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            count:
                                type: integer
                            next:
                                type: string
                            previous:
                                type: string
                            results:
                                type: array
                                items:
                                    $ref: '#/components/schemas/WebsiteRecord'
    """
    url = request.GET.get('url')
    label = request.GET.get('label')
    tags = request.GET.getlist('tags[]')
    sort = request.GET.get('sort')

    website_records = WebsiteRecord.objects.all()
    if url:
        website_records = website_records.filter(url__icontains=url)
    if label:
        website_records = website_records.filter(label__icontains=label)
    if tags:
        website_records = website_records.filter(tags__overlap=tags)

    # Annotate each website record with the max 'end_time' of its executions
    website_records = website_records.annotate(last_crawled=Max('execution__start_time'))

    if sort in ['url', '-url', 'last_crawled', '-last_crawled']:
        website_records = website_records.order_by(sort)

    paginator = StandardResultsSetPagination()
    paginated_website_records = paginator.paginate_queryset(website_records, request)

    serializer = WebsiteRecordSerializer(paginated_website_records, many=True)
    return paginator.get_paginated_response(serializer.data)


@swagger_auto_schema(
    method='GET',
    responses={200: ExecutionSerializer(many=True)},
    manual_parameters=[
        openapi.Parameter('label', openapi.IN_QUERY, description="Label of the website to filter",
                          type=openapi.TYPE_STRING),
        openapi.Parameter('sort', openapi.IN_QUERY,
                          description="Sort the results by 'start_time', or '-start_time'",
                          type=openapi.TYPE_STRING),
        openapi.Parameter('page', openapi.IN_QUERY, description="Page number for pagination",
                          type=openapi.TYPE_INTEGER),
        openapi.Parameter('page_size', openapi.IN_QUERY, description="Number of items per page",
                          type=openapi.TYPE_INTEGER)
    ]
)
@api_view(['GET'])
def get_executions(request):
    """
    Get all executions.
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
    responses:
        200:
            description: A successful response with a list of executions.
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            count:
                                type: integer
                            next:
                                type: string
                            previous:
                                type: string
                            results:
                                type: array
                                items:
                                    $ref: '#/components/schemas/Execution'
    """
    label = request.GET.get('label')
    sort = request.GET.get('sort')

    executions = Execution.objects.all()

    if label:
        executions = executions.filter(website_record__label__icontains=label)

    if sort in ['start_time', '-start_time']:
        executions = executions.order_by(sort)

    paginator = StandardResultsSetPagination()
    paginated_executions = paginator.paginate_queryset(executions, request)

    serializer = ExecutionSerializer(paginated_executions, many=True)
    return paginator.get_paginated_response(serializer.data)


@swagger_auto_schema(method='GET', responses={200: WebsiteRecordSerializer()})
@api_view(['GET'])
def get_website_record(request, identifier):
    """
    Get a specific website record.
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
        - name: identifier
          description: The identifier of the website record to retrieve.
          required: true
          in: path
          type: integer
    responses:
        200:
            description: A successful response with the requested website record.
            content:
                application/json:
                    schema:
                        $ref: '#/components/schemas/WebsiteRecord'
    """
    website_record = get_object_or_404(WebsiteRecord, pk=identifier)
    serializer = WebsiteRecordSerializer(website_record)
    return Response(serializer.data)


@swagger_auto_schema(method='GET', responses={200: ExecutionSerializer()})
@api_view(['GET'])
def get_execution(request, identifier):
    """
    Get a specific execution.
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
        - name: identifier
          description: The identifier of the execution to retrieve.
          required: true
          in: path
          type: integer
    responses:
        200:
            description: A successful response with the requested execution.
            content:
                application/json:
                    schema:
                        $ref: '#/components/schemas/Execution'
    """
    execution = get_object_or_404(Execution, pk=identifier)
    serializer = ExecutionSerializer(execution)
    return Response(serializer.data)


@swagger_auto_schema(method='POST')
@api_view(['POST'])
def create_execution(request, website_id):
    """
    Create an execution for the specified website.
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
        - name: website_id
          description: The identifier of the website to create the execution for.
          required: true
          in: path
          type: integer
    responses:
        200:
            description: A successful response indicating the execution was created.
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            success:
                                type: boolean
    """
    website = get_object_or_404(WebsiteRecord, pk=website_id)
    from webcrawler.tasks import crawl_website
    crawl_website.delay(website.id)
    return Response({'success': True})


@swagger_auto_schema(method='PUT', request_body=ExecutionSerializer)
@api_view(['PUT'])
def update_execution(request, identifier):
    """
    Update an execution.
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
        - name: identifier
          description: The identifier of the execution to update.
          required: true
          in: path
          type: integer
    responses:
        200:
            description: A successful response with the updated execution.
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            success:
                                type: boolean
                            execution:
                                $ref: '#/components/schemas/Execution'
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
    ---
    parameters:
        - name: request
          description: The HTTP request object.
          required: true
          in: query
          type: object
        - name: identifier
          description: The identifier of the execution to delete.
          required: true
          in: path
          type: integer
    responses:
        200:
            description: A successful response indicating the execution was deleted.
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            success:
                                type: boolean
    """
    execution = get_object_or_404(Execution, pk=identifier)
    execution.delete()
    return Response({'success': True})
