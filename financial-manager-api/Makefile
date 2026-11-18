.PHONY: up down restart logs db-migrate db-generate test shell build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

db-migrate:
	npx prisma migrate dev

db-generate:
	npx prisma generate

test:
	npm test

shell:
	docker compose exec api sh

build:
	docker compose build
