FROM	nginx:1.27.0-alpine3.19-perl

EXPOSE 5050

COPY ./conf/transcendence.conf /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]
