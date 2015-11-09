.PHONY: build

install:
	@npm install

build:
	@rm -rf dist
	@./node_modules/.bin/webpack -p --progress --colors --devtool source-map

run:
	@echo "**************************************************"
	@echo "* open http://localhost:8080/webpack-dev-server/ *"
	@echo "**************************************************"
	@./node_modules/.bin/webpack-dev-server --progress --debug --colors --devtool eval --hot --inline
