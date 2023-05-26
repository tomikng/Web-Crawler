import django_filters

from .models import Execution, WebsiteRecord

class ExecutionFilter(django_filters.FilterSet):
    label = django_filters.CharFilter(lookup_expr='icontains')
    start_time = django_filters.DateTimeFilter(field_name='start_time')

    class Meta:
        model = Execution
        fields = ['start_time']

class WebsiteRecordFilter(django_filters.FilterSet):
    url = django_filters.CharFilter(lookup_expr='icontains')
    label = django_filters.CharFilter(lookup_expr='icontains')
    tags = django_filters.CharFilter(field_name='tags', lookup_expr='icontains')

    class Meta:
        model = WebsiteRecord
        fields = ['url', 'label', 'tags']
