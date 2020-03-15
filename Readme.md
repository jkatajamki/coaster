Coaster.
--------

## Setup

This project requires Node.js and Docker.

Ensure that you have postgres set in your `/etc/hosts` file to point in localhost.

### Set up local development environment

1. Set environment-specific secrets by copying .env.example into .env and entering values
2. Spin up dev and test databases, and run migrations, with ./bin/up.sh

### Develop

1. Run latest migrations with `npm run migrate:up`
2. Run app in development mode with `npm run dev:start`
3. Install new dependencies with `npm run install-dep`. This will install dependencies inside the app Docker image. This way you can avoid re-building the image with every installed dependency. New packages can be installed on the fly while the container is running, watching for code changes, and updating them live.
4. Run tests with `npm run test`
