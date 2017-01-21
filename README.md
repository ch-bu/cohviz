# Docker webapp

This is a docker-compose project that I use for my web applications. It runs [nginx](https://www.nginx.com/resources/wiki/), [gunicorn](http://gunicorn.org/), [django](https://www.djangoproject.com/) and [postgres](https://www.postgresql.org/). 

# How to run locally

Clone the repository to your machine. You should have [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/) installed. Make sure that you have ownership of all files:

```
sudo chown -R $USER:$USER .
```

Afterwards, fire up the application:

```
docker-compose up
```

Your application should be running on `localhost:8080`. 

In order to stop the application run

```
docker-compose stop
```
