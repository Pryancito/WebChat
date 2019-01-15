# Wircy
Webchat IRC with serverside websocket support.

# Requierments
- Web server.
- PHP server.
- MySQL server.

# Install
Upload files on a web server.
For ajax features create ajax/config.php file with this content :
	
$dbname = "..."; // Name of database.
$dbhost = "..."; // Host of database.
$dbuser = "..."; // User of database.
$dbpasswd = "..."; // Password of database.
$dbprefix = "..."; // Prefix of MySQL tables name.


Edit start of js/irc.js to give IRC server address as following :

"use strict";

let irc_server_address = 'wss://<address IP or Hostname>:<port>/';

It works !

# Languages
- English
- French
