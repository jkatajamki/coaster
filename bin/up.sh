#!/usr/bin/env bash

set -e

docker-compose up -d postgres

WAIT_FOR_PG_ISREADY="while ! pg_isready --quiet; do sleep 1; done"
docker-compose exec postgres bash -c "$WAIT_FOR_PG_ISREADY"

for ENV in development test
do
  # Create database for this env if it doesn't exist
  docker-compose exec postgres \
    su - postgres -c "psql $ENV -c '' || createdb coaster-$ENV"

  # Run migrations in this env
  docker-compose run --rm -e NODE_ENV=$ENV coaster npm run migrate:up
done

docker-compose up -d
