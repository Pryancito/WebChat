"use strict";

let irc_server_address = 'wss://roubaix.fr.epiknet.org:6680/';

let urlify_check = true;

let nickname = getParameterByName('nickname');

let nspasswd = JSON.parse(getCookie('nspasswd'));

let chans_from_url = getParameterByName('channels');

let nicks_join = new Object();

let topicByCommand = false;

let autojoins_check = false;


if (typeof nickname == null) {
	let nickname = 'WircyUser_' + Math.floor((Math.random() * 1000) + 1).toString();
}

let activeChannel,
	active,
	activeType,
	activeQuery,
	ACStriped,
	status = true,
	output,
	websocket,
	me,
	myhost,
	uls = {},
	uls_no_mode = {},
	list = {},
	ban = [],
	idmsg = -1,
	ignore_cmd = false,
	ignores = getCookie('ignores'),
	aj = false;

function init() {
	output = document.getElementById('status');
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/*
function escapeHtml(text) {
	let map = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
*/
// Use the browser's built-in functionality to quickly and safely escape
// the string
function escapeHtml(str) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function ht(msg) {
	
	msg = msg.split(' ');
	
	let chanht = [];
	
	msg.forEach(function(word, index) {
		
		if (word[0] === '#') {
			
			let chansp = word.substring(1);
			
			chanht.push( 'ht_' + chansp );
			
			msg[index] = '<span id="ht_' + chansp + '" class="hashtag">' + word + '</span>'
		}
	});
	
	return [ chanht, msg.join(' ') ];
}

function getParameterByName(name, url) {
	
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// UNSAFE with unsafe strings; only use on previously-escaped ones!
function unescapeHtml(escapedStr) {
    var div = document.createElement('div');
    div.innerHTML = escapedStr;
    var child = div.childNodes[0];
    return child ? child.nodeValue : '';
}

function connectWebSocket() {
	
	websocket = new WebSocket(irc_server_address);
	websocket.binaryType = 'arraybuffer';
	
	websocket.onopen = function(evt) { onOpen(evt) };
	websocket.onclose = function(evt) { onClose(evt) };
	websocket.onmessage = function(evt) { onMessage(evt) };
	websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
	
	doSend('user websocket * * :WebSocket User');
	doSend('nick ' + nickname);
}

function onClose(evt) {
	writeToScreen('DISCONNECTED');
}

function onMessage(evt) {
	
	let rawData = evt.data;
	
	if (rawData instanceof Blob) {
		let fileReader = new FileReader();
		fileReader.addEventListener('loadend', handleBinaryInput);
		fileReader.readAsText(rawData);
	}
	else {
		process(rawData);
	}
}

function handleBinaryInput(event) {
	
	let fileReader = event.target;
	let raw = fileReader.result;
	process(raw);
}

function autojoins() {
	
	if (autojoins_check === false) {
		
		autojoins_check = true;
	
		if (chans_from_url == null) {
		
			let list = getCookie('favlist');
			
			list = list.split(',');
			
			if (list.length == 1 && list[0] == '') {
				
				setTimeout(function(){ doSend('join ' + default_chan); }, 100);
			}

			aj = list.length;
			
			list.sort();
			
			list.forEach(function(item, index) {
				
				setTimeout( doSend.bind(null, 'join ' + item), index * 100 );
			});
		}
		else if (chans_from_url !== null) {
			
			chans_from_url = chans_from_url.split(',');
			
			chans_from_url.sort();
			
			chans_from_url.forEach(function(item, index) {
				
				setTimeout( doSend.bind(null, 'join ' + item), index * 100 );
			});
		}
	}
}

function ignores_list() {
	
	if (ignores !== '') {
		
		let i = JSON.parse(ignores);
	
		let list = document.getElementById('ab_ignore_masks');
		
		Object.keys(i).forEach(function(key) {
				
			i[key].forEach(function(item) {
				
				let type_mask = item.split(')');
				
				let type = type_mask[0];
				
				let mask = type_mask[1];
				
				list.innerHTML += '<p class="linei"><span class="nicki">' + key + '</span> (<span class="typei">' + type + '</span>) <span class="maski">' + mask + '</span><i id="di_' + key + '_' + type + '_' + mask + '" class="fa fa-times close di_close" aria-hidden="true"></i></p>';
				
				document.getElementById('di_' + key + '_' + type + '_' + mask).onclick = function() {
					
					let find = i[key].indexOf(type + ')' + mask);
					
					if (index !== -1) {
						
						i[key].splice(index, 1);
						this.remove();
					}
				}
			});
		});
	}
}

function ignores_check(mask, type) {
	
	return true; // A changer
	
	if (mask.indexOf('!') !== -1 && mask.indexOf('@') !== -1) {
	
		let nick_un = mask.split('!');
		
		let nick = nick_un[0];
		
		let un_host = nick_un[1].split('@');
		
		let username = un_host[0];
		
		let host = un_host[1];
		
		let imasks = Array.from(document.getElementsByClassName('maski'));
		
		imasks.forEach(function(m) {
			
			let itype_mask = m.split(')');
			
			let itype = itype_mask[0];
			
			let inick_un = itype[1].split('!');
			
			let inick = inick_un[0];
			
			let iun_host = inick_un[1].split('@');
			
			let iusername = iun_host[0];
			
			let ihost = iun_host[1];
			
			if (type.indexOf(itype) !== -1 && (inick === nick || iusername === username || ihost === host)) {
				
				return false;
			}
		});
		
		return true;
	}
}

function ignore_add_from_umenu(rawp) {
	
	ignore_cmd = false;
	
	let nick = rawp[2].split('=')[0];
	let host = rawp[2].split('@')[1].trim();
	
	if (ignores === '') {
		
		let obj = new Object();
		
		let val = new Array();
		
		val.push('a)*!*@' + host);
		
		obj[nick] = val;
		
		setCookie('ignores', JSON.stringify(obj), 10000000);
	}
	else {
		
		let obj = JSON.parse(ignores);
		
		if (typeof obj[nick] === 'undefined') {
			
			obj[nick] = [ 'a)*!*@' + host ];
		}
		else {
			if (obj[nick].indexOf(host) === -1) {
				
				obj[nick].push('a)*!*@' + host);
			}
		}
		setCookie('ignores', JSON.stringify(obj), 10000000);
	}
	
	document.getElementById('ab_ignore_masks').innerHTML += '<p class="linei"><span class="nicki">' + nick + '</span> (<span class="typei">a</span>) <span class="maski">' + '*!*@' + host + '</span><i id="di_' + nick + '_a_' + '*!*@' + host + '" class="fa fa-times close di_close" aria-hidden="true"></i></p>';		
	ignores = getCookie('ignores');
}

var is_utf8 = function(bytes)
{
    var i = 0;
    while(i < bytes.length)
    {
        if(     (// ASCII
                    bytes[i] <= 0x7F
                )
          ) {
              i += 1;
              continue;
          }

        if(     (// non-overlong 2-byte
                    (0xC2 <= bytes[i] && bytes[i] <= 0xDF) &&
                    (0x80 <= bytes[i+1] && bytes[i+1] <= 0xBF)
                )
          ) {
              i += 2;
              continue;
          }

        if(     (// excluding overlongs
                    bytes[i] == 0xE0 &&
                    (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                    (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
                ) ||
                (// straight 3-byte
                 ((0xE1 <= bytes[i] && bytes[i] <= 0xEC) ||
                  bytes[i] == 0xEE ||
                  bytes[i] == 0xEF) &&
                 (0x80 <= bytes[i + 1] && bytes[i+1] <= 0xBF) &&
                 (0x80 <= bytes[i+2] && bytes[i+2] <= 0xBF)
                ) ||
                (// excluding surrogates
                 bytes[i] == 0xED &&
                 (0x80 <= bytes[i+1] && bytes[i+1] <= 0x9F) &&
                 (0x80 <= bytes[i+2] && bytes[i+2] <= 0xBF)
                )
          ) {
              i += 3;
              continue;
          }

        if(     (// planes 1-3
                    bytes[i] == 0xF0 &&
                    (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                    (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                    (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
                ) ||
                (// planes 4-15
                 (0xF1 <= bytes[i] && bytes[i] <= 0xF3) &&
                 (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                 (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                 (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
                ) ||
                (// plane 16
                 bytes[i] == 0xF4 &&
                 (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) &&
                 (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                 (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
                )
          ) {
              i += 4;
              continue;
          }

        return false;
    }

    return true;
}

function process(rawData) {
	
	let raw;
	
	if (is_utf8(new Uint8Array(rawData)) === false) {
		raw = (new TextDecoder('iso-8859-15')).decode(rawData);
	}
	else {
		raw = (new TextDecoder()).decode(rawData);
	}
	
	let rawp = raw.split(':');
	let rawsp = raw.split(' ');
	
	if (rawsp[0] === 'PING') {
		
		let pongResponse = raw.replace("PING","PONG");
		//writeToScreen('<span style="color: brown;">SENDING: ' + escapeHtml(pongResponse)+'<\/span>');
		websocket.send(pongResponse);
	}
	else if (rawsp[1] === '001') {
		
		//doSend("join " + activeChannel); // join a room upon connection.
		//doSend("mode " + activeChannel);
		
		if (nspasswd[0] === nickname && nspasswd[1] !== '') { // Perform for nickserv pass
			doSend('ns identify ' + nspasswd[1]);
		}
		else {
			autojoins();
		}
		
		Array.from(document.getElementsByClassName('window')).forEach( closeAllWindows );
		
		let s = document.createElement('p');
		s.setAttribute('class', 'btn_window');
		s.setAttribute('id', 'btn_status');
		
		s.innerHTML = '<i class="fa fa-window-maximize" aria-hidden="true"></i>' + lang_status;
		insertAfter(s, document.getElementById('border-left'));
	}
	
	//-> hitchcock.freenode.net USERHOST xcombelle
	//<- :hitchcock.freenode.net 302 Kitu :xcombelle=+~xcombelle@eglide.org
	
	//add ignore :
	else if (rawsp[1] == '302' && ignore_cmd === true) {
		
		ignore_add_from_umenu(rawp);
		
	}
	
	else if (rawsp[1] == '352') {
			
		if (ban !== []) {
			
			let mask;
			
			if (ban[2] == 'hnu') {
				mask = rawsp[7] + '!' + rawsp[4] + '@' + rawsp[5];
			}
			if (ban[2] == 'hn') {
				mask = rawsp[7] + '!*@' + rawsp[5];
			}
			if (ban[2] == 'hu') {
				mask = '*!'+ rawsp[4] +'@' + rawsp[5];
			}
			if (ban[2] == 'h') {
				mask = '*!*@' + rawsp[5];
			}
			if (ban[2] == 'nu') {
				mask = rawsp[7] + '!'+ rawsp[4] +'@*';
			}
			if (ban[2] == 'n') {
				mask = rawsp[7] + '!*@*';
			}
			if (ban[2] == 'u') {
				mask = '*!'+ rawsp[4] +'@*';
			}
			
			if (ban[3] == 'ban') {
				
				doSend('mode ' + ban[0] + ' +b ' + mask);
				
				if (ban[2].indexOf('r') !== -1) {
					
					mask = '~r:' + rawp[2].substring(2);
					doSend('mode ' + ban[0] + ' +b ' + mask);
				}
			}
			
			if (ban[3] == 'except') {
				
				doSend('mode ' + ban[0] + ' +e ' + mask);
				
				if (ban[2].indexOf('r') !== -1) {
					
					mask = '~r:' + rawp[2].substring(2);
					doSend('mode ' + ban[0] + ' +e ' + mask);
				}
			}
			
			if (ban[3] == 'kickban') {
				
				doSend('kick ' + ban[0] + ' ' + rawsp[7] + ' ' + ban[4]);
				
				doSend('mode ' + ban[0] + ' +b ' + mask);
				
				if (ban[2].indexOf('r') !== -1) {
					
					mask = '~r:' + rawp[2].substring(2);
					doSend('mode ' + ban[0] + ' +b ' + mask);
				}
			}
			
			if (ban[3] == 'bankick') {
				
				doSend('mode ' + ban[0] + ' +b ' + mask);
				
				if (ban[2].indexOf('r') !== -1) {
					
					mask = '~r:' + rawp[2].substring(2);
					doSend('mode ' + ban[0] + ' +b ' + mask);
				}
				
				doSend('kick ' + ban[0] + ' ' + rawsp[7] + ' ' + ban[4]);
			}
			
			ban = [];
		}
	}
	else if (rawsp[1] == '353') { // /names #salon
		
		if (typeof nicks_join[ rawsp[4] ] === 'undefined') {
			nicks_join[ rawsp[4] ] = '';
		}
		
		nicks_join[ rawsp[4] ] += rawp[2];
	}
	else if (rawsp[1] == '366') {
		
		userlist(rawsp[3], nicks_join[ rawsp[3] ]);
		
		nicks_join[ rawsp[3] ] = '';
	}
	else if (rawsp[1] == '396') { // mynick and myhost
		me = rawsp[2];
		myhost = rawsp[3];
	}
	else if (rawsp[1] == 'JOIN') { // on join
		onJoin( rawsp[0], rawp[2] );
	}
	else if (rawsp[1] == 'PRIVMSG') {
		
		// :WircyUser_616!websocket@Clk-2B9152EF PRIVMSG #websocket :ACTION pwet
		if (rawsp[3] == ':ACTION' && rawp[2].substr(-1) == '') {
			if ( ignores_check( rawsp[0].substring(1), ['a','p','c']) ) {
				
				memsg(rawsp[0].substring(1), rawsp[2], rawp.splice(2).join(':'));
			}
		}
		else if (rawsp[2] == me) {
			if ( ignores_check( rawsp[0].substring(1), ['a','p']) ) {
				
				query(rawp[1].split('!')[0], raw.split(':').splice(2).join(':'));
			}
		}
		else {
			if ( ignores_check( rawsp[0].substring(1), ['a','c']) ) {
				
				msg(raw);
			}
		}
	}
	else if (rawsp[1] == 'QUIT') {
		onQuit( getNickname(raw), rawp[3] );
	}
	else if (rawsp[1] == 'PART') {
		onPart(rawp[1], rawsp[2]);
	}
	else if (rawsp[1] == 'NICK') {
		onNick( getNickname(raw), rawp[2] );
	}
	//<- :Kitu!~mg@971300C1.EFA6EE0.D7878BA0.IP NOTICE Kitu :pwet
	else if (rawsp[1] == 'NOTICE') {
		
		if ( ignores_check( rawsp[0].substring(1), ['a','n']) ) {
			
			onNotice( rawsp );
		}
	}
	else if (rawsp[1] == '311' || rawsp[1] == '379' || rawsp[1] == '319' || rawsp[1] == '312' || rawsp[1] == '317' || rawsp[1] == '318') {
		onWhois( rawsp[1], rawsp.splice(3).join(' ') );
	}
	// rcvd :WircyUser_455!websocket@F59D8D69.81546244.7925F8A.IP TOPIC #websocket :pwet
	else if (rawsp[1] == 'TOPIC') {
		onSetTopic( raw );
	}
	else if (rawsp[1] == '331') { // RCVD: :roubaix.fr.epiknet.org 331 Georges #wircy :No topic is set.
		document.getElementById('topic').innerHTML = '';
	}
	// rcvd :irc.wevox.co 332 WircyUser_455 #websocket :pwet
	else if (rawsp[1] == '332') {
		onTopicMsg( rawp );
	}
	// rcvd :irc.wevox.co 333 WircyUser_455 #websocket WircyUser_455 1515419933
	else if (rawsp[1] == '333') {
		onTopicMetas( rawsp );
	}
	// :Kitu!websocket@F59D8D69.81546244.7925F8A.IP MODE #websocket +s
	// :Kitu MODE Kitu :-i
	else if (rawsp[1] == 'MODE') {
		
		setMode( rawsp );
		
		//RCVD: :Themis MODE Kitu :+r
		
		if (rawp[2] == '+r' && rawsp[2] == me) {
			autojoins();
		}
	}
	// :irc.wevox.co 324 WircyUser_965 #websocket +s
	else if (rawsp[1] == '324') {
		getMode( rawsp );
	}
	// :irc.wevox.co 329 WircyUser_965 #websocket 1515628736
	else if (rawsp[1] == '329') {
		getMode( rawsp );
	}
	// :irc.wevox.co 221 Kitu +iwx
	else if (rawsp[1] == '221') {
		getMode( rawsp );
	}
	else if (rawsp[1] == '321') {
		startList();
	}
	// :irc.wevox.co 322 WircyUser_450 #pwet 1 : pwet
	else if (rawsp[1] == '322') {
		onList( rawsp );
	}
	else if (rawsp[1] == '323') {
		endList( rawsp );
	}
	else if (rawsp[1] == '482') { // not channel operator
		
		let elem = document.createElement('p');
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ' + rawp[2];
		document.getElementById('chan_' + rawsp[3].substring(1)).appendChild(elem);
	}
	else if (rawsp[1] == 'KICK') {
		onKick(rawsp);
	}
	
	else { // RAWDATA FOR DEBUG
		
		writeToScreen('<span class="nocolorcopy">' + urlify(style( raw.split(':').splice(2).join(':') ), '', false, false) + '</span>');
	}
}

function onKick(rawsp) {
	
	if (rawsp[3] == me) {
		
		let chanstriped = rawsp[2].substring(1);
		document.getElementById('chan_btn_' + chanstriped).remove();
		document.getElementById('chan_' + chanstriped).remove();
		document.getElementById('status').className += ' wselected';
		document.getElementById('ul_' + chanstriped).remove();
		document.getElementById('userlist').className = 'displaynone';
		document.getElementById('btn_status').className += ' btn_selected';
	}
	else {
		
		let elem = document.createElement('p');
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ' + rawsp[3] + ' has been kicked on ' + rawsp[2] + ' (' + rawsp[4].substring(1) + ')';
		
		let w = document.getElementById('chan_' + rawsp[2].substring(1));
		
		w.appendChild(elem);
		
		scrollBottom(w);
		
		doSend('names ' + rawsp[2]);
	}
}

function startList() {
	
	document.getElementById('gchanlist').innerHTML = '<table id="gcl_table"><tr><th>Channel</th><th>Users</th><th>Topic</th></tr>';
	
	document.getElementById('loader').style.display = 'block';
}

function onList( rawsp ) {
	
	if (typeof list[ rawsp[4] + rawsp[3] ] === 'undefined') {
		list[ rawsp[4] + rawsp[3] ] = [];
	}
	
	list[ rawsp[4] + rawsp[3] ].push( rawsp.splice(6).join(' ') );
}

function sortNumber(a, b) {
	
	return parseInt(b.split('#')[0]) - parseInt(a.split('#')[0]);
}

function endList( rawsp ) {
	
	let list_html = document.getElementById('gcl_table');
	
	Object.keys(list).sort(sortNumber).map(function(objectKey, index) {
		
		let line = document.createElement('tr');
		line.className = 'lchan';
		let cell1 = document.createElement('td');
		let cell2 = document.createElement('td');
		let cell3 = document.createElement('td');
		let users = document.createTextNode( objectKey.split('#')[0] );
		let chan = document.createTextNode( '#' + objectKey.split('#')[1] );
		let topic = document.createElement( 'span' );
		topic.innerHTML = urlify(style(list[objectKey][0]), '', false, false);
		
		cell1.appendChild(chan);
		cell2.appendChild(users);
		cell3.appendChild(topic);
		
		line.appendChild(cell1);
		line.appendChild(cell2);
		line.appendChild(cell3);
		
		list_html.appendChild(line);
	});
	
	Array.from(document.getElementsByClassName('lchan')).forEach(function(item, index) {
		
		item.ondblclick = function() {
			
			doSend('join ' + item.getElementsByTagName('td')[0].innerText);
		}
	});
	
	document.getElementById('loader').style.display = 'none';
	
	list = {};
	
	list_html.style.display = 'block';
	
	let window = document.getElementById('gchanlist');
	
	window.scrollTop = 0;
}

function getMode( rawsp ) {
	
	if (rawsp[1] == '324') {
		
		let elem = document.createElement('p');
		
		if (rawsp[4].substring(1) === '') {
			
			let chan = document.createTextNode(rawsp[3]);
			
			elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ';
			elem.appendChild(chan);
			elem.innerHTML += ' has no mode';
		}
		else {
			
			let chan = document.createTextNode(rawsp[3]);
			let chanmodes = document.createTextNode(rawsp[4]);
			
			elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ';
			elem.appendChild(chan);
			elem.innerHTML += ' channel has mode(s) ';
			elem.appendChild(chanmodes);
		}
		document.getElementsByClassName('wselected')[0].appendChild(elem);
	}
	if (rawsp[1] == '329') {
		
		let elem = document.createElement('p');
		let chan = document.createTextNode(rawsp[3]);
		let date = document.createTextNode(timeFrom(rawsp[4]));
		
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ';
		elem.appendChild(chan);
		elem.innerHTML += ' created on ';
		elem.appendChild(date);
		 
		document.getElementsByClassName('wselected')[0].appendChild(elem);
	}
	if (rawsp[1] == '221') {
		
		let elem = document.createElement('p');
		let nick = document.createTextNode(rawsp[2]);
		let usermodes = document.createTextNode(rawsp[3]);
		
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * '; 
		elem.appendChild(nick);
		elem.innerHTML += ' has mode(s) ';
		elem.appendChild(usermodes);
		
		document.getElementsByClassName('wselected')[0].appendChild(elem);
	}
}

function setMode(rawsp) {
	
	// :ChanServ!services@services.wevox.co MODE #wevox -o Kitu
	// :Kitu!websocket@F59D8D69.81546244.7925F8A.IP MODE #WeVox +s
	// :Kitu!websocket@F59D8D69.81546244.7925F8A.IP MODE #WeVox +s-o Kitu
	// :ChanServ!services@services.wevox.co MODE #WeVox +ntrao-o ChanServ ChanServ WircyUser_976
	
	let chan_or_nick = rawsp[2];
	let modes = rawsp[3];
	
	modes = document.createTextNode(modes);
	
	let chan_nicks_mode = ' ';
	if (typeof rawsp[4] !== 'undefined') {
		chan_nicks_mode += rawsp.splice(4).join(' ');
	}
	
	let elem = document.createElement('p');
	if (chan_or_nick[0] === '#') {
		
		let nick = rawsp[0].split(':')[1].split('!')[0];
		let chan = chan_or_nick.substring(1);
		
		nick = document.createTextNode(nick);
		chan = document.createTextNode(chan);
		chan_nicks_mode = document.createTextNode(chan_nicks_mode);
		
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ';
		elem.appendChild(nick);
		elem.innerHTML += ' sets mode(s) ';
		elem.appendChild(modes);
		elem.appendChild(chan_nicks_mode);
		elem.innerHTML += ' on #';
		elem.appendChild(chan);
		
		let w = document.getElementById('chan_' + chan_or_nick.substring(1));
		if (w != null) {
			w.appendChild(elem);
		}
		else {
			document.getElementById('status').appendChild(elem);
		}
		
		doSend('names ' + chan_or_nick);
		
		scrollBottom(w);
	}
	else {
		
		chan_or_nick = document.createTextNode(chan_or_nick);
		
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ';
		elem.appendChild(chan_or_nick);
		elem.innerHTML += ' mode(s) : ';
		elem.appendChild(modes);
		
		document.getElementById('status').appendChild(elem);
	}
}

function onTopicMsg( rawp ) { // :irc.wevox.co 332 WircyUser_147 #WeVox :Canal IRC d'accueil du réseau WeVox.
	
	let topicRaw = rawp.slice(2).join(':');
	
	let elem = document.createElement('p');
	let topic = urlify(style(topicRaw), '', false, false);
	let cs = rawp[1].split(' ')[3].substring(1);
	
	if (topicByCommand === true) {
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * Topic : ' + topic;
		document.getElementById('chan_' + cs).appendChild(elem);
	}
	
	let topicInput = document.getElementById('topic');
	
	let cts = document.getElementsByClassName('ct_selected');
	
	if (cts.length !== 0) {
		cts[0].className = 'chan_topic';
	}
	
	let chan_topic = document.createElement('p');
	chan_topic.className = 'chan_topic ct_selected';
	chan_topic.id = 'chan_topic_' + cs;
	chan_topic.innerHTML = topic;
	
	topicInput.appendChild(chan_topic);
	topicInput.style.display = 'inline';
}

function onTopicMetas( rawsp ) {
	
	if (topicByCommand === true) {
	
		let elem = document.createElement('p');
		let nick = document.createTextNode(rawsp[4]);
		let date = document.createTextNode(timeFrom( rawsp[5] ));
		
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * Set by ';
		elem.appendChild(nick);
		elem.innerHTML += ' on ';
		elem.appendChild(date);
		
		document.getElementById('chan_' + ACStriped).appendChild(elem);
	}
	
	topicByCommand = false;
}

function onSetTopic( raw ) {
	
	let nick = document.createTextNode(raw.split(':')[1].split('!')[0]);
	let cs = raw.split(' ')[2].substring(1);
	let chan_striped = document.createTextNode(cs);
	let topic = urlify(style( raw.split(':').splice(2).join(':') ), '', false, false);
	
	let elem = document.createElement('p');
	elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ' + nick.textContent + ' sets topic on #' + chan_striped.textContent + ' : ' + topic;
	
	let topicInput = document.getElementById('topic');
	
	let cts = document.getElementsByClassName('ct_selected');
	
	if (cts.length !== 0) {
		cts[0].className = 'chan_topic';
	}
	
	let ct = document.getElementById('chan_topic_' + cs);
	
	if (ct !== null) {
		ct.remove();
	}
	
	let chan_topic = document.createElement('p');
	chan_topic.className = 'chan_topic ct_selected';
	chan_topic.id = 'chan_topic_' + cs;
	chan_topic.innerHTML = topic;
	
	topicInput.appendChild(chan_topic);
	topicInput.style.display = 'inline';
	
	document.getElementById('chan_' + cs).appendChild(elem);
}

function memsg(mask, target, message) {
	
	let nick = document.createTextNode(mask.split('!')[0]);
	let prefix;
	
	if (target.substr(0, 1) == '#') {
		target = target.substring(1);
		prefix = 'chan_';
	}
	else {
		prefix = 'query_';
	}
	
	message = urlify(style( escapeHtml( message.split('ACTION ')[1].split('')[0] ) ), '', false, false);
	
	let hlCheck = false, hlcolor = '';
	
	if (message.split(' ').indexOf(me) !== -1) { // HL
		hlCheck = true;
		hlcolor = 'hlcolor';
	}
	
	if (hlCheck) {
		
		hl(nick.textContent, message);
	}
	
	let w = document.getElementById(prefix + target);
	
	if (w !== null) {
	
		w.innerHTML += '<p><strong class="'+ hlcolor +'">&lt;' + currentTime() + '&gt; * <span style="color:blue;">' + nick.textContent + '</span></strong> ' + message + '</p>';
	}
	
	scrollBottom(w);
}

function onNotice(rawsp) { // :NickServ!services@services.wevox.co NOTICE WircyUser_604 :NickServ allows you to register a nickname and
	
	idmsg++;
	
	let nicksend = document.createTextNode(rawsp[0].split('!')[0].substring(1));
	let nickrcv = rawsp[2];
	
	if (nickrcv == me) {
		
		let elem = document.createElement('p');
		
		elem.id = 'idmsg_' + idmsg;
		
		let mht = ht( escapeHtml( rawsp.splice(3).join(' ').substring(1) ) );
		
		let message = urlify(style( mht[1] ), idmsg, true, false );
		
		elem.innerHTML = '<span style="color:#CE6F22;" class="nocolorcopy">&lt;' + currentTime() + '&gt; -' + nicksend.textContent + '- ' + message + '</span>';
		
		let w = document.getElementsByClassName('wselected')[0];
		if (typeof w != 'undefined') {
			w.appendChild(elem);
		}
		else {
			document.getElementById('status').appendChild(elem);
		}
		
		mht[0].forEach(function(item) {
			
			document.getElementById(item).ondblclick = function() {
				
				doSend( 'join #' + this.id.split('_')[1] );
			}
		});
		
		scrollBottom(w);
	}
}

function style(msg) {
	
	let p = document.createElement('p');
	
	p.innerText = msg;
	
	let newmsg = p.innerText.split('');
	
	let output = '';
	
	newmsg.forEach(function(item, index) {

		if (index > 0) {
			if (index % 2 == 0) {
				output += '</strong>' + item;
			}
			else {
				output += '<strong>' + item;
			}
		}
		else {
			output += item;
		}
	});

	let newmsg2 = output.split('');
	let output2 = '';

	newmsg2.forEach(function(item, index) {

		if (index > 0) {
			if (index % 2 == 0) {
				output2 += '</u>' + item;
			}
			else {
				output2 += '<u>' + item;
			}
		}
		else {
			output2 += item;
		}
	});

	let newmsg3 = output2.split('');
	let output3 = '';

	newmsg3.forEach(function(item, index) {

		if (index > 0) {
			if (index % 2 == 0) {
				output3 += '</em>' + item;
			}
			else {
				output3 += '<em>' + item;
			}
		}
		else {
			output3 += item;
		}
	});

	let newmsg4 = output3.split('');
	let output4 = '';

	newmsg4.forEach(function(item, index) {

		if (index > 0) {
			if (index % 2 == 0) {
				output4 += '</span>' + item;
			}
			else {
				output4 += '<span style="color:white; background-color:black;">' + item;
			}
		}
		else {
			output4 += item;
		}
	});

	let newmsg5 = output4.split('');
	let output5 = '';
	
	if (typeof newmsg5[1] !== 'undefined') {
	
		newmsg5.forEach(function(item, index) {
			
			if (index > 0) {
				
				let colorcode = item.substr(0, 5);

				colorcode = colorcode.split(',');

				if (typeof colorcode[1] !== 'undefined') {
					
					var text = parseInt(colorcode[0], 10);
					var highlight = parseInt(colorcode[1], 10);
					
					var len = parseInt(colorcode[0], 10).toString().length + parseInt(colorcode[1], 10).toString().length + 1;
				}
				else {
					var text = parseInt(colorcode[0].substr(0, 2), 10);
					var len = text.toString().length;
				}
				
				output5 += '<span style="color:'+color(text)+'; background-color:'+color(highlight)+';">' + item.substring(len);
			}
		});
	}
	else {
		output5 = output4;
	}
	
	return output5;
}

function color(n) {
	switch (n) {
		case 0:
			n = 'white';
		break;
		case 1:
			n = 'black';
		break;
		case 2:
			n = '#00007F';
		break;
		case 3:
			n = '#009300';
		break;
		case 4:
			n = 'red';
		break;
		case 5:
			n = '#7F0000';
		break;
		case 6:
			n = '#9C009C';
		break;
		case 7:
			n = '#FC7F00';
		break;
		case 8:
			n = '#FFFF00';
		break;
		case 9:
			n = '#00FC00';
		break;
		case 10:
			n = '#009393';
		break;
		case 11:
			n = 'cyan';
		break;
		case 12:
			n = '#0000FC';
		break;
		case 13:
			n = 'magenta';
		break;
		case 14:
			n = '#7F7F7F';
		break;
		case 15:
			n = '#D2D2D2';
		break;
	}
	
	return n;
}

function onPart(mask, chan) {
	
	let nick = mask.split('!')[0];
	let nickelem = document.createTextNode(nick);
	let chanelem = document.createTextNode(chan);
	
	let elem = document.createElement('p');
	
	elem.innerHTML = '<strong class="noboldcopy" style="color:green;">['+ currentTime() +'] * ';
	elem.appendChild(nickelem);
	elem.innerHTML += ' has left ';
	elem.appendChild(chanelem);
	
	let w = document.getElementById('chan_' + chan.substring(1));
	
	w.appendChild(elem);
	
	scrollBottom(w);
	
	if (nick == me) {
		let chanstriped = chan.substring(1);
		document.getElementById('chan_btn_' + chanstriped).remove();
		document.getElementById('chan_' + chanstriped).remove();
		document.getElementById('status').className += ' wselected';
		document.getElementById('ul_' + chan.substring(1)).remove();
		document.getElementById('userlist').className = 'displaynone';
		document.getElementById('btn_status').className += ' btn_selected';
	}
	else {
		doSend('names ' + chan);
	}
}

function onWhois(numraw, line) {
	
	if (numraw == '317') {
		
		line = line.split(' ');
		
		let signon = new Date(line[2] * 1000);
		
		let day = checkTime(signon.getDate());
		let month = checkTime(signon.getMonth() + 1);
		let year = signon.getFullYear();
		
		let hours = checkTime( signon.getHours() );
		let minutes = checkTime( signon.getMinutes() );
		let seconds = checkTime( signon.getSeconds() );
		
		signon = 'connected since : ' + day + '/' + month + '/' + year + ' - ' + hours + ':' + minutes + ':' + seconds;
		
		let idle = 'is idle for ' + parseIdle( line[1] );
		
		line = line[0] + ' ' + idle + ', ' + signon;
	}
	
	let elem = document.createElement('p');
	
	let today = new Date();
	
	line = line.split(':');
	line = line[0] + line.splice(1).join(':');
	
	elem.innerHTML = '&lt;'+ currentTime() +'&gt; ' + line;
	
	let w = document.getElementsByClassName('wselected')[0];
	
	w.appendChild(elem);
	
	scrollBottom(w);
}

function parseIdle(seconds) {
	
	let y = '', mo = '', d = '', h = '', mi = '';
	
	let yfloat = seconds / 31471200;
	let yfloor = Math.floor( yfloat );
	if (yfloor >= 1) {
		y = yfloor + ' year(s)';
		seconds -= yfloat * 31471200;
	}
	
	let mofloat = seconds / 2622600;
	let mofloor = Math.floor( mofloat );
	if (mofloor >= 1) {
		mo = mofloor + ' month(s)';
		seconds -= mofloat * 2622600;
	}
	
	let dfloat = seconds / 86400;
	let dfloor = Math.floor( dfloat );
	if (dfloor >= 1) {
		d = dfloor + ' day(s)';
		seconds -= dfloat * 86400;
	}
	
	let hfloat = seconds / 3600;
	let hfloor = Math.floor( hfloat );
	if (hfloor >= 1) {
		h = hfloor + ' hour(s)';
		seconds -= hfloat * 3600;
	}
	
	let mifloat = seconds / 60;
	let mifloor = Math.floor( mifloat );
	if (mifloor >= 1) {
		mi = mifloor + ' minute(s)';
		seconds -= hfloat * 3600;
	}
	
	if (seconds > 0) {
		seconds = seconds + ' second(s)';
	}
	else {
		seconds = '';
	}
	
	return y + mo + d + h + mi + seconds;
}

function timeFrom( timestamp ) {
	
	let date = new Date( timestamp * 1000 );
	
	let d = checkTime( date.getDate() );
	let mo = checkTime( date.getMonth() + 1);
	let y = checkTime( date.getFullYear() );
	let h = checkTime( date.getHours() );
	let m = checkTime( date.getMinutes() );
	let s = checkTime( date.getSeconds() );
	
	return d + '/' + mo + '/' + y + ' - ' + h + ':' + m + ':' + s;
}

function currentTime() {
	
	let today = new Date();
	
	let h = checkTime( today.getHours() );
	let m = checkTime( today.getMinutes() );
	let s = checkTime( today.getSeconds() );
	
	return h + ':' + m + ':' + s;
}

function checkTime(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

function onNick(oldnick, newnick) {
	
	if (document.getElementById('ban_opts_nick') !== null) {
		
		let ban_opts_nick = document.getElementById('ban_opts_nick');
		
		if (ban_opts_nick.innerText === oldnick) {
			
			ban_opts_nick.innerText = newnick;
		}
	}
	
	if (oldnick == me) {
		me = newnick;
	}
	
	let oldnick_html = document.createTextNode(oldnick);
	
	for (var item in uls) {
		
		if (uls_no_mode[item].indexOf(oldnick) !== -1) {
		
			let elem = document.createElement('p');
			elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ';
			elem.appendChild(oldnick_html);
			elem.innerHTML += ' is now ' + newnick;
			
			document.getElementById('chan_' + item).appendChild(elem);
			
			doSend('names #' + item);
		}
	}
}

function join(chan) {
	
	let chansp = chan.substring(1);
	
	let channel_window = document.createElement('div');
	Array.from(document.getElementsByClassName('window')).forEach( closeAllWindows );
	channel_window.className = 'window chan wselected';
	channel_window.setAttribute('id', 'chan_' + chansp);
	document.getElementById('msgs').appendChild(channel_window);
	
	Array.from(document.getElementsByClassName('ul')).forEach(function(item) { item.className = 'ul ul_hidden' });
	
	let userlist_chan = document.createElement('div');
	userlist_chan.setAttribute('id', 'ul_' + chansp);
	userlist_chan.setAttribute('class', 'ul');
	document.getElementById('userlist').appendChild(userlist_chan);
	
	let favinfo;
	
	if (favlist.indexOf(chan) === -1) {
		favinfo = ' \
			<span class="chanlist_opt"> \
				<i id="cc_' + chansp + '" class="fa fa-times close" aria-hidden="true"></i> \
				<i id="fc_' + chansp + '" class="fa fa-star-o favinfo" aria-hidden="true"></i> \
				<!--<i id="cp_' + chansp + '" class="fa fa-cog chan_params" aria-hidden="true"></i>--> \
			</span> \
		';
	}
	else {
		favinfo = ' \
			<span class="chanlist_opt"> \
				<i id="cc_' + chansp + '" class="fa fa-times close" aria-hidden="true"></i> \
				<i id="fc_' + chansp + '" class="fa fa-star favinfo favchecked"></i> \
				<!--<i id="cp_' + chansp + '" class="fa fa-cog chan_params" aria-hidden="true"></i>--> \
			</span> \
		';
	}
	
	let channel = document.createElement('p');
	channel.innerHTML = '<i class="fa fa-hashtag" aria-hidden="true"></i>' + chansp + favinfo;
	Array.from(document.getElementsByClassName('btn_selected')).forEach(function(item) { item.className = 'btn_window' });
	channel.setAttribute('class', 'btn_window btn_selected');
	channel.setAttribute('id', 'chan_btn_' + chansp);
	chanlist.appendChild(channel);
		
	document.getElementById('cc_' + chansp).onclick = function() {
			
		doSend('part ' + chan);
	
	}
	
	Array.from(document.getElementsByClassName('chan_params')).forEach(function(item) {
		
		item.onclick = function() {
		
			let chan = '#' + this.id.substring(3);
			
			document.getElementById('chan_params').style.display = 'block';
			
			doSend('mode ' + chan + ' +b');
			doSend('mode ' + chan + ' +e');
		}
	});
	
	document.getElementById('editbox').style.display = 'block';
	document.getElementById('text').focus();
	
	addFavInfoEvents();
	
	let activeWindow = document.getElementsByClassName('wselected')[0];
	
	if (typeof activeWindow !== 'undefined') {
	
		activeWindow.onscroll = function() {
			
			if (this.scrollHeight !== this.offsetHeight + this.scrollTop) {
				
				document.getElementById('border-right').style.backgroundColor = 'red';
				document.getElementById('border-left').style.backgroundColor = 'red';
			}
			else {
				
				document.getElementById('border-right').style.backgroundColor = 'gainsboro';
				document.getElementById('border-left').style.backgroundColor = 'gainsboro';
			}
		}
	}
}

function query(nick, msg) {
	
	let querylist = document.getElementById('querylist');
	
	if (document.getElementById('query_' + nick) === null) {
		
		let query_window = document.createElement('div');
		Array.from(document.getElementsByClassName('window')).forEach( closeAllWindows );
		query_window.className = 'window query wselected';
		query_window.setAttribute('id', 'query_' + nick);
		document.getElementById('msgs').appendChild(query_window);
		
		document.getElementById('userlist').className = 'displaynone';
		
		let query = document.createElement('p');
		query.innerHTML = '<i class="fa fa-user-circle" aria-hidden="true"></i>' + nick;
		query.innerHTML += '<span class="chanlist_opt"><i id="cn_' + nick + '" class="fa fa-times close" aria-hidden="true"></i></span>';
		Array.from(document.getElementsByClassName('btn_selected')).forEach(function(item) { item.className = 'btn_window' });
		query.setAttribute('class', 'btn_window btn_selected');
		query.setAttribute('id', 'query_btn_' + nick);
		querylist.appendChild(query);
		
		document.getElementById('text').focus();
	}
	if (msg !== false) {
		
		if (msg[0] === '') {
			ctcp(msg);
		}
		else {
			if (document.getElementById('query_' + nick) === null) {
				
				let query_window = document.createElement('div');
				query_window.className = 'window query';
				query_window.setAttribute('id', 'query_' + nick);
				document.getElementById('msgs').appendChild(query_window);
				
				document.getElementById('userlist').className = 'displaynone';
				
				let query = document.createElement('p');
				query.innerHTML = nick;
				// Deleted : <i class="fa fa-caret-down nopt" aria-hidden="true">
				query.innerHTML += '<span class="chanlist_opt"><i id="cn_' + nick + '" class="fa fa-times close" aria-hidden="true"></i></i></span>';
				query.setAttribute('class', 'btn_window');
				query.setAttribute('id', 'query_btn_' + nick);
				chanlist.appendChild(query);
			}
			
			let hlCheck = false, hlcolor = '';
			
			if (msg.split(' ').indexOf(me) !== -1) { // HL
				hlCheck = true;
				hlcolor = 'hlcolor';
			}
			
			let w = document.getElementById('query_' + nick);
			let line = document.createElement('p');
			
			msg = urlify( style( escapeHtml( msg ) ) );
			
			line.innerHTML = '<strong class="'+ hlcolor +'">&lt;' + currentTime() + '&gt; &lt;' + nick + '&gt;</strong> ' + msg;
			
			w.appendChild(line);
			
			if (hlCheck) {
				hl(nick, msg);
			}
		}
	}
	
	document.getElementById('cn_' + nick).onclick = function() {
		
		document.getElementById('query_' + nick).remove();
		document.getElementById('query_btn_' + nick).remove();
		
		document.getElementById('status').className += ' wselected';
		document.getElementById('btn_status').className += ' btn_selected';
	}
	
	document.getElementById('topic').innerHTML = '';
}

function ctcp(msg) {
	
	let command = msg.split('')[1];
	
	if (command === 'AVATAR') {
		console.log('pwet');
	}
	if (command === 'SUMM') {
		
		summary(command[2], idmsg);
	}
}

function onQuit(nick, quitmsg) {
	
	if (typeof quitmsg === 'undefined' || quitmsg == '') {
		quitmsg = 'Quit';
	}
	
	let nickHTML = document.createTextNode(nick);
	quitmsg = document.createTextNode(quitmsg);
	
	Array.from(document.getElementsByClassName('nick_' + nick)).forEach( delNickname );
	
	for (var chan in uls_no_mode) {
		
		if (uls_no_mode[chan].indexOf(nick) !== -1) {
			
			let w = document.getElementById('chan_' + chan);
			let line = document.createElement('p');
			line.innerHTML = '['+ currentTime() +'] * ';
			line.appendChild(nickHTML);
			line.innerHTML += ' left server (';
			line.appendChild(quitmsg);
			line.innerHTML += ')';
			
			w.appendChild(line);
			
			scrollBottom(w);
		}
	}
}

function delNickname(item) {
	item.remove();
}

function msg(raw) {
	
	idmsg++;
	
	let mht = ht( getMsg(raw) );
	
	let nick = getNickname(raw);
	let msg = urlify(style( escapeHtml( mht[1] ) ), idmsg, true, false );
	let chan = raw.split(' ')[2].substring(1);
	let hlCheck = false, hlcolor = '';
	
	if (msg.toLowerCase().split(' ').indexOf(me.toLowerCase()) !== -1) { // HL
		hlCheck = true;
		hlcolor = 'hlcolor';
	}
	
	let w = document.getElementById('chan_' + chan);
	let line = document.createElement('p');
	
	line.id = 'idmsg_' + idmsg;
	line.className = 'line';
	
	line.innerHTML = '<strong class="'+ hlcolor +'">&lt;' + currentTime() + '&gt; &lt;<span style="color:blue;">' + nick + '</span>&gt;</strong> ' + msg;
	
	if (w !== null) {
		
		w.appendChild(line);
		
		mht[0].forEach(function(item) {
			
			document.getElementById(item).ondblclick = function() {
				
				doSend( 'join #' + this.id.split('_')[1] );
			}
		});
		
		let elem = document.getElementById('chan_btn_' + chan);
		
		if (hlCheck === false) {
			
			if (elem.className.indexOf('red') === -1 && elem.className.indexOf('btn_selected') === -1) {
				
				elem.className += ' red';
			}
		}
		else {
			
			if (elem.className.indexOf('green') === -1 && elem.className.indexOf('btn_selected') === -1) {
				
				elem.className += ' green';
			}
		}
		
		scrollBottom(w);
	}
	
	if (hlCheck) {
		
		hl(nick, msg);
	}
}

function scrollBottom(w) {
	
	if (w !== null && typeof w !== 'undefined') {
		
		if (w.className.indexOf('wselected') === -1) {
			
			w.scrollTop = w.scrollHeight;
		}
		else if (document.getElementById('border-right').style.backgroundColor !== 'red') {
			
			w.scrollTop = w.scrollHeight;
		}
	}
}

function getMsg(raw) {
	
	return raw.split(':').splice(2).join(':');
}

function ci(a, b) {
	return a.toLowerCase().localeCompare(b.toLowerCase());
}

function userlist(chan, nicknames) {
	
	nicknames = nicknames.trim().split(' ');
	let nicksSorted = [];
	
	nicknames.forEach(function(item, index) {
		if (item[0] === '~') {
			nicksSorted[index] = 0 + item.substring(1);
		}
		else if (item[0] === '&') {
			nicksSorted[index] = 1 + item.substring(1);
		}
		else if (item[0] === '@') {
			nicksSorted[index] = 2 + item.substring(1);
		}
		else if (item[0] === '%') {
			nicksSorted[index] = 3 + item.substring(1);
		}
		else if (item[0] === '+') {
			nicksSorted[index] = 4 + item.substring(1);
		}
		else {
			nicksSorted[index] = 5 + item;
		}
	});
		
	nicksSorted.sort(ci);
	
	chan = chan.substring(1);
	
	let user, userlist = document.getElementById('ul_' + chan);
	
	userlist.innerHTML = '';
	
	uls[ chan ] = [];
	uls_no_mode[ chan ] = [];
	
	nicksSorted.forEach(function(item, index) {
		
		user = document.createElement('p');
		
		if (item[0] == '0' || item[0] == '1' || item[0] == '2' || item[0] == '3' || item[0] == '4') {
			
			user.className = 'nick_' + item.substring(1) + ' nlnick';
			
			if (item.substring(1) === me) {
				user.className += ' me';
			}
			
			uls_no_mode[ chan ].push( item.substring(1) );
		}
		else {
			user.className = 'nick_' + item.substring(1) + ' nlnick';
			
			if (item.substring(1)=== me) {
				user.className += ' me';
			}
			
			uls_no_mode[ chan ].push( item.substring(1) );
		}
		
		uls[ chan ].push( item );
		
		if (item[0] == '0') {
			item = '<i class="fa fa-circle owner" aria-hidden="true"></i> <span>' + item.substring(1) + '</span>';
		}
		else if (item[0] == '1') {
			item = '<i class="fa fa-circle admin" aria-hidden="true"></i> <span>' + item.substring(1) + '</span>';
		}
		else if (item[0] == '2') {
			item = '<i class="fa fa-circle op" aria-hidden="true"></i> <span>' + item.substring(1) + '</span>';
		}
		else if (item[0] == '3') {
			item = '<i class="fa fa-circle halfop" aria-hidden="true"></i> <span>' + item.substring(1) + '</span>';
		}
		else if (item[0] == '4') {
			item = '<i class="fa fa-circle voice" aria-hidden="true"></i> <span>' + item.substring(1) + '</span>';
		}
		else {
			item = '<i class="fa fa-circle user" aria-hidden="true"></i> <span>'+ item.substring(1) +'</span>';
		}
		
		user.innerHTML = item;
		
		userlist.appendChild(user);
	});
	
	let nl = document.getElementsByClassName('nlnick');
	
	Array.from(nl).forEach(function(n) {
		
		let nick = n.className.split(' ')[0].split('_')[1];
		
		let isOwner = uls[ chan ].indexOf('0' + me);
		let isAdmin = uls[ chan ].indexOf('1' + me);
		let isOp = uls[ chan ].indexOf('2' + me);
		let isHop = uls[ chan ].indexOf('3' + me);
		
		if (isOwner !== -1 || isAdmin !== -1 || isOp !== -1 || isHop !== -1) {
			
			var options = ' \
				<li>' + nick + '</li> \
				<hr />  \
				<li class="nlnick_pm">Private Messages</li> \
				<li class="nlnick_whois">Whois</li> \
				<hr /> \
				<li class="nlnick_op">Op</li> \
				<li class="nlnick_unop">UnOp</li> \
				<li class="nlnick_hop">HalfOp</li> \
				<li class="nlnick_unhop">UnHalfOp</li> \
				<li class="nlnick_voice">Voice</li> \
				<li class="nlnick_unvoice">UnVoice</li> \
				<hr /> \
				<li class="nlnick_kick">Kick</li> \
				<li class="nlnick_ban">Ban</li> \
				<li class="nlnick_kb">KickBan</li> \
				<li class="nlnick_bk">BanKick</li> \
				<li class="nlnick_except">Except</li> \
			';
		}
		else {
			
			var options = ' \
				<li>' + nick + '</li> \
				<hr />  \
				<li class="nlnick_pm">Private Messages</li> \
				<li class="nlnick_whois">Whois</li> \
			';
		}
		
		n.onclick = function(e) {
			
			e.stopPropagation();
			
			let nick_options = document.getElementsByClassName('nick_options');
			
			if (nick_options.length === 0) {
				
				Array.from(nl).forEach(function(n2) {
					n2.style.backgroundColor = 'transparent';
				});
				
				this.style.backgroundColor = 'white';
				
				let nickoptions = document.createElement('ul');
				nickoptions.className = 'nick_options';
				
				nickoptions.innerHTML = options;
				document.getElementById('chat').appendChild(nickoptions);
				
				/*
				document.getElementsByClassName('nlnick_ignore')[0].onclick = function() {
					
					ignore_cmd = true;
					
					doSend('userhost ' + nick);
				}
				*/
				
				document.getElementsByClassName('nlnick_pm')[0].onclick = function() {
					
					query(nick, false);
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
					
				document.getElementsByClassName('nlnick_whois')[0].onclick = function() {
					
					doSend('whois ' + nick);
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
					
				document.getElementsByClassName('nlnick_op')[0].onclick = function() {
					
					doSend('mode ' + activeChannel + ' +o ' + nick);
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
				
				document.getElementsByClassName('nlnick_unop')[0].onclick = function() {
					
					doSend('mode ' + activeChannel + ' -o ' + nick);
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
					
				document.getElementsByClassName('nlnick_hop')[0].onclick = function() {
					
					doSend('mode ' + activeChannel + ' +h ' + nick);
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
				
				document.getElementsByClassName('nlnick_unhop')[0].onclick = function() {
					
					doSend('mode ' + activeChannel + ' -h ' + nick);
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
					
				document.getElementsByClassName('nlnick_voice')[0].onclick = function() {
					
					doSend('mode ' + activeChannel + ' +v ' + nick);
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
				
				document.getElementsByClassName('nlnick_unvoice')[0].onclick = function() {
					
					doSend('mode ' + activeChannel + ' -v ' + nick);
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
					
				document.getElementsByClassName('nlnick_kick')[0].onclick = function() {
					
					let kick_reason = document.createElement('div');
					
					kick_reason.id = 'kick_window';
					
					kick_reason.innerHTML = '<i id="close_ban_opts" class="fa fa-times" aria-hidden="true"></i><input id="reason" type="text" placeholder="Enter a reason" /><input id="kick" type="button" value="Kick" />';
					
					document.getElementById('chat').appendChild(kick_reason);
					
					document.getElementById('close_ban_opts').onclick = function() {
						
						document.getElementById('kick_window').remove();
					}
					
					document.getElementById('kick').onclick = function() {
						
						let r = document.getElementById('reason').value;
						
						doSend('kick ' + activeChannel + ' ' + nick + ' ' + r);
						
						document.getElementById('kick_window').remove();
					}
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
				}
					
				document.getElementsByClassName('nlnick_ban')[0].onclick = function() {
					
					let ban_opts = document.createElement('div');
					
					ban_opts.id = 'ban_opts';
					
					ban_opts.innerHTML = ' \
						<i id="close_ban_opts" class="fa fa-times" aria-hidden="true"></i> \
						<p> \
							To ban <span id="ban_opts_nick">' + nick + '</span> \
						</p> \
						<p> \
							<input id="ban_host" type="checkbox" name="bantype" value="h" checked /> \
							<label for="ban_host">Host</label> \
						</p> \
						<p> \
							<input id="ban_nick" type="checkbox" name="bantype" value="n" /> \
							<label for="ban_nick">Nick</label> \
						</p> \
						<p> \
							<input id="ban_username" type="checkbox" name="bantype" value="u" /> \
							<label for="ban_username">Username</label> \
						</p> \
						<p> \
							<input id="ban_realname" type="checkbox" name="bantype" value="r" /> \
							<label for="ban_realname">Realname</label> \
						</p> \
						<p> \
							<input id="submit_ban" type="button" value="Ban" /> \
						</p> \
					';
					
					document.getElementById('chat').appendChild(ban_opts);
					
					document.getElementById('close_ban_opts').onclick = function() {
						
						document.getElementById('ban_opts').remove();
					}
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
					
					document.getElementById('submit_ban').onclick = function() {
						
						let bantype = '';
						
						if (document.getElementById('ban_host').checked === true) {
							bantype += 'h';
						}
						
						if (document.getElementById('ban_nick').checked === true) {
							bantype += 'n';
						}
						
						if (document.getElementById('ban_username').checked === true) {
							bantype += 'u';
						}
						
						if (document.getElementById('ban_realname').checked === true) {
							bantype += 'r';
						}
						
						let nick_opts = document.getElementById('ban_opts_nick').innerText;
						
						ban = [ activeChannel, nick_opts, bantype, 'ban' ];
						
						doSend('who ' + nick_opts);
						
						document.getElementById('ban_opts').remove();
					}
				}
				
				document.getElementsByClassName('nlnick_kb')[0].onclick = function() {
					
					let ban_opts = document.createElement('div');
					
					ban_opts.id = 'ban_opts';
					
					ban_opts.innerHTML = ' \
						<i id="close_ban_opts" class="fa fa-times" aria-hidden="true"></i> \
						<p> \
							To kickban <span id="ban_opts_nick">' + nick + '</span> \
						</p> \
						<p> \
							<input id="ban_host" type="checkbox" name="bantype" value="h" checked /> \
							<label for="ban_host">Host</label> \
						</p> \
						<p> \
							<input id="ban_nick" type="checkbox" name="bantype" value="n" /> \
							<label for="ban_nick">Nick</label> \
						</p> \
						<p> \
							<input id="ban_username" type="checkbox" name="bantype" value="u" /> \
							<label for="ban_username">Username</label> \
						</p> \
						<p> \
							<input id="ban_realname" type="checkbox" name="bantype" value="r" /> \
							<label for="ban_realname">Realname</label> \
						</p> \
						<p> \
							<input id="reason" type="text" placeholder="Enter a reason" /> \
							<input id="submit_ban" type="button" value="Ban" /> \
						</p> \
					';
					
					document.getElementById('chat').appendChild(ban_opts);
					
					document.getElementById('close_ban_opts').onclick = function() {
						
						document.getElementById('ban_opts').remove();
					}
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
					
					document.getElementById('submit_ban').onclick = function() {
						
						let bantype = '';
						
						if (document.getElementById('ban_host').checked === true) {
							bantype += 'h';
						}
						
						if (document.getElementById('ban_nick').checked === true) {
							bantype += 'n';
						}
						
						if (document.getElementById('ban_username').checked === true) {
							bantype += 'u';
						}
						
						if (document.getElementById('ban_realname').checked === true) {
							bantype += 'r';
						}
						
						let nick_opts = document.getElementById('ban_opts_nick').innerText;
						
						let reason = document.getElementById('reason').value;
						
						ban = [ activeChannel, nick_opts, bantype, 'kickban', reason ];
						
						doSend('who ' + nick_opts);
						
						document.getElementById('ban_opts').remove();
					}
				}
				
				document.getElementsByClassName('nlnick_bk')[0].onclick = function() {
					
					let ban_opts = document.createElement('div');
					
					ban_opts.id = 'ban_opts';
					
					ban_opts.innerHTML = ' \
						<i id="close_ban_opts" class="fa fa-times" aria-hidden="true"></i> \
						<p> \
							To ban <span id="ban_opts_nick">' + nick + '</span> \
						</p> \
						<p> \
							<input id="ban_host" type="checkbox" name="bantype" value="h" checked /> \
							<label for="ban_host">Host</label> \
						</p> \
						<p> \
							<input id="ban_nick" type="checkbox" name="bantype" value="n" /> \
							<label for="ban_nick">Nick</label> \
						</p> \
						<p> \
							<input id="ban_username" type="checkbox" name="bantype" value="u" /> \
							<label for="ban_username">Username</label> \
						</p> \
						<p> \
							<input id="ban_realname" type="checkbox" name="bantype" value="r" /> \
							<label for="ban_realname">Realname</label> \
						</p> \
						<p> \
							<input id="reason" type="text" placeholder="Enter a reason" /> \
							<input id="submit_ban" type="button" value="Ban" /> \
						</p> \
					';
					
					document.getElementById('chat').appendChild(ban_opts);
					
					document.getElementById('close_ban_opts').onclick = function() {
						
						document.getElementById('ban_opts').remove();
					}
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
					
					document.getElementById('submit_ban').onclick = function() {
						
						let bantype = '';
						
						if (document.getElementById('ban_host').checked === true) {
							bantype += 'h';
						}
						
						if (document.getElementById('ban_nick').checked === true) {
							bantype += 'n';
						}
						
						if (document.getElementById('ban_username').checked === true) {
							bantype += 'u';
						}
						
						if (document.getElementById('ban_realname').checked === true) {
							bantype += 'r';
						}
						
						let nick_opts = document.getElementById('ban_opts_nick').innerText;
						
						let reason = document.getElementById('reason').value;
						
						ban = [ activeChannel, nick_opts, bantype, 'bankick', reason ];
						
						doSend('who ' + nick_opts);
						
						document.getElementById('ban_opts').remove();
					}
				}
				
				document.getElementsByClassName('nlnick_except')[0].onclick = function() {
					
					let ban_opts = document.createElement('div');
					
					ban_opts.id = 'ban_opts';
					
					ban_opts.innerHTML = ' \
						<i id="close_ban_opts" class="fa fa-times" aria-hidden="true"></i> \
						<p> \
							To ban <span id="ban_opts_nick">' + nick + '</span> \
						</p> \
						<p> \
							<input id="ban_host" type="checkbox" name="bantype" value="h" checked /> \
							<label for="ban_host">Host</label> \
						</p> \
						<p> \
							<input id="ban_nick" type="checkbox" name="bantype" value="n" /> \
							<label for="ban_nick">Nick</label> \
						</p> \
						<p> \
							<input id="ban_username" type="checkbox" name="bantype" value="u" /> \
							<label for="ban_username">Username</label> \
						</p> \
						<p> \
							<input id="ban_realname" type="checkbox" name="bantype" value="r" /> \
							<label for="ban_realname">Realname</label> \
						</p> \
						<p> \
							<input id="submit_ban" type="button" value="Except" /> \
						</p> \
					';
					
					document.getElementById('chat').appendChild(ban_opts);
					
					document.getElementById('close_ban_opts').onclick = function() {
						
						document.getElementById('ban_opts').remove();
					}
					
					n.style.backgroundColor = 'transparent';
					
					nickoptions.remove();
					
					document.getElementById('submit_ban').onclick = function() {
						
						let bantype = '';
						
						if (document.getElementById('ban_host').checked === true) {
							bantype += 'h';
						}
						
						if (document.getElementById('ban_nick').checked === true) {
							bantype += 'n';
						}
						
						if (document.getElementById('ban_username').checked === true) {
							bantype += 'u';
						}
						
						if (document.getElementById('ban_realname').checked === true) {
							bantype += 'r';
						}
						
						let nick_opts = document.getElementById('ban_opts_nick').innerText;
						
						ban = [ activeChannel, nick_opts, bantype, 'except' ];
						
						doSend('who ' + nick_opts);
						
						document.getElementById('ban_opts').remove();
					}
				}
			}
			else {
				
				if (this.style.backgroundColor == 'white') {
					
					nick_options[0].remove();
					
					this.style.backgroundColor = 'transparent';
				}
				else {
					
					Array.from(nl).forEach(function(n3) {
						n3.style.backgroundColor = 'transparent';
					});
					
					nick_options[0].innerHTML = options;
					
					this.style.backgroundColor = 'white';
				}
			}
		}
	});
	
					
	let border_right = document.getElementById('border-right');
	border_right.style.height = document.getElementById('ul_' + chan).scrollHeight + 'px';
}

function getNickname(raw) {
	
	raw = raw.split(':')[1];
	
	let mask = raw.split('!');
	
	return mask[0];
}

function getMask(raw) {
	
	raw = raw.split(':')[1];
	
	let mask = raw.split('!');
	
	return mask[1];
}

function onJoin(user, chan, aj) {
	
	let chansp = chan.substring(1);
	
	if (aj !== false && aj > 0) {
		aj--;
	}
	
	let nick = getNickname(user);
	let nickelem = document.createTextNode(nick);
	let mask = document.createTextNode(getMask(user));
	
	if (nick == me) {
		
		ACStriped = chansp;
		activeChannel = chan;
		active = chan;
		activeType = 'channel';
		
		join(chan);
		
		let border_left = document.getElementById('border-left');
		border_left.style.height = document.getElementById('cqlist').scrollHeight + 'px';
		
		doSend('topic ' + chan);
	}
	
	let chanelem = document.createTextNode(chan);
	
	let elem = document.createElement('p');
	elem.innerHTML = '<strong class="noboldcopy" style="color:green;">['+ currentTime() +'] [<span style="color:blue;">' + nickelem.textContent + '</span>] (' + mask.textContent + ') has joined ' + chanelem.textContent + '</strong>';
	
	let w = document.getElementById('chan_' + chansp);
	
	w.appendChild(elem);
	
	let activeWindow = document.getElementsByClassName('wselected')[0];
	
	if (activeWindow.className.indexOf('query') === -1 && activeWindow.id !== 'status' && activeWindow.id !== 'gchanlist') {
		
		document.getElementById('userlist').className = '';
	}
	
	doSend('names ' + chan);
	
	if (aj !== false && aj === 0) {
		
		doSend('topic ' + chan);
		aj = false;
	}
	
	scrollBottom(w);
}

function onError(evt) {
	writeToScreen('<span style="color: red;">ERROR:<\/span> ' + evt.data);
}

function doSend(message) {
	//writeToScreen("SENT: " + escapeHtml(message) + "<br/>");
	websocket.send( (new TextEncoder()).encode(message).buffer );
}

function writeToScreen(message) {
	let pre = document.createElement("p");
	pre.innerHTML = message;
	output.appendChild(pre);
	// hope this works in all browsers:
	let msgs = document.getElementById('msgs');
	//msgs.scrollTop = msgs.scrollHeight;
}

function send() {
	
	let input = document.getElementById('text');
	let text = input.innerHTML.replace(/<br\s*[\/]?>/gi, "\n");
	let recipient = activeChannel;
	
	if (text[0] == '/') {
		exec( text.substring(1) );
	}
	else if (text) {
		
		idmsg++;
		
		let lines = Array.from(input.getElementsByTagName('div'));
		
		let query = document.getElementsByClassName('wselected')[0];
		
		let w = document.getElementById('chan_' + ACStriped);
		
		if (query.className.indexOf('query') !== -1) {
			
			recipient = query.id.substring(6);
			w = query;
		}
		if (lines.length === 0) {
			
			lines = Array.from(input.getElementsByTagName('p'));
			
			if (lines.length === 0) {
			
				let message = urlify(style( text ), idmsg, true, recipient );
				
				let line = document.createElement('p');
				
				line.id = 'idmsg_' + idmsg;
				
				line.className = 'line';
				
				line.innerHTML = '<strong class="nickname">&lt;'+ currentTime() +'&gt; &lt;' + me + '&gt; </strong>';
				line.innerHTML += message;
				w.appendChild(line);
				
				let activeWindow = document.getElementsByClassName('wselected')[0];
				
				if (document.getElementById('border-right').style.backgroundColor !== 'red') {
					
					activeWindow.scrollTop = activeWindow.scrollHeight;
				}
				
				doSend('privmsg ' + recipient + ' :' + input.innerText);
			}
			else {
				lines.forEach(function(item, index) {
					
					let message = urlify(style( item.innerText ), idmsg, true, recipient );
					
					let line = document.createElement('p');
					
					line.id = 'idmsg_' + idmsg;
					
					line.className = 'line';
					
					line.innerHTML = '<strong class="nickname">&lt;'+ currentTime() +'&gt; &lt;' + me + '&gt; </strong>';
					line.innerHTML += message;
					w.appendChild(line);
					
					let activeWindow = document.getElementsByClassName('wselected')[0];
					
					if (document.getElementById('border-right').style.backgroundColor !== 'red') {
						
						activeWindow.scrollTop = activeWindow.scrollHeight;
					}
					
					doSend('privmsg ' + recipient + ' :' + input.innerText);
				});
			}
		}
		else {
			
			lines.forEach(function(item, index) {
				
				let message = urlify(style( item.innerText ), idmsg, true, recipient );
				
				let line = document.createElement('p');
				line.innerHTML = '<strong class="nickname">&lt;'+ currentTime() +'&gt; &lt;' + me + '&gt; </strong>';
				line.innerHTML += message;
				
				line.id = 'idmsg_' + idmsg;
				
				line.className = 'line';
				
				w.appendChild(line);
				
				let activeWindow = document.getElementsByClassName('wselected')[0];
				
				if (document.getElementById('border-right').style.backgroundColor !== 'red') {
					
					activeWindow.scrollTop = activeWindow.scrollHeight;
				}
				
				doSend('privmsg ' + recipient + ' :' + input.innerText);
			});
		}
		document.getElementById('text').style.height = '23px';
	}
	
	input.innerHTML = '';
}

function exec(cmd) {
	
	// Done : /raw, /join, /nick, /whois (/w), /part, /notice (/n), /me, /cycle, /mode, /topic, /list, /kick, /query (/q)
	// To do : /quit, /who, /whowas, /links, /map, /op, /hop, /voice
	
	let raw = cmd;
	cmd = cmd.split(' ');
	cmd[0] = cmd[0].toLowerCase();
	
	if (cmd[0] == 'join' || cmd[0] == 'j') {
		
		if (cmd[1][0] != '#') {
			cmd[1] = '#' + cmd[1];
		}
		
		doSend('join ' + cmd[1]);
	}
	else if (cmd[0] == 'nick') {
		doSend('nick ' + cmd[1]);
	}
	else if (cmd[0] == 'whois' || cmd[0] == 'w') {
		doSend('whois ' + cmd.splice(1));
	}
	else if (cmd[0] == 'part') {
		if (typeof cmd[1] === 'undefined') {
			var chanPart = activeChannel;
		}
		else {
			
			if (cmd[1][0] != '#') {
				cmd[1] = '#' + cmd[1];
			}
			
			var chanPart = cmd[1];
		}
		doSend('part ' + chanPart);
	}
	else if (cmd[0] == 'notice' || cmd[0] == 'n') {
		
		doSend( raw );
		
		let elem = document.createElement('p');
		elem.innerHTML = '<strong class="noboldcopy">&lt;'+ currentTime() +'&gt; Notice » '+ cmd[1]+' :</strong> '+ cmd[2];
		document.getElementsByClassName('wselected')[0].appendChild(elem);
	}
	else if (cmd[0] == 'me') {
		
		// :WircyUser_616!websocket@Clk-2B9152EF PRIVMSG #websocket :ACTION pwet
		
		let prefix, target;
		
		if (active.substr(0, 1) == '#') {
			prefix = 'chan_';
			target = active.substring(1);
		}
		else {
			prefix = 'query_';
			target = active;
		}
		
		doSend('privmsg ' + active + ' :ACTION ' + cmd[1] + '');
		
		let elem = document.createElement('p');
		elem.innerHTML = '&lt;'+ currentTime() +'&gt; * ' + me + ' ' + cmd[1];
		document.getElementById(prefix + target).appendChild(elem);
	}
	else if (cmd[0] == 'cycle') {
		if (typeof cmd[1] === 'undefined') {
			var chanPart = activeChannel;
		}
		else {
			
			if (cmd[1][0] != '#') {
				cmd[1] = '#' + cmd[1];
			}
			
			var chanPart = cmd[1];
		}
		doSend('part ' + chanPart);
		setTimeout(function(){ doSend('join ' + chanPart); }, 2000);
	}
	else if (cmd[0] == 'raw') {
		doSend( cmd.splice(1).join(' ') );
	}
	else if (cmd[0] == 'mode') {
		doSend( raw );
	}
	else if (cmd[0] == 'topic') {
		if (typeof cmd[2] !== 'undefined') {
			doSend('topic ' + cmd[1] + ' :' + cmd.splice(2).join(' '));
		}
		else {
			topicByCommand = true;
			doSend('topic ' + cmd[1]);
		}
	}
	else if (cmd[0] == 'list') {
		gchanlist_window();
		doSend( raw );
	}
	else if (cmd[0] == 'kick') {
		if (cmd[1][0] != '#') {
			
			doSend('kick ' + activeChannel + ' ' + cmd[1] + ' ' + cmd.splice(2));
		}
		else {
			doSend( raw );
		}
	}
	else if (cmd[0] == 'query' || cmd[0] == 'q') {
		query(cmd[1], false);
	}
	else {
		doSend( raw );
	}
}

function closeAllWindows(item, index) {
	
	if (item.id == 'status' || item.id == 'gchanlist') {
		item.className = 'window';
	}
	else {
		if (item.className.indexOf('query') !== -1) {
			item.className = 'window query';
		}
		else if (item.className.indexOf('chan') !== -1) {
			item.className = 'window chan';
		}
	}
}

function hl(nick, msg) {
	playSound();
	notifyMe(nick + ' : ' + msg);
}

function notifyMe(msg) {
	
	let elem = document.createElement('div');
	elem.innerHTML = msg;
	msg = elem.textContent;
	
	// Voyons si le navigateur supporte les notifications
	if (!("Notification" in window)) {
		console.log("Ce navigateur ne supporte pas les notifications desktop");
	}

	// Voyons si l'utilisateur est OK pour recevoir des notifications
	else if (Notification.permission === "granted" && msg !== '') {
		// Si c'est ok, créons une notification
		var notification = new Notification(msg);
	}

	// Sinon, nous avons besoin de la permission de l'utilisateur
	// Note : Chrome n'implémente pas la propriété statique permission
	// Donc, nous devons vérifier s'il n'y a pas 'denied' à la place de 'default'
	else if (Notification.permission !== 'denied') {
		
		Notification.requestPermission(function (permission) {

			// Quelque soit la réponse de l'utilisateur, nous nous assurons de stocker cette information
			if(!('permission' in Notification)) {
				Notification.permission = permission;
			}

			// Si l'utilisateur est OK, on crée une notification
			if (permission === "granted" && msg !== '') {
				var notification = new Notification(msg);
			}
		});
	}

	// Comme ça, si l'utlisateur a refusé toute notification, et que vous respectez ce choix,
	// il n'y a pas besoin de l'ennuyer à nouveau.
}

function playSound() {
	var audio = new Audio('HL/691.ogg');
	audio.play();
}

function html_decode(text) {
	
    var map = {
        '&amp;': '&',
        '&#038;': "&",
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&#8217;': "’",
        '&#8216;': "‘",
        '&#8211;': "–",
        '&#8212;': "—",
        '&#8230;': "…",
        '&#8221;': '”'
    };
    
    return text.replace(/\&[\w\d\#]{2,5}\;/g, function(m) { return map[m]; });
}

function urlify(text, idm, ajaxRequest, recipient) {
	
	let msg = text;
	
	let words = msg.split('&nbsp;');
	
    let urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
    
    let i = -1;
    
    words.forEach(function(item, index) {
    
		words[index] = item.replace(urlRegex, function(url) {
			
			if (ajaxRequest !== false && urlify_check === true) {
				
				i++;
				
				ajax('ajax/summary.php?url=' + url, idm, i, recipient, msg);
				
				return '<a href="' + url + '" target="_blank">' + url + '</a><i id="idm_' + idm + '_' + i + '" class="fa fa-arrow-circle-down summary_link" aria-hidden="true"></i>';
			}
			
			
			return '<a href="' + url + '" target="_blank">' + url + '</a>';
		});
	});
	
	return words.join(' ');
	
}

function ajax(urlRequest, idm, index, recipient, msg) {
	
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		
		if (this.readyState == 4 && this.status == 200) {
			
			let response = this.responseText;
			
			let result = JSON.parse(response);
			
			if (response !== 'false') {
				
				summary(result, idm, index);
				
			}
			
			let idmessage = document.getElementById('idm_' + idm + '_' + index);
			
			if (idmessage !== null) {
			
				idmessage.onclick = function() {
					
					Array.from(document.getElementsByClassName('summary')).forEach(function(item) {
						
						item.style.display = 'none';
					});
					
					let elem = document.getElementById('summ_' + idm + '_' + index);
					
					if (elem !== null) {
					
						if (elem.className.indexOf('displayblock') === -1) {
						
							elem.className += ' displayblock';
						}
						else {
							
							elem.className = 'summary';
						}
					}
					
					let activeWindow = document.getElementsByClassName('wselected')[0];
					
					if (typeof activeWindow !== 'undefined') {
					
						if (document.getElementById('border-right').style.backgroundColor !== 'red' && activeWindow.id !== 'gchanlist' && activeWindow.id !== 'status') {
							
							activeWindow.scrollTop = activeWindow.scrollHeight;
						}
					}
				}
			}
		}
		
	};

	xmlhttp.open("GET", urlRequest, true);
	xmlhttp.send();
}

function summary(result, idm, index) {
	
	let msg = document.getElementById('idmsg_' + idm);
	
	let elem = document.createElement('div');
	
	elem.className = 'summary';
	
	elem.id = 'summ_' + idm + '_' + index;
	
	let video = '';
	
	elem.innerHTML = '';
	
	if (result['youtube_id'] != '0') {
		video = '<p class="play_in_chat youtube_' + result['youtube_id'] + '">Play in chat</p>';
	}
	
	if (result['type'] === 'image') {
		elem.innerHTML += '<img src="' + result['image'] + '" alt="Image" style="display:block; margin:0 auto; max-width:70%;" />';
	}
	else {
		
		elem.innerHTML += '<p class="summary_title_w">';
		
		/*
		if (result['favicon'] != false) {
			
			elem.innerHTML += '<img class="summary_favicon" src="' + result['favicon'] + '" alt="favicon" />';
		}
		*/
		
		elem.innerHTML += ' \
			<span class="summary_title">'+ result['title'] + '</span></p> \
			<p class="summary_img_w"><img class="summary_img" src="'+ result['image'] +'" alt="image" /></p> \
			<p class="summary_desc">' + result['description'] + '</p> \
			<p class="summary_site">' + result['site_name'] + '</p> \
			' + video + ' \
		';
	}
	
	insertAfter(elem, msg);
	
	if (typeof result['youtube_id'] !== 'undefined' && result['youtube_id'] != '0') {
		Array.from(document.getElementsByClassName('youtube_' + result['youtube_id'])).forEach(function(item) {
			
			item.onclick = function() {
				youtube_link(result['youtube_id']);
			}
		});
	}
}

function youtube_link(id) {
	
	let html = ' \
		<div class="yt_ontop_wrapper" id="yt_' + id + '"> \
			<div class="yt_window"> \
				<i class="fa fa-times-circle yt_close" id="ytid_' + id +'" aria-hidden="true"></i> \
				<iframe class="yt_iframe" src="https://www.youtube.com/embed/' + id + '?autoplay=1" width="400" height="200" allowfullscreen></iframe> \
			</div> \
		</div> \
	';
	
	let recipient;
	
	if (active[0] == '#') {
		recipient = 'chan_' + ACStriped;
	}
	else {
		recipient = 'query_' + active;
	}
	
	document.getElementById(recipient).innerHTML += html;
	
	document.getElementById('ytid_' + id).onclick = function() {
		
		document.getElementById('yt_' + id).remove();
		
		Array.from(document.getElementsByClassName('play_in_chat')).forEach(function(item) {
			
			let id = item.className.split('youtube_')[1];
			
			item.onclick = function() {
				
				youtube_link(id);
			}
		});
	}
}

function insertAfter(newNode, referenceNode) {
	
	if (referenceNode !== null) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}
}

window.addEventListener("load", init, false);
