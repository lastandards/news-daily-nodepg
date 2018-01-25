FROM ubuntu:16.04
ENV LANG C.UTF-8
RUN apt-get update && apt install -y wget && wget -O- https://deb.nodesource.com/setup_8.x | bash - && apt-get remove curl && apt update && apt-get install -y nodejs && node -v && npm -v
COPY . /var/www/nodeserver
CMD cd /var/www/nodeserver && npm install -d && npm run start && bash