FROM python:3.10

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFER 1

COPY . .

RUN pip install --upgrade pip && \
	pip install -r /usr/src/app/dockerTools/requirements.txt
	
CMD ["/usr/src/app/dockerTools/entrypoint.sh"]


