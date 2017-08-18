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
python manage.py makemigrations
python manage.py migrate
```

Install spacy language models:

```
docker exec -it cohviz_web_1 /bin/bash
python -m spacy download en_core_web_md
python -m spacy download de_core_news_md
```

Collectstatic files

```
docker exec -it cohviz_web_1 /bin/bash
npm install
gulp sass
gulp webpack
python manage.py collectstatic
```

Your application should be running on `localhost:8084`. 

In order to stop the application run

```
docker-compose stop
```
