NAME=postbin
DOCKER_REPO?=$(NAME)
TAG?=latest
VERSION?=$(TAG)
CONFIG?=deploy

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

alternative:
	# Init build directory
	rm -rf .build/
	mkdir .build/
	# Shrinkwrap modules
	npm shrinkwrap
	mv npm-shrinkwrap.json .build/
	# Build server
	npm run build-production
	mv .compiled-server/server/ .build/
	# Copy config
	cp config/$(CONFIG).json .build/server/configuration.json
	# Temporarily move development modules
	mv node_modules/ node_modules_bak/
	# Install production modules
	cd .build/; \
	npm install
	mv node_modules/ .build/
	# Restore development modules
	mv node_modules_bak/ node_modules/
	# Create run script
	echo '#!/bin/bash' > .build/run.sh
	echo 'VERSION="$(VERSION) && NODE_PATH="$$(pwd):$$NODE_PATH" && node server/index.js' >> .build/run.sh
	chmod +x .build/run.sh
	# Create archive
	@FILENAME=$$(echo '$(NAME)-$(VERSION)' | sed -e 's/\./-/g' -e 's/[^a-zA-Z0-9_-]//g'); \
	mv .build/ $$FILENAME/; \
	tar -zcf "$$FILENAME.tar.gz" $$FILENAME/ ; \
	echo "Sucessfully created $$FILENAME.tar.gz package"; \
	rm -rf $$FILENAME/
