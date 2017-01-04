FROM python:3-onbuild

Run \
	apt-get update && \
	apt-get -y upgrade && \
	apt-get install -y nginx && \
	pip install -r requirements.txt

RUN useradd -md /bin/bash christian
USER christian
WORKDIR /home/christian

#ADD home/christian/.bash_aliases /home/christian/.bash_aliases

EXPOSE 5000

#ENTRYPOINT /bin/bash
#CMD [ "bash"]

