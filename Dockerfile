FROM node:18-bullseye

WORKDIR /app

COPY . .

RUN npm install

CMD [ "node","app.js" ]