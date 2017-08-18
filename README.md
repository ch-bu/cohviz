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

Collectstatic files

```
docker exec -it cohviz_web_1 /bin/bash
python manage.py collectstatic
```

Install spacy models:

```
docker exec -it cohviz_web_1 /bin/bash
pip install -U spacy
python -m spacy download en_core_web_sm
python -m spacy download de_core_news_md
```

Setup django super user

```
python manage.py createsuperuser
```

Your application should be running on `localhost:8084`. 

In order to stop the application run

```
docker-compose stop
```
