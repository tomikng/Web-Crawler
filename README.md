# Web Crawler
## Databse schema
[![](https://mermaid.ink/img/pako:eNp9U0FuwjAQ_IrlUyvBB3xrC0hVe0AtUi-RoiVeUgvHjuwNECH-3k0gIZSInJyZiT0zGx9l5jVKJTMLMc4M5AGKxAnRvosfXEdD-IWZD_rY4PwYrcRLRX5h0OoLVgWrxAoPNATXvnIaQp0GzPFQ3gtKDMZrkxmq70kLaxzZFDIyO1Ti1XuL4IYUQR7ZWghQD-EIO3x6VmLnTQdptEg34Okaen7ArCLj3aPA-3MzHK2pRomFD2hy94F1dyoBVfHeP-OBUjIFZ5gB4YpXQx6dfsC6qkibc2OaBdhb5JOXngGu5N0R1xx69SDR21m7hBwfZcIu-Eic0QG3Hh64JUMWRypASq1x2_hvKvkYPojxyVznfxN8kZYcaMQr-VGm3enmjxbT6XXaSvxCbCQ90tCD6nrBAGskja2ea17GvpMTWWAowGi-bG2IRNIvFphIxUu-JttEJu7EOuCxfNcuk4pChRNZlZq7vdzNW3CuDfkg1QZsxNMfLr9FRw?type=png)](https://mermaid.live/edit#pako:eNp9U0FuwjAQ_IrlUyvBB3xrC0hVe0AtUi-RoiVeUgvHjuwNECH-3k0gIZSInJyZiT0zGx9l5jVKJTMLMc4M5AGKxAnRvosfXEdD-IWZD_rY4PwYrcRLRX5h0OoLVgWrxAoPNATXvnIaQp0GzPFQ3gtKDMZrkxmq70kLaxzZFDIyO1Ti1XuL4IYUQR7ZWghQD-EIO3x6VmLnTQdptEg34Okaen7ArCLj3aPA-3MzHK2pRomFD2hy94F1dyoBVfHeP-OBUjIFZ5gB4YpXQx6dfsC6qkibc2OaBdhb5JOXngGu5N0R1xx69SDR21m7hBwfZcIu-Eic0QG3Hh64JUMWRypASq1x2_hvKvkYPojxyVznfxN8kZYcaMQr-VGm3enmjxbT6XXaSvxCbCQ90tCD6nrBAGskja2ea17GvpMTWWAowGi-bG2IRNIvFphIxUu-JttEJu7EOuCxfNcuk4pChRNZlZq7vdzNW3CuDfkg1QZsxNMfLr9FRw)

## Instalation
### System requirements
- Python 3.8 or newer
- optional - Virtual enviroment
- Docker
- [Redis](https://redis.io/docs/getting-started/installation/install-redis-on-windows/)
  

### Instrukce na spusteni
#### Docker
```commandline
docker compose up --build
```

Vypnout
```commandline
docker-compose down
```

Poznamka, docker bude rikat ze bezi na `0.0.0.0:8000`, ale do prohlizece musime dat `127.0.0.1:8000`. Protoze `0.0.0.0` 
se premapuje z Linux Docker serveru na `127.0.0.1`
#### Bez dockeru (V pripade nouze)
- Virtual enviroment
    - Libovolny - venv, anakonda
- Stahnout si dependencies
```commandline
pip install -r requirements.txt
```
- Poznamka
  - Na graphql + django pouzijeme knihovnu Graphene-Django 
  - Nastudovat si dokumentaci
  
- Create
  
```commandline
python manage.py createsuperuser
```

- Migrate
```commandline
python manage.py makemigrations
python manage.py migrate
```
  
- Spustit backend
```commandline
python manage.py runserver
```

Spustit celery (mit zapnuty redis pomoci WSL `redis-server`)
```commandline
celery -A backend worker -l info --pool=solo
celery -A backend beat -l info --scheduler django_celery_beat.schedulers.DatabaseScheduler
```

