all: build up

up :
	docker compose -f docker-compose.yml up

build:
	docker compose -f docker-compose.yml build

down:
	docker compose -f docker-compose.yml down -v

clean: down
	docker volume prune -f
	docker system prune -af

.PHONY: all build up down clean