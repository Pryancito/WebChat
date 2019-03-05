# Wircy
Webchat IRC with server-side websocket HTML5 support.

# Requierments
- Web server.
- PHP server. (Optional, for URL summaries)
- MySQL server. (Optional, for URL summaries)

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

# Compatibilty

Works with UnrealIRCd : https://www.unrealircd.org/docs/WebSocket_support

## Browser compatibility
- Google chrome
- Firefox
- Opera
- Edge
- Safari (Maybe)

Make sure your browser is up to date.

## Some lights bugs to resolve
- Chanlist and userlist resize don't work on Firefox.
- Instability of copy to clipboard on text selection.

# To test the client
https://www.epiknet.org/wircy/
