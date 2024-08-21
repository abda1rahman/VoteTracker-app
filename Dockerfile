FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm install 

# Install nano (and clean up to reduce image size)
RUN apt-get update && \
    apt-get install -y nano && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . . 

EXPOSE 80

CMD ["npm", "run", "start"]

