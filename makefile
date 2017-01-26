DOCKER_REPO=postbin
TAG?=latest
VERSION?=$(TAG)

build-production:
	npm run build-production

docker: build-production
	rm -rf docker-build/
	mkdir docker-build/
	mv .compiled-server/* docker-build/
	# Shrinkwrap NPM modules
	npm shrinkwrap
	mv npm-shrinkwrap.json docker-build/
	docker build --build-arg VERSION=$(VERSION) -t '$(DOCKER_REPO):$(TAG)' .
	rm -rf docker-build/

export-docker:
	@FILENAME=$$(echo '$(DOCKER_REPO)-$(TAG)' | sed -e 's/\./-/g' -e 's/[^a-zA-Z0-9_-]//g'); \
	echo "Exporting $(DOCKER_REPO):$(TAG) to $$FILENAME.tar.gz, please wait..."; \
	docker save '$(DOCKER_REPO):$(TAG)' | gzip > "$$FILENAME.tar.gz"
