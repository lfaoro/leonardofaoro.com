include .env
.PHONY: all purge deploy

all: purge

deploy:
	npx wrangler pages deploy --project-name=leonardofaoro --commit-dirty=true --branch=production .

purge: deploy
	curl -X POST "https://api.cloudflare.com/client/v4/zones/$(CF_ZONE)/purge_cache" \
	 -H "Authorization: Bearer $(CLOUDFLARE_API_KEY)" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'

run:
	python3 -m http.server 8080

deps:
	@curl -sL "https://unpkg.com/htmx.org@latest/dist/htmx.min.js" -o ./src/htmx.min.js
	@curl -sL "https://unpkg.com/hyperscript.org@latest/dist/_hyperscript.min.js" -o ./src/hyperscript.min.js
