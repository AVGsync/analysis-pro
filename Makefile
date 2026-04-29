include .env
export

.PHONY: build run migrate-create migrate-up

run:
	@cd backend && go build -v ./cmd/apiserver && ./apiserver

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

.DEFAULT_GOAL := run