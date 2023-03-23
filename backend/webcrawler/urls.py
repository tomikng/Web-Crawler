from django.urls import path
from .views import *

urlpatterns = [
    path('website-record', WebsiteRecordList.as_view()),
    path('execution', ExecutionList.as_view()),
    path('tag', TagList.as_view()),
    path('link', LinkList.as_view()),
    path('crawled-web', CrawledWebList.as_view()),

    path('website-record/<int:pk>', WebsiteRecordDetail.as_view()),
    path('website-record-create', CreateRecord.as_view()),
]