from rest_framework import serializers
from .models import WebsiteRecord, Execution, CrawledPage


class CrawledPageSerializer(serializers.ModelSerializer):
    """
    Serializer for the CrawledPage model. 

    This serializer includes all fields from the CrawledPage model.
    """

    class Meta:
        model = CrawledPage
        fields = '__all__'


class ExecutionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Execution model. 

    This serializer includes all fields from the Execution model.
    """

    class Meta:
        model = Execution
        fields = '__all__'


class WebsiteRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for the WebsiteRecord model. 

    This serializer includes all fields from the WebsiteRecord model 
    and also includes related executions.
    """

    executions = ExecutionSerializer(many=True, read_only=True)

    class Meta:
        model = WebsiteRecord
        fields = '__all__'
