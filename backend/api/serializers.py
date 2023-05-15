from rest_framework import serializers
from .models import WebsiteRecord, Execution, CrawledPage


class CrawledPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrawledPage
        fields = '__all__'


class ExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Execution
        fields = '__all__'


class WebsiteRecordSerializer(serializers.ModelSerializer):
    executions = ExecutionSerializer(many=True, read_only=True)

    class Meta:
        model = WebsiteRecord
        fields = '__all__'