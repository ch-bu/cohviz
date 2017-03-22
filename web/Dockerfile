FROM python:2.7

# Non-executed command of images' author
MAINTAINER Christian Burkhart

# Set environment variable
ENV PYTHONUNBUFFERED 1

# Make new directory
RUN mkdir /code

# Set /code as working directory
# CMD is executed here
WORKDIR /code

ENV HOME /code

# Import Public key for mong
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
RUN echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.4 main" | tee /etc/apt/sources.list.d/mongodb-org-3.4.list

# Install packages
RUN apt-get update -y
RUN apt-get install vim -y
RUN apt-get install python-enchant -y
Run apt-get install mongodb-org -y

# Add python package list to code dir
ADD requirements.txt /code/

# Install python packages
RUN pip install -r requirements.txt

# Add content of local machine directory
# to /code directory
ADD . /code/

# Run migrations
# RUN python /code/manage.py migrate

# Install pygermanet stuff
# RUN mongod --dbpath /code/cohapp/coherenceanalyzer/mongodb &
RUN mongod --dbpath /code/cohapp/coherenceanalyzer/mongodb/ &
RUN python -m pygermanet.mongo_import /code/cohapp/coherenceanalyzer/GN_V90_XML/
