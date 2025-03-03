# Clog

**Clog (Compact Electronic Logbook System)** is a web-based logbook system aimed to be used in accelerators. The goal is to design and implement a logbook system with modern web technology but in a very simple way.  

## Significant change

* From v2.1.0, attachment storage is moved from MongoDB to file system due to 16MB limitation and performance issue
* The attachment directory is `/srv/clog2`
* The attachment directory is migrated to `/srv/clog2/attachments`

## Features

* **Compact**: lightweight architecture with separate frontend and backend; high-efficiency frontend and backend framework; single programming language (JavaScript) finishing full-stack web development.
* **Multiple Login Method**: prior to deployment, the login method can be configured as local database, LDAP or OAuth.
* **Multiple Language**: currently English and Chinese languages are supported, other languages can also be added in future.

## Software environment

* PrimeVue: 3.26.1
* Vue.js: 3.2.47
* Node.js: 16.19.0
* MongoDB: 6.0.3

![Alt text](docs/screenshots/software_environment.png?raw=true "Title")

## Design

### Architecture

![Alt text](docs/screenshots/architecture.png?raw=true "Title")

### Block diagram

![Alt text](docs/screenshots/block_diagram.png?raw=true "Title")

### Schema

![Alt text](docs/screenshots/schema.png?raw=true "Title")

### Multi-language

English version

![Alt text](docs/screenshots/english.png?raw=true "Title")

Chinese version

![Alt text](docs/screenshots/chinese.png?raw=true "Title")

## Screenshots

### User login page

Login page for local database authentication

![Alt text](docs/screenshots/login_local.png?raw=true "Title")

Login page for LDAP authentication

![Alt text](docs/screenshots/login_ldap.png?raw=true "Title")

Login page for CSNS OAuth2 authentication

![Alt text](docs/screenshots/login_oauth.png?raw=true "Title")

### Home page

![Alt text](docs/screenshots/home.png?raw=true "Title")

### Logbook management page

![Alt text](docs/screenshots/logbook_management.png?raw=true "Title")

### User management page

![Alt text](docs/screenshots/user_management.png?raw=true "Title")

### Log preview page

![Alt text](docs/screenshots/log_preview.png?raw=true "Title")

### Log detail page

![Alt text](docs/screenshots/log_detail.png?raw=true "Title")

### Log create page

![Alt text](docs/screenshots/log_create.png?raw=true "Title")

### Log edit page

![Alt text](docs/screenshots/log_edit.png?raw=true "Title")

### Attachment viewing page

![Alt text](docs/screenshots/attachment_viewing.png?raw=true "Title")

### Rich-text editor

![Alt text](docs/screenshots/rich_text.png?raw=true "Title")

### Rich-text display

![Alt text](docs/screenshots/rich_text_display.png?raw=true "Title")

### Template management

![Alt text](docs/screenshots/template_management.png?raw=true "Title")

### Template import

![Alt text](docs/screenshots/template_import.png?raw=true "Title")

### Log reply

![Alt text](docs/screenshots/log_reply.png?raw=true "Title")

## API token

### Generate API token

![Alt text](docs/screenshots/API_token.png?raw=true "Title")

![Alt text](docs/screenshots/generate_token.png?raw=true "Title")

### Use the API token to create logs using Postman

![Alt text](docs/screenshots/http_request.png?raw=true "Title")

![Alt text](docs/screenshots/authorization.png?raw=true "Title")

![Alt text](docs/screenshots/post.png?raw=true "Title")

### Use the API token to create logs using Python

The `append=true` query parameter will append the text to the end of a log instead of creating a new one if the log with the title exists.

```python
import requests

headers = {
        'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWNjLW1zIiwiZW1haWwiOiJjc25zLWFjY29AaWhlcC5hYy5jbiIsImFkbWluIjpmYWxzZSwiaWF0IjoxNjgyMDQ1OTk5LCJleHAiOjE2ODIwOTI4MDN9.AgXSTsVgVp2ifbvpY_bI3Nu15h4Tj5HFuwv1v7G8pP8'
        }

data={
        'log':'{"logbook":"6423a38977784806a220b058","category":"Info","title":"API test","description":"send from python"}'
        }

response = requests.post('http://10.1.236.131:3000/api/logs?append=true',
        headers=headers, data=data)

print(response.text)
```

## Project structure

* Frontend: provides web pages using Vue.js
* Backend: provides a REST API using Node.js

## Project setup

### Configuration

Edit the following files if needed.
```
frondend/src/config/configuraion.js
backend/config/frontend.js
backend/config/login.js
backend/config/ldap.js
backend/config/smtp.js
```

### Database import

Go to docs directory
```
cd docs
mongorestore --db clog2 database
```

### Compiles and hot-reloads for development

Go to frontend directory
```
cd frontend
npm install
npm run dev
```

Go to backend directory
```
cd backend
npm install
npm run dev
```

### Deploy for production

Go to frontend directory
```
cd frontend
npm ci
npm run build
cp -r dist/* /var/www/html
```

Go to backend directory
```
cd backend
npm ci
pm2 start server.js
```

### Apache http configuration

* Enable Apache Rewrite (mod_rewrite) Module
* Copy frontend/deployment/apache/.htaccess to /var/www/html or /usr/local/apache2/htdocs/

### Visit web pages

```
http://localhost:8080/
```

Test users in the database are as follows:
```
username: admin    password: 1    admin: true
username: user1    password: 1    admin: false
username: user2    password: 1    admin: false
```

## Deployment with Docker

One compose.yaml and two Dockerfiles (one for frontend and one for backend) are provided to create the following three containers,

* frontend: Vue.js web pages
* backend: Node.js REST API
* database: MongoDB with sample data

Prior to building images and running containers, the values of `serverPath` in `frontend/src/config/configuration` and `url` in `backend/config/database.js` need to be consistent with the host IP address, because `localhost` or `127.0.0.1` of the host is not accessible from inside containers by default.

The following commands can be used to build images and run containers,

```
docker compose build --no-cache
docker compose up
```

If building and running succeed, the following page can be accessed,

```
http://ip_address:8080/
```

Docker deployment has been tested in the following environment,

* Debian 10 Linux
* Docker version 26.1.0
