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