# Wircy
Webchat IRC with server-side websocket HTML5 support.

# Requierments
- Web server.
- PHP server. (Optional, for urlify)
- MySQL server. (Optional, for urlify)

# Install

## Edit start of *js/irc.js* to give IRC server address and define URL summaries engine as following :

```
"use strict";

let irc_server_address = 'wss://<IP address or hostname>:<port>/';

let urlify_check = true; // Or false to disable.
```

## For URL summaries (if urlify_check === true) edit *ajax/config.php* :

Create MySQL database on localhost or elsewhere, the MySQL table is created automatically from PHP script *ajax/summary.php*, and then edit (or create) *ajax/config.php* as following :

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
