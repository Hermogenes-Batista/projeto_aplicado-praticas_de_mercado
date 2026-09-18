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

if [ $# -gt 0 ]; then
  echo "Executando comando customizado: $@"
  exec "$@"
else
  echo "Executando migracoes do Django..."
  python projeto_aplicado/manage.py migrate --noinput

  echo "Iniciando Gunicorn..."
  exec gunicorn praticas_de_mercado.wsgi:application \
    --chdir projeto_aplicado \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
fi
#scp -i ~/.ssh/ssh-key-2026-09-18.key ubuntu@64.181.175.165:/opt/projeto-aplicado/
export VM_HOST="64.181.175.165"
