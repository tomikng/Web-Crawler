from django.urls import path
from . import views

urlpatterns = [
    # Your web crawler app URLs...
    path('crawl/<str:label>/', views.start_crawling, name='start_crawling'),
]