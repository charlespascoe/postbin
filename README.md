Postbin
=======

A simple file/text storage server, designed primarily to be used via cURL/wget.

cURl comes bundled with most Linux distrobutions, so postbin can be used directly from the terminal on new Linux installs (for copying SSH keys etc.)

Usage
=====

Uses HTTP basic auth for authentication - the `-u` option on cURL will prompt for a password and append the `Authorization` header. See 'Setting Up the Server' for details on users.

Upload text:

`$ curl https://postbin.yourhost.com/bin -u username -d 'Your text here'`

Upload a file:

`$ curl https://postbin.yourhost.com/bin -u username --data-binary @path/to/file`

Both of the above will generate a random ID (like `c68d-92a3`); for a custom ID, append it to the URL:

`$ curl https://postbin.yourhost.com/bin/custom-id -u username --data-binary @path/to/file`

Getting text/a file and writing it to a file:

`$ curl https://postbin.yourhost.com/bin/id-here -u username -o path/to/output`

Omit `-o` option to print to standard out.

Delete text/a file:

`$ curl https://postbin.yourhost.com/bin/id-here -u username -X DELETE -o path/to/output`
Note that when you delete a file, its contents are returned.

Listing all files:

`$ curl https://postbin.yourhost.com/bin -u username`

Server Stats:

`$ curl https://postbin.yourhost.com/stats -u username`

About the server (version etc.):

`$ curl https://postbin.yourhost.com/about -u username`

Single-Use Tokens
-----------------

Single use tokens are authentication tokens which can only be used once. They are useful when sharing files with other people or from machines you don't trust.

Create a token:

`$ curl https://postbin.yourhost.com/token -u username`

The token will be 8 hex characters separated by a dash, e.g. `cd97-1d0f`. Tokens only last 5 minutes, and cannot be used to create more tokens.

To make a read-only token (i.e. one that can't be used to upload files):

`$ curl https://postbin.yourhost.com/token?readonly=true -u username`

To use a token, either use the `Authorization` header using `Bearer`, or via basic auth using the dummy `token` user:

```
$ curl https://postbin.yourhost.com/bin -H 'Authorization: Bearer cd97-1d0f'`
OR
$ curl https://postbin.yourhost.com/bin -u token
```

Setting Up
==========

Users and Authentication
------------------------

Users and hashed passwords are stored in Apache's `htpasswd` format - please see [Apache's documentation](https://httpd.apache.org/docs/current/programs/htpasswd.html) for more information on how to create a `htpasswd` file.

Configuration
-------------

Configuration is stored in a JSON file, similar to this:

```
{
  "auth": "/path/to/htpasswd", // This is for development ONLY
  "dataDir": "/path/to/data/directory/", // This is for development ONLY
  "xForwardedFor": true, // If false, the server will ignore the 'X-Forwarded-For' header when getting the IP address
  "protocol": "https", // The protocol (http or https) that is being used by on the server
  "host": "postbin.yourhost.com" // The host of the server that postbin is running on
}
```

Docker Setup
------------

Recommended setup using docker.

Making the image:

`$ make docker TAG=1.2.3`

Exporting the image as a `.tar.gz`:

`$ make export-docker TAG=1.2.3`
*Note: you may need to run this using sudo*

Upload to server, then on the server:

`$ gzip -kcd postbin-1-2-3.tar.gz | docker load`

*Note: Again, docker load may need to be run using sudo*

To simplify creating a docker container, you can upload the `docker-run.sh` script which will guide you through the process.

Alternative Setup
-----------------

Create a file called `deploy.json` in the `config/` directory, and add the appropriate configuration. Then run:

`$ make alternative VERSION=1.2.3`

This creates a file called `postbin-1-2-3.tar.gz`. Upload to the server, unzip, and create the `htpasswd` file and put it in the right place (see Configuration)

Use `./run.sh` to run the server, ideally using [PM2](https://github.com/Unitech/pm2).

Development
===========

Create a file called `development.json` in the `config/` directory, and set the appropriate configuration for your machine (`"http"` and `"localhost:8080"` will do for the protocol and host, respectively).

Running the server:

`$ npm start`
