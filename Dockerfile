FROM node:14

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY . ./

RUN yarn install


CMD ["yarn", "start"]
