# Development stage
FROM node:13.8.0-alpine AS development

RUN mkdir /home/node/coaster && chown node:node /home/node/coaster

WORKDIR /home/node/coaster

RUN apk update

RUN apk add --no-cache --virtual .build-deps alpine-sdk python

USER node

COPY --chown=node:node package.json package-lock.json ./

RUN npm install --quiet --no-optional

RUN apk del .build-deps

## Production stage
FROM node:13.8.0-alpine AS production

WORKDIR /home/node/coaster

COPY --from=development --chown=root:root /home/node/coaster/node_modules ./node_modules

COPY . .

RUN chown -R node:node /home/node/coaster

USER node

RUN apk del .build-deps

CMD npm start
