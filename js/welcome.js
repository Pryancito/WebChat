"use strict";

(function() {
	
	let submit = document.getElementById('submit');
	submit.onclick = function() {
		let nickname = document.getElementById('wircy_nickname').value;
		setCookie('nspasswd', document.getElementById('wircy_nickserv').value, 10000000);
		document.location.href = 'irc.html?nickname=' + nickname;
	}
	
	let nspasswd = getCookie('nspasswd');
	
	if (nspasswd !== '') {
		document.getElementById('wircy_nickserv').value = nspasswd;
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
