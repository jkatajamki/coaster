all: local-up

local-up:
	docker-compose up -d
	npm i
	npm run dev
