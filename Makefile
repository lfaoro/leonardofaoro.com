.PHONY: all build dev clean run deps install deploy

all: install build

install:
	npm install

dev:
	npm run dev

build:
	npm run build

deploy: build
	@echo "Creating production deployment..."
	@rm -rf dist
	@mkdir -p dist/assets dist/src
	@cp -r assets/* dist/assets/
	@npx terser src/script.js -o dist/src/script.js -c -m
	@cp src/style.css dist/src/style.css
	@npx html-minifier-terser --collapse-whitespace --remove-comments --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes -o dist/index.html index.html
	@npx html-minifier-terser --collapse-whitespace --remove-comments --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes -o dist/404.html 404.html
	@cp manifest.json dist/
	@cp security.txt dist/
	@cp robots.txt dist/
	@cp llms.txt dist/llms.txt
	@cp LICENSE dist/LICENSE
	@cp LICENSE-CONTENT.md dist/LICENSE-CONTENT.md
	@sed -i "s|<lastmod>.*</lastmod>|<lastmod>$$(date +%Y-%m-%d)</lastmod>|" sitemap.xml
	@cp sitemap.xml dist/
	@echo "Production files created in dist/ folder"
	@cd dist/ && npx wrangler pages deploy --project-name=leonardofaoro --commit-dirty=true --branch=production .

clean:
	rm -f src/style.css
	rm -rf node_modules
	rm -rf dist

run: build
	python3 -m http.server 8080

deps:
	@curl -sL "https://unpkg.com/htmx.org@latest/dist/htmx.min.js" -o ./src/htmx.min.js

	help:
	@echo "Available commands:"
	@echo "  make install  - Install npm dependencies"
	@echo "  make dev      - Start development with CSS watching"
	@echo "  make build    - Build production CSS"
	@echo "  make deploy   - Create production-ready dist/ folder and deploy to Cloudflare Pages"
	@echo "  make run      - Start local server on port 8080"
	@echo "  make clean    - Clean build files and dependencies"
	@echo "  make help     - Show this help message"
