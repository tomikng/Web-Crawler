# System requirements
- Python 3.8 or newer
- optional - Virtual enviroment
- Docker
  

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