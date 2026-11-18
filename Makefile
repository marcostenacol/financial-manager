.PHONY: up down restart api-up api-down ui-up ui-down logs-api logs-ui

up:
	@make api-up
	@make ui-up

down:
	@make api-down
	@make ui-down

restart:
	@make api-down
	@make api-up
	@make ui-down
	@make ui-up

api-up:
	$(MAKE) -C financial-manager-api up

api-down:
	$(MAKE) -C financial-manager-api down

ui-up:
	$(MAKE) -C financial-manager-ui up

ui-down:
	$(MAKE) -C financial-manager-ui down

logs-api:
	$(MAKE) -C financial-manager-api logs

logs-ui:
	$(MAKE) -C financial-manager-ui logs
