# Development stage
FROM node:13.8.0-alpine AS development

RUN mkdir /home/node/coaster && chown node:node /home/node/coaster

USER node

WORKDIR /home/node/coaster

COPY --chown=node:node package.json package-lock.json ./

RUN npm install --quiet

## Production stage
FROM node:13.8.0-alpine AS production

WORKDIR /home/node/coaster

COPY --from=development --chown=root:root /home/node/coaster/node_modules ./node_modules

COPY . .

RUN chown -R node:node /home/node/coaster

USER node

CMD npm start
