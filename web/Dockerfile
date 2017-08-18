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

# Install packages
RUN apt-get update -y
RUN apt-get install vim -y
RUN apt-get install python-enchant -y
RUN apt-get install -y python-pip

# Add python package list to code dir
ADD requirements.txt /code/

# Install python packages
RUN pip install -r requirements.txt

# Add content of local machine directory
# to /code directory
ADD . /code/

