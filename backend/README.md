# System requirements
- Python 3.8 or newer
- optional - Virtual enviroment
- Docker
- [Redis](https://redis.io/docs/getting-started/installation/install-redis-on-windows/)
  

# Instrukce na spusteni
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

- Flower
- Zmenit v asyncio .venv/Lib/site-packages/tornado/platform/asyncio.py
- ``` python 
  if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())```
```commandline
celery -A backend flower --port=5555
```

Spustit celery (mit zapnuty redis pomoci WSL `sudo service redis-server start`)
```commandline
celery -A backend worker -l info --pool=solo
celery -A backend beat -l INFO --scheduler django_celery_beat.schedulers.DatabaseScheduler
```
- 

Pak lepsi hodit do dockeru. 
Zatim nefunguje, nevim proc
```commandline
docker-compose up --build
```
  
# TODO
- **site_management**: Tato aplikace by mohla řídit CRUD operace pro záznamy webu, stejně jako filtrování, 
  řazení a stránkování.

- **execution_management**: Tato aplikace by mohla řídit provádění webcrawlerů, plánování a udržování historie 
  provádění.

- **crawler**: Tato aplikace by mohla obsahovat samotnou implementaci webcrawleru a jakékoliv související 
  utility.

- **visualization**: Tato aplikace by mohla být zodpovědná za vykreslování vizualizace grafu získaných dat z 
  crawleru a za zpracování případných souvisejících interaktivních prvků.

- **api**: Tato aplikace by mohla řídit raphQL endpointy pro projekt. **(TOMAS)**
  - OpenAPI dokumentace