#!/usr/bin/env bash

set -e

docker-compose up -d postgres

WAIT_FOR_PG_ISREADY="while ! pg_isready --quiet; do sleep 1; done"
docker-compose exec postgres bash -c "$WAIT_FOR_PG_ISREADY"

docker-compose exec postgres \
  su - postgres -c "psql coastertest -c '' || createdb coastertest"
