from django.contrib import admin
from django.urls import path, include
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from .views import (
    create_website_record,
    update_website_record,
    delete_website_record,
    get_website_records,
    get_website_record,
    get_execution,
    get_executions,
    create_execution,
    update_execution,
    delete_execution,
)

schema_view = get_schema_view(
    openapi.Info(
        title="Webcrawler API",
        default_version='v1',
        description="API documentation of the website records and execution",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('website_records/create/', create_website_record, name='create_website_record'),
    path('website_records/update/<int:identifier>/', update_website_record, name='update_website_record'),
    path('website_records/delete/<int:identifier>/', delete_website_record, name='delete_website_record'),
    path('website_records/', get_website_records, name='get_website_records'),
    path('website_records/<int:identifier>/', get_website_record, name='get_website_record'),
    path('executions/', get_executions, name='get_executions'),
    path('executions/<int:identifier>/', get_execution, name='get_execution'),
    path('executions/create/<int:website_id>/', create_execution, name='create_execution'),
    path('executions/update/<int:identifier>/', update_execution, name='update_execution'),
    path('executions/delete/<int:identifier>/', delete_execution, name='delete_execution'),
    path('docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
