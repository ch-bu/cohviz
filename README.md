# Cohviz

A dockerized web app that visualizes the cohesive structure of a text.

# How to run locally

Clone the repository to your machine. You should have [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/) installed. Make sure that you have ownership of all files:

```
sudo chown -R $USER:$USER .
```

Afterwards, fire up the application:

```
docker-compose up
```

Migrate django models:

```
docker exec -it cohviz_web_1 /bin/bash
python manage.py migrate
```

Make sure you got the [Germanet files](http://www.sfs.uni-tuebingen.de/GermaNet/) and installed it put it in `/code/cohapp/coherenceanalyzer/GN_V90_XML/`. 

Setup mongo database: 

```
docker exec -it cohviz_web_1 /bin/bash
mongod --dbpath /cohapp/coherenceanalyzer/mongodb/ &
python -m pygermanet.mongo_import /code/cohapp/coherenceanalyzer/GN_V90_XML/
```

Download the nltk dataset inside your docker web container: 

```
import nltk
nltk.download()
```

Your application should be running on `localhost:8080`. 

In order to stop the application run

```
docker-compose stop
```
