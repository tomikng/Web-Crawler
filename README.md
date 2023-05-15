# System requirements
- Python 3.8 or newer
- optional - Virtual enviroment
- Docker
- [Redis](https://redis.io/docs/getting-started/installation/install-redis-on-windows/)
  

# Instrukce na spusteni
## Docker
```commandline
docker compose up --build
```

Vypnout
```commandline
docker-compose down
```

Poznamka, docker bude rikat ze bezi na `0.0.0.0:8000`, ale do prohlizece musime dat `127.0.0.1:8000`. Protoze `0.0.0.0` 
se premapuje z Linux Docker serveru na `127.0.0.1`
## Bez dockeru (V pripade nouze)
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

