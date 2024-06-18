# Usa la imagen oficial de PostgreSQL
FROM postgres:latest

# Configura las variables de entorno para PostgreSQL
ENV POSTGRES_USER=${POSTGRE_USER}
ENV POSTGRES_PASSWORD=${POSTGRE_PASSWORD}
ENV POSTGRES_DB=transcendence

# Copia el script SQL de inicialización en el directorio de inicialización de Docker
COPY ./res/init.sql /docker-entrypoint-initdb.d/

# Exponer el puerto 5432
EXPOSE 5432
