<?php
	
	session_start();
	
	ini_set("post_max_size", "30M");
	ini_set("upload_max_filesize", "10M");
	ini_set("memory_limit", "20000M");
	
	require 'img_resize.php';

	if (isset($_FILES['avatar']['tmp_name'])) {
		echo image_temp_to_file();
	}
	
	function image_temp_to_file() {
		
		if (is_uploaded_file($_FILES['avatar']['tmp_name'])) {
			
			if ($_FILES['avatar']['error'] == UPLOAD_ERR_OK) {
				
				$extension = strtolower(substr($_FILES['avatar']['name'], strrpos($_FILES['avatar']['name'], '.')));
				
				$filename = md5(session_id() . 'GhYi58p=)I_y25PasDk4');
				$entire_path = '../avatars/'.$filename.$extension;
				
				del_existing_file('../avatars/', $filename);
				
				image_resize($_FILES['avatar']['tmp_name'], '../avatars/', $filename.$extension);
			}
		}
		
		return $filename.$extension;
	}
	
	function del_existing_file($path, $new_filename) {
		// Supprimer le fichier existant
		$folder = scandir($path);
		foreach ($folder as $f) {
			$filename = substr($f, 0, strrpos($f, '.'));
			if ($filename === $new_filename) {
				unlink($path.$f);
			}
		}
	}
	
	function image_resize($fileFrom, $pathTo, $filename, $image_resize=array(150, 150)) {
		
		imageResize($fileFrom, $pathTo.$filename, array('KEEP_PROPORTIONS_ON_BIGGEST', $image_resize[0], $image_resize[1]), true);
	}
?>
