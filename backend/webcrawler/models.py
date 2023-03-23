from datetime import datetime
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator



# Create your models here.
class WebsiteRecord(models.Model):
    recordId = models.AutoField(primary_key=True)
    url = models.URLField()
    regex = models.CharField(max_length=265, blank=True)
    periodicity = models.PositiveIntegerField(help_text="enter time periodicity in seconds (minimal 60 s = 1 min)",
                                            validators=[MinValueValidator(60), MaxValueValidator(31536000)])
    label = models.CharField(max_length=1024)
    active = models.BooleanField(default=False)
    tags = models.TextField(blank=True, help_text="tags must be separeted by ; and space, example: tag1; tag2")

    def __str___(self):
        return self.url


class Tag(models.Model):
    tagId = models.AutoField(primary_key=True)
    name = models.CharField(max_length=256)
    recordId = models.ForeignKey(WebsiteRecord, on_delete=models.CASCADE)

    def __str___(self):
        return self.name


class Execution(models.Model):
    executionId = models.AutoField(primary_key=True)
    url = models.URLField()
    label = models.TextField(max_length=1024)
    executionStartTime = models.DateTimeField(default=datetime.now)
    executionEndTime = models.DateTimeField(default=datetime.now)
    finished = models.BooleanField(default=False)
    sitesCrawled = models.IntegerField(default=0)
    recordId = models.ForeignKey(WebsiteRecord, on_delete=models.CASCADE)
    

class CrawledWeb(models.Model):
    crawledId = models.AutoField(primary_key=True)
    url = models.URLField()
    crawlTime = models.FloatField()
    title = models.CharField(max_length=100)
    recordId = models.ForeignKey(WebsiteRecord, on_delete=models.CASCADE)


class Link(models.Model):
    linkId = models.AutoField(primary_key=True)
    externalUrl = models.URLField()
    crawledId = models.ForeignKey(CrawledWeb, on_delete=models.CASCADE)