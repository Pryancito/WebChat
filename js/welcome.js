"use strict";

(function() {
	
	document.documentElement.setAttribute('lang', lang);
	
	if (lang === '') {
		
		lang = 'fr';
	}
	
	document.getElementById(lang).setAttribute('selected', 'selected');
	
	let submit = document.getElementById('submit');
	submit.onclick = function() {
		let nickname = document.getElementById('wircy_nickname').value;
		setCookie('nick_connect', nickname, 10000000);
		setCookie('nspasswd', JSON.stringify([ nickname, document.getElementById('wircy_nickserv').value ]), 10000000);
		
		let channels = getParameterByName('channels');
		
		if (channels !== null) {
			document.location.href = 'irc.html?nickname=' + nickname + '&channels=' + channels;
		}
		else {
			document.location.href = 'irc.html?nickname=' + nickname;
		}
	}
	
	let nick_url = getParameterByName('nick');
	
	if (nick_url !== null) {
		document.getElementById('wircy_nickname').value = nick_url;
	}
	else {
		
		let nick_connect = getCookie('nick_connect');
		
		if (nick_connect !== '') {
			document.getElementById('wircy_nickname').value = nick_connect;
		}
	}
	
	let nspasswd = JSON.parse(getCookie('nspasswd'));
	
	if (nspasswd !== '') {
		document.getElementById('wircy_nickserv').value = nspasswd[1];
	}
	
	document.getElementById('lang').onchange = function() {
		
		if (this.value === 'English') {
			setCookie('lang', 'en', 10000000);
		}
		if (this.value === 'Français') {
			setCookie('lang', 'fr', 10000000);
		}
		
		window.location.href = './';
	}
	
	/*
	document.getElementById('avatar_file').onchange = function (e) {
		openFile(e);
	}
	*/
	
	/*
	let avatar = getCookie('avatar');
	
	if (avatar !== '') {
		let img = document.getElementById('avatar_view');
		img.src = '/avatars/' + avatar + '?' + Date.now();
		
		let width = img.clientWidth;
		let height = img.clientHeight;
		
		if (Math.abs(width - height) < 50) {
			img.style.height = '100%';
			img.style.margin = '0';
		}
	}
	*/
	
})();

var openFile = function(event) {
	
    var input = event.target;
    var reader = new FileReader();
    
    let loading = document.getElementById('loading');
    
    reader.onload = function() {
      var dataURL = reader.result;
      var output = document.getElementById('avatar_view');
      output.src = dataURL;
      loading.style.display = 'inline';
      uploadFile();
    };
    reader.readAsDataURL(input.files[0]);
};

var uploadFile = function() {
	
	let form = document.getElementById('user');
	
	let formdata = (window.FormData) ? new FormData(form) : null;
	
	let data = (formdata !== null) ? formdata : form.serialize();
	
	let loading = document.getElementById('loading');
	
	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onreadystatechange = function() {
		
		if (this.readyState == 4 && this.status == 200) {
			
			let response = this.responseText;
			
			setCookie('avatar', response, 10000000);
			
			loading.style.display = 'none';
			
			let img = document.getElementById('avatar_view');
			img.src = '/avatars/' + response + '?' + Date.now();
			
			let width = img.clientWidth;
			let height = img.clientHeight;
			
			if (Math.abs(width - height) < 150) {
				img.style.height = '100%';
				img.style.margin = '0';
			}
		}
		
	};

	xmlhttp.open("POST", '/ajax/set_avatar.php', true);
	
	console.log(data);
	
	xmlhttp.send(data);
};

/*
var uploadFile = function () {
	var $form = $('#sticker');
	var $formdata = (window.FormData) ? new FormData($form[0]) : null;
	var $data = ($formdata !== null) ? $formdata : $form.serialize();
	
	console.log($data);
	
	$('#loading').show();
	
	$.ajax({
		type: "POST",
	    url: "ajax/upload_sticker_theme.php",
	    contentType: false,
	    processData: false,
	    data: $data,
	    error: function () {
	    	$('#loading').hide();
	    },
	    success: function (callback) {
	        console.log(callback);
	        $('#loading').hide();
	    }
	});
};
*/

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

function getParameterByName(name, url) {
	
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return results[2].replace(/\+/g, " ");
}
