## backend/Dockerfile

FROM node:20.12

WORKDIR /app/backend

COPY package*.json ./

RUN npm ci

COPY . . 

# Create directory for attachments
RUN mkdir -p /srv/clog2

CMD [ "npm", "start" ]


