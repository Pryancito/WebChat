"use strict";

let rememberLines = [], irl = -1, tabindexstr = false, tabindex = -1, search = false, count_spaces = false, textval = false;
let chanc = 0, ccindex, cclen, cccursor, newcursor, hindex = false, hindex_iter, htag;
let numLines = 0, editbox = '', emojiSearch = '';

let favlist = getCookie('favlist');

let emojiCursor;

(function() {
	
	setTimeout(function(){
		
		loadEmojis();
		
	}, 10000);
	
	/*
	if (irc_config.list === false) {
		
		document.getElementById('btn_chanlist').style.display = 'none';
	}
	*/
	
	/*
	document.getElementById('profile').onclick = function() {
		
		document.getElementById('meet').style.display = 'block';
	}
	*/
	
	let textarea = document.getElementById('text');
	
	//emoji();
	
	//ignores_list();
	
	let msgs = document.getElementById('msgs');
	
	document.documentElement.setAttribute('lang', lang);
	
	/*
	let close_chan_params = document.getElementById('cross_chan_params');
	
	close_chan_params.onclick = function() {
		
		document.getElementById('chan_params').style.display = 'none';
	}
	*/
	
	document.getElementById('close_meet').onclick = function() {
		
		document.getElementById('meet').style.display = 'none';
	}
	
	document.getElementById('topic').ondblclick = function() {
		
		if (this.className === 'white_space_normal') {
			
			this.className = '';
			this.title = lang_topic_view;
		}
		else {
			
			this.className = 'white_space_normal';
			this.title = lang_topic_view2;
		}
		
		clearSelection()
	}
	
	let ab_tab = document.getElementsByClassName('ab_tab');
	
	Array.from(ab_tab).forEach(function(item) {
		
		item.onclick = function() {
			
			document.getElementsByClassName('ab_selected')[0].className = 'ab_tab';
			
			this.className += ' ab_selected';
			
			Array.from(document.getElementsByClassName('ab_content')).forEach(function(item) {
				item.style.display = 'none';
			});
			
			let index = Array.from(this.parentNode.children).indexOf(this);
			
			document.getElementsByClassName('ab_content')[index].style.display = 'block';
		}
	});
	
	let cp_tab = document.getElementsByClassName('cp_tab');
	
	Array.from(cp_tab).forEach(function(item) {
		
		item.onclick = function() {
			
			document.getElementsByClassName('ab_selected')[0].className = 'ab_tab';
			
			this.className += ' ab_selected';
			
			Array.from(document.getElementsByClassName('ab_content')).forEach(function(item) {
				item.style.display = 'none';
			});
			
			let index = Array.from(this.parentNode.children).indexOf(this);
			
			document.getElementsByClassName('ab_content')[index].style.display = 'block';
		}
	});
	
	let addFavChan = document.getElementById('addFavChan');
	
	addFavChan.onclick = function() {
		
		let activeChannel_lc = activeChannel.toLowerCase();
		
		if (favlist === '') {
			
			setCookie('favlist', activeChannel_lc, 10000000);
			
			let p = document.createElement('p');
			p.innerHTML = activeChannel + '<i class="fa fa-times favdel" id="fav_' + activeChannel_lc.substring(1) + '"></i><i class="fa fa-sign-in favjoin" id="fav_' + activeChannel_lc.substring(1) + '" aria-hidden="true"></i>';
			document.getElementById('favlist_content').appendChild(p);
			
			addFavEvents();
		}
		else {
			
			if (favlist.indexOf(activeChannel_lc) === -1) {
				
				favlist += ',' + activeChannel_lc;
				
				setCookie('favlist', favlist, 10000000);
				
				let p = document.createElement('p');
				p.innerHTML = activeChannel + '<i class="fa fa-times favdel" id="fav_' + activeChannel_lc.substring(1) + '"></i><i class="fa fa-sign-in favjoin" id="fav_' + activeChannel_lc.substring(1) + '" aria-hidden="true"></i>';
				document.getElementById('favlist_content').appendChild(p);
				
				addFavEvents();
			}
		}
		
		let fav_default = document.getElementById('favlist_default');
		
		if (fav_default !== null) {
			fav_default.style.display = 'none';
		}
		
		let fc = document.getElementById('fc_' + activeChannel_lc.substring(1));
		
		if (typeof fc !== 'undefined') {
			fc.className = 'fa fa-star favinfo favchecked';
		}
	}
	
	msgs.onclick = function() {
		
		document.execCommand('copy');
		
		textarea.focus();
	}
	
	let gchanlist_evt = document.getElementById('btn_chanlist');
	
	gchanlist_evt.onclick = function() {
		
		document.getElementById('topic').innerHTML = '';
		
		gchanlist_window();
		
		doSend('list');
	}
	
	notifyMe('');
	
	textarea.focus();
	
	let nltosp = document.getElementById('btn_nltosp');
	
	textarea.onpaste = function(e) {
		// cancel paste
		e.preventDefault();

		// get text representation of clipboard
		var text = e.clipboardData.getData("text/plain");

		// insert text manually
		
		document.execCommand("insertText", false, text);
	}
	
	nltosp.onclick = function() {
		
		let lines = Array.from(textarea.getElementsByTagName('div'))
		let result = '';
		
		if (lines.length === 0) {
			
			lines = Array.from(textarea.getElementsByTagName('p'));
			textarea.innerHTML = textarea.innerHTML.replace(/<br\s*[\/]?>/gi, ' ');
			expandTextarea(textarea);
			textarea.focus();
		}
		else {
			
			lines.forEach(function(item, index) {
				
				result += item.innerText + ' ';
			});
			
			textarea.innerHTML = textarea.childNodes[0].nodeValue + ' ' + result;
			
			expandTextarea(textarea);
			textarea.focus();
		}
	}
	
	textarea.oninput = function() {
		
		emojiCursor = getCaretCharacterOffsetWithin(this);
		
		expandTextarea(this);
	}
	
	let checkKeyCode = false, s = '';
	
	textarea.onkeyup = function(e) {
		
		if (checkKeyCode === 191) {
			
			checkKeyCode = true;
			
			emojiSearch = '';
		}
		
		if (e.keyCode == 191) {
			
			checkKeyCode = 191;
		}
		else if (checkKeyCode !== true || e.keyCode == 32) {
			
			checkKeyCode = false;
		}
		/*
		else if (checkKeyCode === true && e.keyCode !== 8) {
			
			bubble2.style.display = 'inline-block';
			
			Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
			
			let se = document.getElementById('search_emoji');
			
			emojiSearch += String.fromCharCode(e.keyCode).toLowerCase();
			
			se.value = emojiSearch;
			
			search_emoji(emojiSearch);
		}
		*/
	}
	
	textarea.onkeydown = function(e) {
		
		let elem = e.currentTarget;
		
		if (e.keyCode == 13) { // enter key
			
			e.preventDefault();
			
			if (elem.innerHTML && rememberLines.length < 31) {
				
				rememberLines.unshift( elem.innerHTML );
				
				irl = -1;
			}
			
			send();
			
			expandTextarea(this);
		}
		
		if (e.code === 'F4') {
			
			bubble2.style.display = 'inline-block';
			
			Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
			
			document.getElementById('search_emoji').focus();
		}
		
		// nick and chan completion :
		if (e.keyCode == 9) { // tabulation
			
			e.preventDefault();
			
			let AC = ACStriped.toLowerCase();
			
			uls_no_mode[ AC ].sort();
			
			let cursor = getCaretPosition(elem, true)[0];
			
			if (hashtag(elem.innerHTML.substr(0, cursor), cursor) !== false || chanc > 0 && cursor === newcursor) { // chan completion
				
				if (typeof htag === 'undefined' || htag !== '' || cursor !== newcursor) {
					
					htag = hashtag(elem.innerHTML.substr(0, cursor), cursor).replace(/<br\s*[\/]?>/gi, '');
				}
				
				if (htag !== false && htag !== '' && cursor !== cccursor || cursor !== newcursor && htag === '') {
					
					chanc = 0;
					ccindex = false;
					cclen = false;
					cccursor = false;
					hindex = false;
					newcursor = false;
				}
				
				let chans = Object.keys(uls_no_mode);
				
				if (chanc === 0) {
					
					if (htag === '') {
						
						elem.innerHTML = elem.innerHTML.replace(/<br\s*[\/]?>/gi, '');
						
						elem.innerHTML = elem.innerHTML.substring(0, cursor) + ACStriped + elem.innerHTML.substring(cursor);
						let pos = cursor + ACStriped.length;
						
						setCaretPos(pos);
						
						cccursor = cursor;
						newcursor = getCaretPosition(elem, true)[0];
						cclen = ACStriped.length;
					}
					else {
						
						cccursor = cursor;
						newcursor = getCaretPosition(elem, true)[0];
						
						if (hindex === false) {
						
							hindex = [];
							
							chans.forEach(function(item, index) {
								if (item.substring(0, htag.length).toLowerCase() === htag.toLowerCase()) {
									hindex.push(index);
								}
							});
							
							hindex_iter = hindex.entries();
						}
						
						let index = hindex_iter.next().value;
						
						if (hindex_iter.next().done === true) {
							hindex_iter = hindex.entries();
							index = hindex_iter.next().value;
						}
						
						if (typeof index !== 'undefined') {
							
							cclen = chans[ index[1] ].length;
							
							elem.innerHTML = elem.innerHTML.substring(0, cccursor - htag.length) + chans[ index[1] ] + elem.innerHTML.substring(cccursor + cclen);
							let pos = cccursor + chans[ index[1] ].length;
							
							setCaretPos(pos);
							
							newcursor = getCaretPosition(elem, true)[0];
						}
					}
				}
				else {
					
					if (htag === '') {
						
						if (chanc === 1) {
							ccindex = chans.indexOf(ACStriped);
						}
						
						ccindex++;
						if (ccindex === chans.length) {
							ccindex = 0;
						}
						
						elem.innerHTML = elem.innerHTML.substring(0, cccursor) + chans[ ccindex ] + elem.innerHTML.substring(cccursor + cclen);
						let pos = cccursor + chans[ ccindex ].length;
						setCaretPos(pos);
						
						cclen = chans[ ccindex ].length;
						
						newcursor = getCaretPosition(elem, true)[0];
					}
					else {
						
						cccursor = cursor;
						newcursor = getCaretPosition(elem, true)[0];
						
						if (hindex === false) {
						
							hindex = [];
							
							chans.forEach(function(item, index) {
								if (item.substr(0, htag.length).toLowerCase() === htag.toLowerCase()) {
									hindex.push(index);
								}
							});
							
							hindex_iter = hindex.entries();
						}
						
						let index = hindex_iter.next().value;
						
						if (hindex_iter.next().done === true) {
							hindex_iter = hindex.entries();
							index = hindex_iter.next().value;
						}
						
						if (typeof index !== 'undefined') {
							
							cclen = chans[ index[1] ].length;
							
							elem.innerHTML = elem.innerHTML.substring(0, cccursor - htag.length) + chans[ index[1] ] + elem.innerHTML.substring(cccursor + cclen);
							let pos = cccursor + chans[ index[1] ].length;
							setCaretPos(pos);
							
							newcursor = getCaretPosition(elem, true)[0];
						}
					}
				}
				chanc++;
			}
			
			else if (hashtag(elem.innerHTML.substr(0, cursor), cursor) === false) { // nick completion
				
				chanc = 0;
				ccindex = 'undefined';
				cclen = 'undefined';
				cccursor = 'undefined';
				hindex = false;
				newcursor = 'undefined';
				
				if (search !== false) {
					
					textval = elem.innerHTML;
					
					let val = textval.substr(0, cursor);
					
					let newsearch = val.split(' ');
					
					count_spaces = newsearch.length - 1;
					
					newsearch = newsearch[ count_spaces ];
					
					if (search.toLowerCase() != newsearch.substr(0, search.length).toLowerCase() && newsearch.indexOf(uls_no_mode[ AC ]) === -1) {
						
						tabindexstr = false;
						tabindex = -1;
						search = newsearch.replace(/<br\s*[\/]?>/gi, '');
					}
				}
				else {
					
					textval = elem.innerHTML;
					
					let val = textval.substr(0, cursor);
					
					search = val.split(' ');
					
					count_spaces = search.length - 1;
					
					search = search[ count_spaces ].replace(/<br\s*[\/]?>/gi, '');
					
					tabindex = -1;
				}
				
				tabindex++;
				
				if (tabindexstr === false) {
					
					tabindexstr = [];
					
					uls_no_mode[ AC ].forEach(function(item, index) {
						
						if (item.substring(0, search.length).toLowerCase() == search.toLowerCase() || item.substring(0, search.length) == '') {
							tabindexstr.push(index);
						}
					});
				}
				
				if (tabindex >= tabindexstr.length) {
					tabindex = 0;
				}
				
				if (typeof uls_no_mode[ AC ][ tabindexstr[ tabindex ] ] !== 'undefined') {
					
					let val = textval.split(' ');
					
					val[ count_spaces ] = uls_no_mode[ AC ][ tabindexstr[ tabindex ] ];
					
					elem.innerHTML = val.join(' ');
					
					let pos = cursor + uls_no_mode[ AC ][ tabindexstr[ tabindex ] ].length - search.length;
					
					setCaretPos(pos);
				}
			}
			
			expandTextarea(textarea);
			
			setTimeout(function(){ setEndOfContenteditable( elem ); }, 0);
		}
		
		// To remind text entered :
		
		if (e.keyCode == 40) { // down arrow
			
			if (elem.innerHTML !== '') {
				
				if (rememberLines.indexOf( elem.innerHTML ) === -1) {
					
					if (rememberLines.length > 500) {
						
						rememberLines.pop();
					}
					
					rememberLines.unshift( elem.innerHTML );
					irl = -1;
					elem.innerHTML = '';
					return;
				}
				
				if (typeof rememberLines[ irl - 1 ] !== 'undefined') {
					
					irl--;
					elem.innerHTML = rememberLines[ irl ];
					setTimeout(function(){ setEndOfContenteditable( elem ); }, 0);
				}
				else {
					
					irl = -1;
					elem.innerHTML = '';
				}
			}
			
			expandTextarea(textarea);
		}
		
		if (e.keyCode == 38) { // up arrow
			
			if (elem.innerHTML !== '') {
					
				if (rememberLines.indexOf( elem.innerHTML ) === -1) {
					
					if (rememberLines.length > 500) {
						
						rememberLines.pop();
					}
					
					rememberLines.unshift( elem.innerHTML );
					irl = 0;
					elem.innerHTML = '';
				}
			}
		
			irl++;
			
			if (irl == rememberLines.length) {
				irl = 0;
			}
			
			if (typeof rememberLines[ irl ] !== 'undefined') {
				
				elem.innerHTML = rememberLines[ irl ];
				setTimeout(function(){ setEndOfContenteditable( elem ); }, 0);
			}
			
			expandTextarea(textarea);
		}
	}
	
	let border_left = document.getElementById('border-left');
	let chanlist = document.getElementById('chanlist');
	
	let cqlist = document.getElementById('cqlist');
	
	/*
	border_left.ondrag = function(e) {
		cqlist.style.width = e.pageX + 'px';
	}
	border_left.ondragend = function(e) {
		cqlist.style.width = e.pageX + 'px';
	}
	*/
	
	let border_right = document.getElementById('border-right');
	let userlist = document.getElementById('userlist');
	
	/*
	border_right.ondrag = function(e) {
		userlist.style.width = document.body.offsetWidth - e.pageX + 'px';
	}
	border_right.ondragend = function(e) {
		userlist.style.width = document.body.offsetWidth - e.pageX + 'px';
	}
	*/

	let elemDragged;

	border_left.onmousedown = function() {
		elemDragged = this.id;
	}
	border_right.onmousedown = function() {
		elemDragged = this.id;
	}

	document.addEventListener("dragend", function( e ) {
		
		if (elemDragged === 'border-right') {
			userlist.style.width = document.body.offsetWidth - e.clientX + 'px';
		}
		else if (elemDragged === 'border-left') {
			cqlist.style.width = e.clientX + 'px';
		}
		
		scrollBottom(document.getElementsByClassName('wselected')[0]);
	});
	
	/* (A GARDER) Event for video conference 
	let visio = document.getElementById('btn_visio');
	
	visio.onclick = function(e) {
		
		let visio = e.currentTarget;
		if (visio.classList.contains('fa-eye')) {
			visio.setAttribute('class', 'fa fa-eye-slash');
			visio.setAttribute('title', 'Wait for video conference');
		}
		else {
			visio.setAttribute('class', 'fa fa-eye');
			visio.setAttribute('title', 'Don\'t wait for video conference');
		}
	}
	*/
	
	let bubble = document.getElementById('bubble');
	
	bubble.onclick = function(e) {
		e.stopPropagation();
	}
	
	let bubble2 = document.getElementById('bubble2');
	
	document.body.onclick = function(e) {   //when the document body is clicked
		
		bubble.style.display = 'none';
		
		if (window.event) {
			e = event.srcElement;           //assign the element clicked to e (IE 6-8)
		}
		else {
			e = e.target;                   //assign the element clicked to e
		}
		
		if (e.parentNode.parentNode.id !== 'bubble2') {
			bubble2.style.display = 'none';
		}

		if (e.className && e.className.indexOf('btn_window') !== -1) {
			
			Array.from(document.getElementsByClassName('summary')).forEach(function(item) {
				
				item.className = 'summary';
			});
			
			document.getElementById('editbox').style.display = 'block';
			
			document.getElementById('loader').style.display = 'none';
			
			let btn_window = document.getElementsByClassName('btn_window');
			
			let index = Array.from(btn_window).indexOf(e);
			
			Array.from( btn_window ).forEach(function(item) {
				
				if (item.className.indexOf('red') !== -1) {
					
					item.className = 'btn_window red';
				}
				else {
					
					item.className = 'btn_window';
				}
			});
			e.className += ' btn_selected';
			
			let windows = document.getElementsByClassName('window');
			
			Array.from( windows ).forEach( closeAllWindows );
			
			windows.item(index + 1).className += ' wselected';
			
			if (windows.item(index + 1).id !== 'status') {
				
				let target = windows.item(index + 1).id.split('_');
				
				if (target[0] == 'chan') {
					
					if (windows.item(index + 1).scrollHeight !== windows.item(index + 1).offsetHeight + windows.item(index + 1).scrollTop) {
						
						document.getElementsByClassName('wselected')[0].classList.add('black');
					}
					else {
						document.getElementsByClassName('wselected')[0].classList.remove('black');
					}
					
					activeChannel = '#' + target[1];
					ACStriped = target[1].toLowerCase();
					active = activeChannel.toLowerCase();
					activeType = 'channel';
					
					let chanspHTML = activeChannel.replace(/\/g, '<').toLowerCase();
					
					chanspHTML = chanspHTML.replace(/\/g, '>');
					
					doSend('names ' + chanspHTML);
					
					let chanspNoHTML = ACStriped.replace(/\/g, '<');
					
					chanspNoHTML = chanspNoHTML.replace(/\/g, '>');
					
					ACStriped = chanspNoHTML;
					
					let chan_topic = document.getElementById('chan_topic_' + chanspNoHTML);
					
					if (chan_topic === null) {
						
						doSend('topic ' + chanspHTML);
					}
					else {
						
						let cts = document.getElementsByClassName('ct_selected');
						
						if (cts.length !== 0) {
							cts[0].className = 'chan_topic';
						}
						
						chan_topic.className = 'chan_topic ct_selected';
					}
					
					Array.from(document.getElementsByClassName('ul')).forEach(function(item) {
						
						if (item.className.indexOf('ul_hidden') === -1) {
							
							item.className += ' ul_hidden';
						}
					});
					
					document.getElementById('ul_' + ACStriped).className = 'ul';
					
					document.getElementById('userlist').className = '';
					
					document.getElementById('chan_btn_' + ACStriped).className = 'btn_window btn_selected';
					
					let border_right = document.getElementById('border-right');
					border_right.style.height = userlist.scrollHeight + 'px';
					
					//scrollBottom(windows.item(index + 1));
					
				}
				else if (target[0] == 'query') {
					
					active = target[1].toLowerCase();
					activeType = 'query';
					activeQuery = target[1];
					
					document.getElementById(e.id).className = 'btn_window btn_selected';
					
					document.getElementById('topic').innerHTML = '';
					document.getElementById('userlist').className = 'displaynone';
				}
				
				textarea.focus();
			}
			else {
				
				document.getElementById('topic').innerHTML = '';
				document.getElementById('userlist').className = 'displaynone';
			}
			
			windows.item(index + 1).scrollTop = windows.item(index + 1).scrollHeight;
			
			expandTextarea(textarea);
		}
		
		if (e.className.indexOf('nlnick') === -1 && document.getElementsByClassName('nick_options').length !== 0) {
			
			document.getElementsByClassName('nick_options')[0].remove();
			
			Array.from(document.getElementsByClassName('nlnick')).forEach(function(item) {
				
				if (item.style.backgroundColor == 'white') {
					
					item.style.backgroundColor = 'transparent';
				}
			});
		}
	}
	
	/*
	let btn_connect = document.getElementById('btn_connect');
	
	btn_connect.onclick = function(e) {
		
		e.stopPropagation();
		
		bubble.style.marginLeft = '12px';
		bubble.style.display = 'inline-block';
		Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
		document.getElementById('connect').style.setProperty('display', 'block');
	}
	*/
	
	let btn_add_chan = document.getElementById('btn_add_chan');
	
	btn_add_chan.onclick = function(e) {
		
		e.stopPropagation();
		
		bubble.style.marginLeft = 24 * 2 - 18 + 'px';
		bubble.style.display = 'inline-block';
		Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
		bubble2.style.display = 'none';
		document.getElementById('addchan').style.setProperty('display', 'block');
		
		document.getElementById('newchan').focus();
	}
	
	let btn_emoji = document.getElementById('emoji');
	
	btn_emoji.onclick = function(e) {
		
		e.stopPropagation();
		
		bubble2.style.display = 'inline-block';
		
		Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
		
		document.getElementById('search_emoji').focus();
	}
	
	document.getElementById('send_options').onmousedown = function(e) {
		
		e.preventDefault();
	}

	bubble2.onmousedown = function (ev) { ev.preventDefault(); }
	// ^ preventDefault() sur onmousedown appelé afin de ne pas perdre le focus lors du click
	bubble2.onclick = function (ev) {

		if (Node.ELEMENT_NODE === ev.target.nodeType)
		{
		   if ('img' === ev.target.nodeName.toLowerCase())
		   {
			  var parent = document.createElement('span');
			  var node = ev.target.cloneNode(false);
			  parent.appendChild(node);
			  parent.innerHTML += '&nbsp;';
			  //node.className = 'InlineBlock chatemoji';

			  var s = window.getSelection();
			  if ( 0 !== s.rangeCount )
			  {
				 var r0 = s.getRangeAt(0);
				 if ( (r0.startContainer === text || 0 !== (text.compareDocumentPosition(r0.startContainer) & Node.DOCUMENT_POSITION_CONTAINED_BY)) &&
					(r0.endContainer === text || 0 !== (text.compareDocumentPosition(r0.endContainer) & Node.DOCUMENT_POSITION_CONTAINED_BY)) )
				 {
					s.removeAllRanges();
					//var node = twemoji.parse(
					//   document.createTextNode(ev.target.alt), 
					//      {className: 'InlineBlock topemoji'} );
					r0.deleteContents();
					r0.insertNode(parent);
					r0.collapse(false);
					s.addRange(r0);
					return;
				 }
			  }
				
			  text.appendChild(node);
		   }
		}
		
		expandTextarea(textarea);
	};
	
	let btn_favorites_chans = document.getElementById('btn_favorites_chans');
	
	btn_favorites_chans.onclick = function(e) {
		
		e.stopPropagation();
		
		bubble.style.marginLeft = 24 * 3 - 5 + 'px';
		bubble.style.display = 'inline-block';
		Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
		bubble2.style.display = 'none';
		document.getElementById('favchans').style.setProperty('display', 'block');
		
		let fav_default = document.getElementById('favlist_default');
		
		if (fav_default !== null && favlist != null) {
			fav_default.style.display = 'none';
		}
		
		if (favlist != [""]) {
			
			document.getElementById('favlist_content').innerHTML = '';
			
			favlist.split(',').forEach(function(item, index) {
				
				let p = document.createElement('p');
				p.innerHTML = item + '<i class="fa fa-times favdel" id="fav_' + item.substring(1) + '"></i><i class="fa fa-sign-in favjoin" id="fav_' + item.substring(1) + '" aria-hidden="true"></i>';
				document.getElementById('favlist_content').appendChild(p);
			});
		}
		else {
			fav_default.style.display = 'block';
		}
		
		addFavEvents();
	}
	
	let newchan = document.getElementById('create_newchan');
	
	newchan.onclick = function() {
		
		let chan = document.getElementById('newchan').value;
		
		if (chan[0] !== '#') {
			chan = '#' + chan;
		}
		
		doSend('join ' + chan);
		
		document.getElementById('bubble').style.setProperty('display', 'none');
	}
	
	/*
	let btn_address_book = document.getElementById('btn_address_book');
	
	btn_address_book.onclick = function(e) {
		
		e.stopPropagation();
		
		bubble.style.marginLeft = 5 + 127 + 'px';
		bubble.style.display = 'inline-block';
		document.getElementById('addressbook').style.display = 'block';
	}
	*/
	
	/*
	let btn_summary = document.getElementById('btn_summary');
	btn_summary.onclick = function() {
		this.style.backgroundColor == 'white' ? this.style.backgroundColor = 'transparent' : this.style.backgroundColor = 'white';
	}
	*/
	
	/*
	let addressbook = document.getElementById('btn_address_book');
	
	addressbook.onclick = function(e) {
		
		e.stopPropagation();
		
		bubble.style.marginLeft = '164px';
		bubble.style.display = 'inline-block';
		
		Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
		
		document.getElementById('chan_params').style.display = 'none';
		
		document.getElementById('addressbook').style.display = 'block';
	}
	*/
	
	function closeContentBubble(item, index) {
		item.style.setProperty('display', 'none');
	}
	
	window.onbeforeunload = function () {
		
		return lang_leave_warning;
		
		//doSend('QUIT :Quit :)');
	}
	
	init();
	
	connectWebSocket();
	
})();

async function loadEmojis() {
	
	let response = await fetch('emoji.html');
		
	if(response.status != 200) {
		throw new Error("Server Error");
	}
		
	// read response stream as text
	let text_data = await response.text();
	
	let elem = document.getElementById('bubble2');
	elem.innerHTML = '<input id="search_emoji" type="text" placeholder="' + lang_search_emoji + '" />';
	elem.innerHTML += text_data;
	
	document.getElementById('search_emoji').onclick = function(e) {
		
		e.stopPropagation();
		
		this.focus();
	}
	
	document.getElementById('text').onclick = function(e) {
		
		e.stopPropagation();
	}
	
	document.getElementById('search_emoji').onkeyup = function() {
		
		search_emoji(this.value);
	}
};

function emoji() {
	
	let elem = document.getElementById('bubble2');
	
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", './emoji-v12.txt', false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                let text = rawFile.responseText;
                
                let lines = text.match(/(.*)\n/gim);
                
                lines.forEach(function(item, index) {
					
					if (item !== undefined) {
					
						if (item.indexOf('# subgroup:') === -1) {
							
							let code = item.split('#');
							
							if (code[1] !== undefined) {
								
								code = code[1].split(' ');
							}
							
							let c = twemoji.parse(code[1]);
												
							let name = code.splice(2).join('');
							
							if (index % 10 === 0 && index !== 0) {
								
								elem.innerHTML += '<br />';
							}
							
							elem.innerHTML += '<span id="' + code[1] + '" class="emoji ' + name + '" title=":' + name + ':">' + c + '</span>';
						}
						else {
							
							elem.innerHTML += '<hr />';
						}
					}
				});
            }
        }
    }
	
	rawFile.send(null);
}

var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

function hashtag(text, cursor) {
	
	let c = cursor;
	
	for (var i=c; i >= 0; i--) {
		
		let char = text.substr(i, 1);
		
		if (char === ' ') {
			return false;
		}
		if (char === '#') {
			return text.substr(i+1, c) || '';
		}
	}
	
	return false;
}

function expandTextarea(obj) {
	
	obj.style.height = '23px';
	let linesHeight = obj.scrollHeight - 10;
	numLines = linesHeight / 23;
	
	let w = document.getElementsByClassName('wselected')[0];
	
	let weight;
	
	if (numLines <= 6) {
		
		obj.style.height = linesHeight + 'px';
		obj.style.overflowY = 'hidden';
		
		weight = 44 + linesHeight;
	}
	else {
		
		obj.style.height = 6 * 23 + 'px';
		obj.style.overflowY = 'auto';
		
		weight = 55 + 6 * 23;
	}
	
	w.style.height = 'calc(100% - ' + weight + 'px)';
	
	w.scrollTop = w.scrollHeight;
}

function getCaretPosition(editableDiv, tab) {

	let caretPos = 0, sel, range;

	if (document.getSelection) {

		sel = document.getSelection();

		if (sel.rangeCount) {

			range = sel.getRangeAt(0);

			let len = editableDiv.innerHTML.replace(/<br\s*[\/]?>/gi, '').length;

			if (tab === true) {
				caretPos = [ range.startOffset + (len - range.startOffset), range.endOffset + (len - range.startOffset), range.commonAncestorContainer.parentNode ];
			}
			else {

				caretPos = [ range.startOffset, range.endOffset, range.commonAncestorContainer.parentNode, range.commonAncestorContainer ];
			}
		}
	}
	return caretPos;
}

function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type != "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}

/*
function setCaretPos(pos) {
	
	let content = document.getElementById('text');
	let node = nodeSelect(content.childNodes, pos);
	
	if (document.selection) { // IE
		let sel = document.selection.createRange();
		sel.moveStart('character', node[1]);
		sel.select();
	}
	else {
		let sel = document.getSelection();
		sel.collapse(node[0], node[1]);
	}
	
	content.focus();
}
*/

function setCaretPos(pos) {
	
	var el = document.getElementById("text");
	var range = document.createRange();
	var sel = window.getSelection();
	range.setStart(el.childNodes[0], 2);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
	el.focus();
}

function nodeSelect(childNodes, pos) {
	
	let count = 0, oldCount = 0, result = false, BreakException = {};
	
	childNodes.forEach(function(item, index) {
		
		if (typeof item.outerHTML !== 'undefined') {
			count += item.outerHTML.length;
		}
		else {
			count += item.nodeValue.length;
		}
		
		if (count >= pos) {
			result = [ childNodes[index], pos - oldCount ];
		}
		else {
			oldCount = count;
		}
	});
	
	return result;
}

function setEndOfContenteditable(contentEditableElement) {
	
    var range,selection;
    if(document.createRange) {//Firefox, Chrome, Opera, Safari, IE 9+
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection) { //IE 8 and lower
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

function index(element){
    var sib = element.parentNode.childNodes;
    var n = 0;
    for (var i=0; i<sib.length; i++) {
         if (sib[i]==element) return n;
         if (sib[i].nodeType==1) n++;
    }
    return -1; 
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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

function addFavEvents() {
	
	let favjoins = Array.from(document.getElementsByClassName('favjoin'));
	
	favjoins.forEach(function(item, index) {
		
		item.onclick = function() {
			let chan = item.id.substring(4);
			doSend('join #' + chan);
			bubble.style.display = 'none';
		}
	});
	
	let favdel = Array.from(document.getElementsByClassName('favdel'));
	
	favdel.forEach(function(item, index) {
		
		item.onclick = function() {
			
			let chan = item.id.substring(4);
			
			item.parentNode.remove();
			
			favdelfct(chan);
			
			let elem = document.getElementById('fc_' + chan);
			
			elem.classList.toggle('favchecked');
			
			elem.classList.replace('fa-star', 'fa-star-o');
		}
	});
}

function favdelfct(chan) {
	
	let index = favlist.split(',').indexOf('#' + chan);
	let fl = favlist.split(',');
	fl.splice(index, 1);
	favlist = fl.join(',');
	setCookie('favlist', favlist, 10000000);
	
	if (favlist === '') {
		let elem = document.getElementById('favlist_default');
		
		if (typeof elem !== 'undefined') {
			elem.style.display = 'block';
		}
	}
}

function addFavInfoEvents() {
	
	let favinfo = document.getElementsByClassName('favinfo');
	
	Array.from(favinfo).forEach(function(item, index) {
		
		item.onclick = function(e) {
			
			e.stopPropagation();
			
			let chansp = item.id.substring(3).toLowerCase();
			let chan = '#' + chansp.toLowerCase();
			
			let elem = document.getElementById(item.id);
			
			elem.classList.toggle('favchecked');
			
			if (elem.classList.value.indexOf('fa-star-o') === -1) { // Retrait du salon par le bouton du salon
				
				elem.classList.replace('fa-star', 'fa-star-o');
				
				favdelfct(chansp);
				
				document.getElementById('fav_' + chansp).parentNode.remove();
			}
			else { // Ajout du salon par le bouton du salon
				
				elem.classList.replace('fa-star-o', 'fa-star');
				
				if (favlist === '') {
					
					favlist = chan;
					
					setCookie('favlist', chan, 10000000);
					
					let p = document.createElement('p');
					p.innerHTML = chan + '<i class="fa fa-times favdel" id="fav_' + chansp + '"></i><i class="fa fa-sign-in favjoin" id="fav_' + chansp + '" aria-hidden="true"></i>';
					document.getElementById('favlist_content').appendChild(p);
					
					addFavEvents();
				}
				else {
					
					favlist += ',' + chan;
					
					setCookie('favlist', favlist, 10000000);
					
					let p = document.createElement('p');
					p.innerHTML = chan + '<i class="fa fa-times favdel" id="fav_' + chansp + '"></i><i class="fa fa-sign-in favjoin" id="fav_' + chansp + '" aria-hidden="true"></i>';
					document.getElementById('favlist_content').appendChild(p);
					
					addFavEvents();
				}
				
				let fav_default = document.getElementById('favlist_default');
				
				if (fav_default !== null) {
					fav_default.style.display = 'none';
				}
			}
		}
	});
}

function clearSelection() {
	
	if (window.getSelection) {
		
		window.getSelection().removeAllRanges();
	}
	else if (document.selection) {
		
		document.selection.empty();
	}
}

function gchanlist_window() {
	
	document.getElementById('userlist').className = 'displaynone';
	document.getElementById('editbox').style.display = 'none';
	
	let window = document.getElementsByClassName('wselected')[0];
	if (typeof window !== 'undefined') {
		window.className = window.className.replace(/\bwselected\b/g, '');
	}
	
	let btn_window = document.getElementsByClassName('btn_selected')[0];
	if (typeof btn_window !== 'undefined') {
		btn_window.className = btn_window.className.replace(/\bbtn_selected\b/g, '');
	}
	
	document.getElementById('gchanlist').className += ' wselected';
}

function search_emoji(s) {
	
	let emojis = document.querySelectorAll('#bubble2 span.emoji');
	
	Array.from(emojis).forEach(function(item) {
		
		if (item.getAttribute('title').toLowerCase().indexOf( s.toLowerCase() ) === -1) {
			
			item.style.display = 'none';
		}
		else {
			
			item.style.display = 'inline-block';
		}
	});
}
