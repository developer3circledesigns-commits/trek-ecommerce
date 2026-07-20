FROM nginx:alpine
COPY public/trek /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
