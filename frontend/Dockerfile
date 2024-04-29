## frontend/Dockerfile

FROM node:20.12 as build

WORKDIR /app/frontend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build 

# Switch to apache httpd image
FROM httpd:2.4

# Enable Apache rewrite (mod_rewrite) module
RUN sed -i '/LoadModule rewrite_module/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's#AllowOverride [Nn]one#AllowOverride All#' /usr/local/apache2/conf/httpd.conf

COPY --from=build /app/frontend/dist/ /usr/local/apache2/htdocs/

# Apache per-directory basis configuration
COPY --from=build /app/frontend/deployment/apache/.htaccess /usr/local/apache2/htdocs/.htaccess
