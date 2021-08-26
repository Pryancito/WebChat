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

## ```Optional``` : for URL summaries (if urlify_check === true) edit *ajax/config.php* :

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

## IRC Daemons
- Works with UnrealIRCd 4.x and later versions : https://www.unrealircd.org/docs/WebSocket_support
- Works with InspIRCd 3.x and later versions : https://docs.inspircd.org/3/modules/websocket/

## Browser compatibility
- Google chrome
- Firefox
- Opera
- Edge
- Safari (Maybe)

Make sure your browser is up to date.

## Some lights bugs/imperfections to resolve
- URL summaries to improve.
- To do responsive design.
- Manage all IRC protocol. /raw sends a raw request to IRC server.

Note : IRC raws not supported are in Javascript console of your web browser.

## To test Wircy with UnrealIRCd server
https://susoft.fr/wircy/
