# Wircy
Webchat IRC with serverside websocket support.

# Requierments
- Web server.
- PHP server.
- MySQL server.

# Install

## Edit start of *js/irc.js* to give IRC server address and define URL summaries engine as following :

```
"use strict";

let irc_server_address = 'wss://<IP address or hostname:<port>/';

let urlify_check = true; // Or false to disable.
```

## For URL summaries (if urlify_check == true) edit *ajax/config.php* :

Create MySQL database on localhost or elsewhere, the MySQL table is created automaticly.

```
<?php
$dbname = "..."; // Name of database.
$dbhost = "..."; // Host of database.
$dbuser = "..."; // User of database.
$dbpasswd = "..."; // Password of database.
$dbprefix = "..."; // Prefix of MySQL table name.
```

## Upload files on a web server.
It works !

# Languages
- English
- French

# To test the client
https://www.epiknet.org/wircy/
