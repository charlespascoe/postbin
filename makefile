NAME=postbin
VERSION?=0.0.0
CONFIG?=deploy

package:
	# Init build directory
	rm -rf .build/
	mkdir .build/
	# Shrinkwrap modules
	npm shrinkwrap
	mv npm-shrinkwrap.json .build/
	# Build server
	npm run build
	mv .compiled-server/* .build/
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
	echo "#!/bin/bash" > .build/run.sh
	echo 'NODE_PATH = "$$NODE_PATH:$$(pwd)"'
	echo "node server/index.js" >> .build/run.sh
	chmod +x .build/run.sh
	# Create archive
	@FILENAME=$$(echo '$(NAME)-$(VERSION)' | sed -e 's/\./-/g' -e 's/[^a-zA-Z0-9_-]//g'); \
	mv .build/ $$FILENAME/; \
	tar -zcf "$$FILENAME.tar.gz" $$FILENAME/ ; \
	echo "Sucessfully created $$FILENAME.tar.gz package"; \
	rm -rf $$FILENAME/
