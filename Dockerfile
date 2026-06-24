FROM node:latest

WORKDIR /home/test

RUN apt-get update && apt-get install -y --fix-missing default-jre && rm -rf /var/lib/apt/lists/*

COPY . /home/test/

RUN npm install

CMD ["npm", "run", "test:report"]