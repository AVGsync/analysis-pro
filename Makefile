include .env
export

.PHONY: build run migrate-create migrate-up

run:
	@cd backend && go build -v ./cmd/apiserver && ./apiserver

deploy:
	@docker compose up -d --build \
	make migrate-up

migrate-create:
	@if [ -z "$(seq)" ]; then \
		echo "Отсутствует необходимый параметр seq. Пример: make migrate-create seq=init"; \
		exit 1; \
	fi; \
	docker compose run --rm postgres-migrate \
	create \
	-ext sql \
	-dir /migrations \
	-seq "$(seq)"

migrate-up:
	@docker compose run --rm postgres-migrate \
	-path /migrations \
	-database "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=disable" \
	up

migrate-down:
	@docker compose run --rm postgres-migrate \
	-path /migrations \
	-database "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=disable" \
	down

swagger-gen:
	@docker compose run --rm swagger \
		init \
		-g cmd/apiserver/main.go \
		-o docs \
		--parseInternal \
		--parseDependency

.DEFAULT_GOAL := run