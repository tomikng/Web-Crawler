from django_celery_beat.models import PeriodicTask, IntervalSchedule
from django.apps import apps


def create_periodic_crawl_task(website_record):
    period = {
        'minute': IntervalSchedule.MINUTES,
        'hour': IntervalSchedule.HOURS,
        'day': IntervalSchedule.DAYS,
    }.get(website_record.periodicity, IntervalSchedule.MINUTES)

    schedule, _ = IntervalSchedule.objects.get_or_create(
        every=1,
        period=period
    )

    task_name = f'crawl_website_{website_record.label}'
    crawl_task, created = PeriodicTask.objects.get_or_create(
        name=task_name,
        defaults={
            'task': 'webcrawler.tasks.crawl_website',
            'args': f'["{website_record.label}"]',
            'interval': schedule,
            'enabled': website_record.active,
        }
    )

    if not created:
        crawl_task.enabled = website_record.active
        crawl_task.interval = schedule
        crawl_task.save()

    # If there is no execution for the given record and the record is active, start the crawling as soon as possible
    if website_record.active:
        Execution = apps.get_model('api', 'Execution')
        if not Execution.objects.filter(website_record=website_record).exists():
            from .tasks import crawl_website
            crawl_website.delay(website_record.label)
