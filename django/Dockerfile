FROM python:3.10

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFER 1

COPY . .

RUN pip install --upgrade pip && \
	pip install -r /usr/src/app/tools/requirements.txt
	
CMD ["/usr/src/app/tools/entrypoint.sh"]


