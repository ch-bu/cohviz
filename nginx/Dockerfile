FROM tutum/nginx
RUN rm /etc/nginx/sites-enabled/default
ADD sites-enabled/ /etc/nginx/sites-enabled

RUN apt-get update -y
RUN apt-get install vim -y