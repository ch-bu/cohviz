# Docker webapp

Docker webapp is a docker image that uses Django and [Postgres](https://www.postgresql.org/). 

# How to run locally

Clone the repository to your machine. You should have [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/) installed. Make sure that you have ownership of all files:

```
sudo chown -R $USER:$USER .
```

Afterwards, fire up the application with `docker-compose up`. Your application should be running on `localhost:8000`. 
