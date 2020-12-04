## Build stage ##
FROM node:13.8.0-alpine AS buildstage

RUN mkdir -p /home/node
WORKDIR /home/node

RUN apk update
RUN apk add --no-cache --virtual .build-deps alpine-sdk python

COPY --chown=node:node . .

USER node

RUN npm install --no-optional

RUN npm run build
RUN npm run lint

## Live stage ##
FROM gcr.io/distroless/nodejs AS livestage
COPY --from=buildstage /home/node/ /home/node
WORKDIR /home/node
RUN chown -R node:node /home/node

USER node

CMD npm start
