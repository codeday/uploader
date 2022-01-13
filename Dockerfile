FROM node:16-alpine

RUN mkdir /app
WORKDIR /app
ENV NODE_ENV=production
COPY package.json /app
COPY yarn.lock /app
RUN yarn install

COPY src /app/src
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
CMD /docker-entrypoint.sh
