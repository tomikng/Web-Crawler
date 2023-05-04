from django.contrib import admin
from .models import WebsiteRecord, Execution, CrawledPage

admin.site.register(WebsiteRecord)
admin.site.register(Execution)
admin.site.register(CrawledPage)

