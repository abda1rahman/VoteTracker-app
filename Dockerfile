FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . . 

EXPOSE 1337

CMD ["npm", "run", "start"]

