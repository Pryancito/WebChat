
let lang = getCookie('lang');

if (lang == '' || lang === 'en') {

	var lang_connect_button = "Connect !";
	var lang_add_chan = "Create or join channel";
	var lang_favorites_chans = "Manage favorites channels";
	var lang_address_book = "Manage address book";
	var lang_summary_off = "Don't display web summary";
	var lang_summary_on = "Display web summary";
	var lang_visio_button_dwait = "Don't wait for video conference";
	var lang_visio_button_wait = "Wait for video conference";
	var lang_send_picture = "Send a picture";
	var lang_send_video = "Send a video";
	var lang_color = "Color of text";
	var lang_bold = "Bold text";
	var lang_italic = "Italic text";
	var lang_underline = "Underline text";
	var lang_nltosp = "Replace new lines by spaces";
	var lang_addchan_options = "Join channel";
	var lang_addfav_current_chan = "Add current channel to favorites";
	var lang_nofav = "No favorite channel for the moment";
	var lang_list = "Display list of channels";
	var lang_status = "Status";
	var lang_nick = "Nickname";
	var lang_submit = "Chat !";
	var lang_lang = "Choose language";
	var lang_nspasswd = "NickServ Password (optional)";
	var lang_ignore = "Ignores";
	var lang_hl = "Highlights";
	var lang_friend = "Friends";
	var lang_mask = "Mask";
	var lang_add_mask = "Add";
	var lang_ab_private = "Private";
	var lang_ab_channel = "Channel";
	var lang_ab_notice = "Notice";
	var lang_ab_invite = "Invite";
	var lang_ab_all = "All";
	var lang_ab_over = "Over ignores";
	var lang_nsemail = "Enter a valid email address to register";
	var default_chan = "#EpiKnet";
	var lang_topic = 'Topic';
	var lang_topic_view = 'Double-clic to see topic';
	var lang_topic_view2 = 'Double-clic to reduct topic';
	var lang_leave_warning = 'Do you really want to leave this page?';
}

else if (lang === 'fr') {
	var lang_connect_button = "Se connecter !";
	var lang_add_chan = "Créer ou rejoindre un canal";
	var lang_favorites_chans = "Gérer les canaux favoris";
	var lang_address_book = "Gérer les adresses";
	var lang_summary_off = "Ne pas afficher les résumés web";
	var lang_summary_on = "Afficher les résumés web";
	var lang_visio_button_dwait = "Ne pas attendre pour la vidéoconférence";
	var lang_visio_button_wait = "Attendre pour la vidéoconférence";
	var lang_send_picture = "Envoyer une image";
	var lang_send_video = "Envoyer une vidéo";
	var lang_color = "Couleur du texte";
	var lang_bold = "Texte en gras";
	var lang_italic = "Texte en italique";
	var lang_underline = "Souligner le texte";
	var lang_nltosp = "Remplacer les retours à la ligne par des espaces";
	var lang_addchan_options = "Rejoindre un canal";
	var lang_addfav_current_chan = "Ajouter le canal courant aux favoris";
	var lang_nofav = "Pas de canal favoris pour le moment";
	var lang_list = "Afficher la liste des canaux";
	var lang_status = "Status";
	var lang_nick = "Pseudonyme";
	var lang_submit = "Chat !";
	var lang_lang = "Choisir la langue";
	var lang_nspasswd = "Mot de passe NickServ (optional)";
	var lang_ignore = "Ignores";
	var lang_hl = "Surbrillances";
	var lang_friend = "Amis";
	var lang_mask = "Masque";
	var lang_add_mask = "Ajouter";
	var lang_ab_private = "Privé";
	var lang_ab_channel = "Canal";
	var lang_ab_notice = "Notice";
	var lang_ab_invite = "Invitation";
	var lang_ab_all = "Tout";
	var lang_ab_over = "Surcharger ignores";
	var lang_nsemail = "Entrez une adresse email valide pour vous enregistrer";
	var default_chan = "#EpiKnet";
	var lang_topic = 'Sujet';
	var lang_topic_view = 'Double-clic pour voir le sujet';
	var lang_topic_view2 = 'Double-clic pour réduire le sujet';
	var lang_leave_warning = 'Êtes-vous sûr de vouloir quitter cette page ?';
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
