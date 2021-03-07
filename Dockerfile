FROM node:alpine

WORKDIR /var/app

COPY ./package.json ./

RUN npm install

COPY . .

EXPOSE 1234

CMD ["npm","start"]