FROM node:20

# Install Bash
# RUN apt-get update && apt-get install -y bash

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . . 

EXPOSE 1337

CMD ["npm", "run", "dev"]

