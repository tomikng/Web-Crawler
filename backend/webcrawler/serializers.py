from rest_framework import serializers
from .models import *

class WebsiteRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteRecord
        fields = ('recordId', 'url', 'regex', 'periodicity', 'label', 'active') 


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class ExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Execution
        fields = '__all__'


class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = '__all__'


class CrawledWebSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrawledWeb
        fields = '__all__'

class CreateRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteRecord
        fields = '__all__'