"use strict";

let rememberLines = [], irl = -1, tabindexstr = false, tabindex = -1, search = false, count_spaces = false, textval = false;
let chanc = 0, ccindex, cclen, cccursor, newcursor, hindex = false, hindex_iter, htag;
let numLines = 0, editbox = '';

let favlist = getCookie('favlist');

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
		
		weight = 55 + linesHeight;
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
      
      preCaretRange.setStart(range.startContainer, range.startOffset);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      
      caretOffset = [ preCaretRange.startOffset, preCaretRange.endOffset, preCaretRange ];
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
			
			let chansp = item.id.substring(3);
			let chan = '#' + chansp;
			
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

(function() {
	
	ignores_list();
	
	let msgs = document.getElementById('msgs');
	
	document.documentElement.setAttribute('lang', lang);
	
	/*
	let close_chan_params = document.getElementById('cross_chan_params');
	
	close_chan_params.onclick = function() {
		
		document.getElementById('chan_params').style.display = 'none';
	}
	*/
	
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
				
		if (favlist === '') {
			
			setCookie('favlist', activeChannel, 10000000);
			
			let p = document.createElement('p');
			p.innerHTML = activeChannel + '<i class="fa fa-times favdel" id="fav_' + activeChannel.substring(1) + '"></i><i class="fa fa-sign-in favjoin" id="fav_' + activeChannel.substring(1) + '" aria-hidden="true"></i>';
			document.getElementById('favlist_content').appendChild(p);
			
			addFavEvents();
		}
		else {
			
			if (favlist.indexOf(activeChannel) === -1) {
				
				favlist += ',' + activeChannel;
				
				setCookie('favlist', favlist, 10000000);
				
				let p = document.createElement('p');
				p.innerHTML = activeChannel + '<i class="fa fa-times favdel" id="fav_' + activeChannel.substring(1) + '"></i><i class="fa fa-sign-in favjoin" id="fav_' + activeChannel.substring(1) + '" aria-hidden="true"></i>';
				document.getElementById('favlist_content').appendChild(p);
				
				addFavEvents();
			}
		}
		
		let fav_default = document.getElementById('favlist_default');
		
		if (fav_default !== null) {
			fav_default.style.display = 'none';
		}
		
		let fc = document.getElementById('fc_' + activeChannel.substring(1));
		
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
	
	let textarea = document.getElementById('text');
	
	textarea.focus();
	textarea.style.border = '4px solid #A6ACAF';
	
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
	
	/*
	let bold = document.getElementById('btn_bold');
	
	bold.onmousedown = function() {
		
		let cursor = getCaretPosition(textarea);
		
		console.log(cursor);
		
		if (cursor !== 0) {
			
			let text = textarea.innerHTML;
			
			if (cursor[2].nodeName !== 'STRONG' && cursor[2].id == 'text') {
			
				if (cursor[0] === cursor[1]) {
					textarea.innerHTML = text.substring(0, cursor[0]) + '<strong>' + text.substring(cursor[0]) + '</strong>';
				}
				else {
					
					let c0 = cursor[0];
					let c1 = cursor[1];
					
					if (text.indexOf('<strong>') === -1 || text.indexOf('<strong>') < cursor[1]) {
						c0 = cursor[0] + text.length - cursor[3].length;
						c1 = cursor[1] + text.length - cursor[3].length;
					}
					
					textarea.innerHTML = '<span>' + text.substring(0, c0) + '</span><strong>' + text.substring(c0, c1) + '</strong><span>' + text.substring(c1) + '</span>';
				}
			}
			else if (cursor[2].id === 'editbox' || cursor[2].nodeName === 'STRONG') {
				
				if (cursor[2].nodeName === 'STRONG') {
					
				}
				
				textarea.innerHTML += '&zwnj;';
			}
		}
	}
	
	bold.onclick = function() {
		
		setEndOfContenteditable( textarea );
		
		textarea.focus();
	}
	
	let bold = document.getElementById('btn_bold');
	
	bold.onmousedown = function() {
		
		let text;
		
		if (editbox === '') {
			text = textarea.innerText;
		}
		else {
			text = editbox;
		}
		
		let cursor = getCaretCharacterOffsetWithin( textarea );
		
		console.log(cursor);
		
		if (cursor[0] === cursor[1]) {
			
			editbox = text.substring(0, cursor[0]) + '' + text.substring(cursor[0]);
			textarea.innerHTML = style( editbox );
		}
		else {
			editbox = text.substring(0, cursor[0]) + '' + text.substring(cursor[0], cursor[1]) + '' + text.substring(cursor[1]);
			textarea.innerHTML = style( editbox );
		}
	}
	
	bold.onclick = function() {
		
		setEndOfContenteditable( textarea );
		
		textarea.focus();
	}
	*/
	
	textarea.oninput = function() {
		
		expandTextarea(this);
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
		
		// nick and chan completion :
		if (e.keyCode == 9) { // tabulation
			
			e.preventDefault();
			
			uls_no_mode[ ACStriped ].sort();
			
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
					
					if (search.toLowerCase() != newsearch.substr(0, search.length).toLowerCase() && newsearch.indexOf(uls_no_mode[ ACStriped ]) === -1) {
						
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
					
					uls_no_mode[ ACStriped ].forEach(function(item, index) {
						
						if (item.substring(0, search.length).toLowerCase() == search.toLowerCase() || item.substring(0, search.length) == '') {
							tabindexstr.push(index);
						}
					});
				}
				
				if (tabindex >= tabindexstr.length) {
					tabindex = 0;
				}
				
				if (typeof uls_no_mode[ ACStriped ][ tabindexstr[ tabindex ] ] !== 'undefined') {
					
					let val = textval.split(' ');
					
					val[ count_spaces ] = uls_no_mode[ ACStriped ][ tabindexstr[ tabindex ] ];
					
					elem.innerHTML = val.join(' ');
					
					let pos = cursor + uls_no_mode[ ACStriped ][ tabindexstr[ tabindex ] ].length - search.length;
					
					setCaretPos(pos);
				}
			}
			
			expandTextarea(textarea);
			
			setTimeout(function(){ setEndOfContenteditable( elem ); }, 0);
		}
		
		// To remind text entered :
		
		if (e.keyCode == 40) { // down arrow
			
			if (elem.innerHTML !== '' && rememberLines.length < 31) {
				
				if (rememberLines.indexOf( elem.innerHTML ) === -1) {
					
					rememberLines.unshift( elem.innerHTML );
					irl = -1;
					elem.innerHTML = '';
					return;
				}
				
				if (typeof rememberLines[ irl - 1 ] !== 'undefined') {
					
					irl--;
					elem.innerHTML = rememberLines[ irl ];
					//setTimeout(function(){ setEndOfContenteditable( elem ); }, 0);
				}
				else {
					
					irl = -1;
					elem.innerHTML = '';
				}
			}
			
			expandTextarea(textarea);
		}
		
		if (e.keyCode == 38) { // up arrow
			
			irl++;
			
			if (irl == rememberLines.length) {
				irl = 0;
			}
			
			if (typeof rememberLines[ irl ] !== 'undefined') {
				
				elem.innerHTML = rememberLines[ irl ];
				//setTimeout(function(){ setEndOfContenteditable( elem ); }, 0);
			}
			
			expandTextarea(textarea);
		}
	}
	
	textarea.onfocus = function() {
		this.style.border = '4px solid #A6ACAF';
	}
	
	textarea.onblur = function() {
		this.style.border = '4px solid gainsboro';
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

	document.addEventListener("dragover", function( e ) {
		
		if (elemDragged === 'border-right') {
			userlist.style.width = document.body.offsetWidth - e.clientX + 'px';
		}
		else if (elemDragged === 'border-left') {
			cqlist.style.width = e.clientX + 'px';
		}
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
	
	document.body.onclick = function(e) {   //when the document body is clicked
		
		bubble.style.display = 'none';
		
		if (window.event) {
			e = event.srcElement;           //assign the element clicked to e (IE 6-8)
		}
		else {
			e = e.target;                   //assign the element clicked to e
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
						
						document.getElementById('border-right').style.backgroundColor = 'red';
						document.getElementById('border-left').style.backgroundColor = 'red';
					}
					else {
						document.getElementById('border-right').style.backgroundColor = 'gainsboro';
						document.getElementById('border-left').style.backgroundColor = 'gainsboro';
					}
					
					activeChannel = '#' + target[1];
					ACStriped = target[1];
					active = activeChannel;
					activeType = 'channel';
					
					let chanspHTML = activeChannel.replace(/\/g, '<').toLowerCase();
					
					chanspHTML = chanspHTML.replace(/\/g, '>').toLowerCase();
					
					doSend('names ' + chanspHTML);
					
					let chan_topic = document.getElementById('chan_topic_' + ACStriped);
					
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
						
						item.className += ' ul_hidden';
					});
					
					document.getElementById('ul_' + ACStriped).className = 'ul';
					
					document.getElementById('userlist').className = '';
					
					document.getElementById('chan_btn_' + ACStriped).className = 'btn_window btn_selected';
					
					let border_right = document.getElementById('border-right');
					border_right.style.height = userlist.scrollHeight + 'px';
					
					//scrollBottom(windows.item(index + 1));
					
				}
				else if (target[0] == 'query') {
					
					active = target[1];
					activeType = 'query';
					activeQuery = target[1];
					
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
		
		bubble.style.marginLeft = 24 * 2 - 17 + 'px';
		bubble.style.display = 'inline-block';
		Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
		document.getElementById('addchan').style.setProperty('display', 'block');
		
		document.getElementById('newchan').focus();
	}
	
	let btn_favorites_chans = document.getElementById('btn_favorites_chans');
	
	btn_favorites_chans.onclick = function(e) {
		
		e.stopPropagation();
		
		bubble.style.marginLeft = 24 * 3 - 2 + 'px';
		bubble.style.display = 'inline-block';
		Array.from(document.getElementsByClassName('options')).forEach(closeContentBubble);
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
