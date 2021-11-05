<?php

	$ext = strtolower(strrchr($_GET['url'], '.'));
	
	if (in_array($ext, array('.png', '.jpg', '.jpeg', '.gif', '.svg'))) {
		
		echo json_encode(array('type' => 'image', 'image' => $_GET['url']));
		
		exit();
	}
	
	preg_match('/(?<=(?:v|i)=)[a-zA-Z0-9-]+(?=&)|(?<=(?:v|i)\/)[^&\n]+|(?<=embed\/)[^"&\n]+|(?<=(?:v|i)=)[^&\n]+|(?<=youtu.be\/)[^&\n]+/', $_GET['url'], $match);
	
	$youtube_id = '0';
	if (!empty($match[0])) {
		$youtube_id = $match[0];
	}
	
	require 'config.php';
	
	$dsn = 'mysql:dbname='.$dbname.';host='.$dbhost;
	try {
		$dbh = new PDO($dsn, $dbuser, $dbpasswd, array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES \'UTF8\'', PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
	}
	catch (PDOException $e) {
		echo 'Connexion échouée : ' . $e->getMessage();
	}
	
	try {
		$sth = $dbh->prepare('SELECT * FROM `'.$dbprefix.'_wircy_links` WHERE url_hash = ?');
		$sth->execute(array(md5($_GET['url'])));
		$result = $sth->fetch(PDO::FETCH_ASSOC);
	}
	catch (Exception $e) {
		
		$result = '';
	}
	
	if (empty($result)) {
		
		// initialisation de la session
		$ch = curl_init();

		$header[0] = "Accept: text/xml,application/xml,application/xhtml+xml,"; 
		$header[0] .= "text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5"; 
		$header[] = "Cache-Control: max-age=0"; 
		$header[] = "Connection: keep-alive"; 
		$header[] = "Keep-Alive: 300"; 
		$header[] = "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7"; 
		$header[] = "Accept-Language: en-us,en;q=0.5"; 
		$header[] = "Pragma: "; // browsers keep this blank. 

		// configuration des options
		curl_setopt($ch, CURLOPT_URL, $_GET['url']);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		
		curl_setopt($ch, CURLOPT_USERAGENT, 'Googlebot/2.1 (+http://www.google.com/bot.html)'); 
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header); 
		curl_setopt($ch, CURLOPT_REFERER, 'http://www.google.com'); 
		curl_setopt($ch, CURLOPT_ENCODING, 'gzip,deflate');
		curl_setopt($ch, CURLOPT_AUTOREFERER, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 10);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_MAXREDIRS, 50);

		// exécution de la session
		$buffer = curl_exec($ch);
		
		// code http de retour
		$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

		// fermeture des ressources
		curl_close($ch);
		
		$metas = getMetaTags($buffer);
		
		$doc = new DOMDocument();
		
		$internalErrors = libxml_use_internal_errors(true);
		
		$doc->loadHTML('<?xml encoding="utf-8" ?>' . $buffer);
		
		libxml_use_internal_errors($internalErrors);
		
		//echo '<pre>'.print_r($metas, true).'</pre>';
		
		if ($metas !== false && $doc !== false) {
			
			$favicon = getFavicon($doc);
			
			if (isset($metas['og:title'])) {
				
				if ($metas['og:site_name'] == null) {
					
					$metas['og:site_name'] = str_ireplace('www.', '', parse_url($_GET['url'], PHP_URL_HOST));
				}
				
				$json = json_encode(array('type' => 'summary', 'site_name' => @$metas['og:site_name'], 'title' => @$metas['og:title'], 'description' => @$metas['og:description'], 'favicon' => @$favicon, 'image' => @$metas['og:image'], 'youtube_id' => @$youtube_id));
				
				cache_mysql($_GET['url'], $json);
				
				die($json);
			}
		
			$content_html5 = $doc->getElementsByTagName('article')->item(0);
			$content_xhtml = $doc->getElementById('content');
			
			$title = $doc->getElementsByTagName('title')->item(0)->nodeValue;
			
			if (!empty($content_html5)) {
				
				//$content = $content_html5->textContent;
				
				$image_html5 = $content_html5->getElementsByTagName('figure')->item(0);
				if (!empty($image_html5)) {
					$image_html5 = $image_html5->getElementsByTagName('img')->item(0);
				}
				else {
					$image_html5 = $content_html5->getElementsByTagName('img')->item(0);
				}
				$image = $image_html5;
			}
			elseif (!empty($content_xhtml)) {
				
				//$content = $content_xhtml->textContent;
				
				$image = $content_xhtml->getElementsByTagName('img')->item(0);
			}
			else {
				$content = $metas['description'];
			}
			
			if (empty($image)) {
				$image = $doc->getElementsByTagName('img')->item(0);
			}
			
			if (!empty($image)) {
				
				$image_src = $image->getAttribute('src');
				
				$image_src2 = explode(' ', $image->getAttribute('srcset'));
				$image_src2 = $image_src2[0];
				
				$image_src3 = $image->getAttribute('data-src');
				
				$image = $image_src;
				
				if ((empty($image_src) || strtolower(substr($image_src, 0, 5)) === 'data:') && !empty($image_src2)) {
					
					if (substr($image_src2, 0, 2) !== '//' && strtolower(substr($image_src2, 0, 7)) !== 'http://' && strtolower(substr($image_src2, 0, 8)) !== 'https://') {
						$image = pathtourl($_REQUEST['url'], $image_src2);
					}
					else {
						$image = $image_src2;
					}
				}
				
				elseif (empty($image_src) && empty($image_src2)) {
					
					if (!empty($image_src3)) {
						
						if (substr($image_src3, 0, 2) !== '//' && strtolower(substr($image_src3, 0, 7)) !== 'http://' && strtolower(substr($image_src3, 0, 8)) !== 'https://') {
							
							$document_root = siteAddress($_REQUEST['url']);
							$image = $document_root . $image_src3;
						}
						else {
							$image = $image_src3;
						}
					}
					elseif (substr($image_src, 0, 2) !== '//' && strtolower(substr($image_src, 0, 7)) !== 'http://' && strtolower(substr($image_src, 0, 8)) !== 'https://') {
						$image = pathtourl($_REQUEST['url'], $image_src3);
					}
					else {
						$image = $image_src3;
					}
				}
			}
			
			if (!isset($title)) {
				$title = '';
			}
			
			if (!isset($metas["description"])) {
				$metas["description"] = '';
			}
			
			$domain = str_ireplace('www.', '', parse_url($_GET['url'], PHP_URL_HOST));
			
			$json = json_encode(array('type' => 'summary', 'site_name' => @$domain, 'title' => @$title, 'description' => @$metas["description"], 'favicon' => @$favicon, 'image' => @$image, 'youtube_id' => @$youtube_id));
			
			cache_mysql($_GET['url'], $json);
			
			echo $json;
			
		}
		else {
			echo 'false';
		}
	}
	else {
		echo $result['json'];
	}
	
	function getFavicon($doc) {
		
		$links = $doc->getElementsByTagName('link');
		$favicon = '';
		foreach ($links as $l) {
			$type = $l->getAttribute('type');
			$rel = $l->getAttribute('rel');
			if (!empty($type) && $type == 'image/x-icon' || !empty($rel) && ($rel == 'shortcut icon' || $rel == 'icon')) {
				$favicon = $l;
				break;
			}
		}
		if (!empty($favicon)) {
			$href = $favicon->getAttribute('href');
			if (substr($href, 0, 2) != '//' && substr($href, 0, 7) != 'http://' || substr($href, 0, 8) != 'https://') {
				$favicon = pathtourl($_REQUEST['url'], $href);
			}
			else {
				$favicon = $href;
			}
		}
		if (urlExists($favicon)) {
			
			if ($favicon === false) {
				return 'false';
			}
			
			return $favicon;
		}
		
		return 'false';
	}
	
	function urlExists($url) {
		
		$file_headers = @get_headers($url);
		
		if (strstr($file_headers[0], '404') === false) {
			
		   return false;
		}
	 
		return true;
	}
	
	function outerHTML($e) {
		 $doc = new DOMDocument();
		 $doc->appendChild($doc->importNode($e, true));
		 return $doc->saveHTML();
	}
	
	function pathtourl($url, $path) {
		
		$document_root = siteAddress($url);
				
		$path = str_replace('../', '', $path);
		$path = str_replace('./', '', $path);
		
		return $document_root . $path;
	}
	
	function siteAddress($url) {
		$arrurl = explode('.', $url);
		$tld = explode('/', $arrurl[2]);
		return $arrurl[0] . '.' . $arrurl[1] . '.' . $tld[0] . '/';
	}
	
	function getMetaTags($str) {
		$pattern = '
		~<\s*meta\s

		# using lookahead to capture type to $1
		(?=[^>]*?
		\b(?:name|property|http-equiv)\s*=\s*
		(?|"\s*([^"]*?)\s*"|\'\s*([^\']*?)\s*\'|
		([^"\'>]*?)(?=\s*/?\s*>|\s\w+\s*=))
		)

		# capture content to $2
		[^>]*?\bcontent\s*=\s*
		(?|"\s*([^"]*?)\s*"|\'\s*([^\']*?)\s*\'|
		([^"\'>]*?)(?=\s*/?\s*>|\s\w+\s*=))
		[^>]*>

		~ix';

		if(preg_match_all($pattern, $str, $out))
		return array_combine($out[1], $out[2]);
		return array();
	}
	
	function cache_mysql($url, $json) {
		
		global $dbh, $dbprefix, $http_code;
		
		$dbh->query('
			CREATE TABLE IF NOT EXISTS `'.$dbprefix.'_wircy_links` (
			  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			  `url` mediumtext CHARACTER SET ascii NOT NULL,
			  `url_hash` varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
			  `http_code` int(3) NOT NULL,
			  `json` mediumtext NOT NULL,
			  `date` datetime NOT NULL,
			  PRIMARY KEY (`id`),
			  UNIQUE KEY `url_hash` (`url_hash`)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8;
		');
		
		$sth = $dbh->prepare('INSERT IGNORE INTO `'.$dbprefix.'_wircy_links` VALUES ("", ?, ?, ?, ?, now())');
		$sth->execute(array($url, md5($url), $http_code, $json));
	}
?>
