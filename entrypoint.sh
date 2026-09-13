#!/bin/sh
set -e

# Wait for MySQL to accept connections if DB_HOST is set
if [ -n "$DB_HOST" ]; then
  echo "Aguardando inicializacao do MySQL em ${DB_HOST}:${DB_PORT:-3306}..."
  until nc -z -v -w30 "$DB_HOST" "${DB_PORT:-3306}"; do
    echo "MySQL ainda indisponivel - aguardando 2 segundos..."
    sleep 2
  done
  echo "MySQL esta pronto e aceitando conexoes!"
fi

echo "Executando migracoes do Django..."
python projeto_aplicado/manage.py migrate --noinput

if [ $# -gt 0 ]; then
  echo "Executando comando customizado: $@"
  exec "$@"
else
  echo "Iniciando servidor de desenvolvimento do Django..."
  exec python projeto_aplicado/manage.py runserver 0.0.0.0:8000
fi
