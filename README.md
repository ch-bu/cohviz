# Cohviz

A dockerized web app that visualizes the cohesive structure of a text.

## How to run locally

Clone the repository to your machine. You should have [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/) installed. Make sure that you have ownership of all files:

```
sudo chown -R $USER:$USER .
```

Make sure you got the [Germanet files](http://www.sfs.uni-tuebingen.de/GermaNet/) and installed it put it in `/code/cohapp/coherenceanalyzer/GN_V90_XML/`. 


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

Download the nltk dataset inside your docker web container: 

```
docker exec -it cohviz_web_1 /bin/bash
import nltk
nltk.download()
```

Setup django super user

```
python manage.py createsuperuser
```

Run the mongo dp instance

```
docker exec -it cohviz_web_1 /bin/bash
cd /code/cohapp/coherenceanalyzer/
mongod --dbpath ./mongod &
```

Your application should be running on `localhost:8084`. 

In order to stop the application run

```
docker-compose stop
```


## License

This project is licensed under the MIT License - see the [license.txt](license.txt) file for details
