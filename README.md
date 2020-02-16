# Wircy
IRC client with server-side websocket HTML5 support.

# Requierments
- Web server.
- PHP server. (Optional, for URL summaries)
- MySQL server. (Optional, for URL summaries)

# Install

## Edit start of *js/irc.js* to give IRC server address and define URL summaries engine as following :

```
// -------------------------- START OF CONFIG -------------------------- \\

let irc_server_address = 'wss://<IP address or hostname>:<port>/';

let urlify_check = true; // Or false to disable.

// --------------------------- END OF CONFIG --------------------------- \\
```

## Optional : for URL summaries (if urlify_check === true) edit *ajax/config.php* :

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

Works with UnrealIRCd 4.x and later server : https://www.unrealircd.org/docs/WebSocket_support

## Browser compatibility
- Google chrome
- Firefox
- Opera
- Edge
- Safari (Maybe)

Make sure your browser is up to date.

## Some lights bugs/imperfections to resolve
- Instability of copy to clipboard on text selection.
- URL summaries to improve.
- To do responsive design.
- Manage all IRC protocol. /raw sends a raw request to IRC server, raws callbacks is in javascript console of your browser.

# To test the client
https://susoft.fr/wircy/
