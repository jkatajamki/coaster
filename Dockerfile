FROM node:13:8.0-alpine

RUN apk add --no-cache git

WORKDIR /home/node/coaster

ENV NODE_ENV=production
ENV PM2_INSTANCES=0

COPY ./ /home/node/coaster

RUN chown -R node:node /home/node && \
  npm install --production && npm rebuild && \
  chown node:node /home/node/coaster -R

USER node

EXPOSE 8080
CMD npm start
