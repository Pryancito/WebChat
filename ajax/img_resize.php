<?php

function imageResize ($sFileNameFrom, $sFileNameTo, $KEEP_PROPORTIONS, $dress=false) {
	$aProportions = array ('FILLED_CIRCLE', 'DO_NOT_KEEP_PROPORTIONS', 'KEEP_PROPORTIONS_ON_WIDTH', 'KEEP_PROPORTIONS_ON_HEIGHT', 'KEEP_PROPORTIONS_ON_BIGGEST', 'KEEP_PROPORTIONS_ON_SMALLEST');
	
	if ((!file_exists($sFileNameFrom) && !url_exists($sFileNameFrom)) || !is_array ($KEEP_PROPORTIONS) || empty ($KEEP_PROPORTIONS)) {
		return false;
	} else {
		$aImg = @getimagesize($sFileNameFrom);
		
		if (false === $aImg) {
			return false;
		} else {
			$aTypes = array (1 => 'gif', 2 => 'jpeg', 3 => 'png');
			if (!in_array ($aImg[2], array_keys ($aTypes))) {
				return false;
			} else {
				if (!in_array ($KEEP_PROPORTIONS[0], $aProportions)) {
					return false;
				}
				$iCmpt = count ($KEEP_PROPORTIONS);
				if (!empty ($KEEP_PROPORTIONS) && is_array ($KEEP_PROPORTIONS) && ($iCmpt >= 2) && is_int ($KEEP_PROPORTIONS[1])) {
					switch ($KEEP_PROPORTIONS[0]) {
						case 'KEEP_PROPORTIONS_ON_WIDTH' :
							$width = $KEEP_PROPORTIONS[1];
							$height = round ($aImg[1] / ($aImg[0]/$KEEP_PROPORTIONS[1]));
						break;
						case 'KEEP_PROPORTIONS_ON_HEIGHT' :
							$height = $KEEP_PROPORTIONS[1];
							$width = round ($aImg[0]/ ($aImg[1]/$KEEP_PROPORTIONS[1]));
						break;
						case 'KEEP_PROPORTIONS_ON_BIGGEST' :
							if ($aImg[0] >= $aImg[1]) {
								$width = $KEEP_PROPORTIONS[1];
								$height = round ($aImg[1] / ($aImg[0]/$KEEP_PROPORTIONS[1]));
							} else {
								$height = $KEEP_PROPORTIONS[1];
								$width = round ($aImg[0] / ($aImg[1]/$KEEP_PROPORTIONS[1]));
							}
						break;
						case 'KEEP_PROPORTIONS_ON_SMALLEST' :
							if ($aImg[0] <= $aImg[1]) {
								$width = $KEEP_PROPORTIONS[1];
								$height = round ($aImg[1] / (round ($aImg[0]/$KEEP_PROPORTIONS[1])));
							} else {
								$height = $KEEP_PROPORTIONS[1];
								$width = round ($aImg[0] / ($aImg[1]/$KEEP_PROPORTIONS[1]));
							}
						break;
						case 'DO_NOT_KEEP_PROPORTIONS':
							if ($iCmpt !== 3 || !is_int ($KEEP_PROPORTIONS[2])) {
								return false;
							}
							$width = $KEEP_PROPORTIONS[1];
							$height = $KEEP_PROPORTIONS[2];
						break;
						case 'FILLED_CIRCLE': // TEST !!!
						
							$width = $KEEP_PROPORTIONS[1];
							$height = $KEEP_PROPORTIONS[2];
							
							$diametre = $width;
						
							$getImg = create_function ('$sFileNameFrom', 'return @imagecreatefrom'.$aTypes[$aImg[2]].'($sFileNameFrom);');
							$saveImg = create_function ('$img, $sFileNameTo', 'return @image'.$aTypes[$aImg[2]].'($img, $sFileNameTo);');
							
							$image_s = $getImg ($sFileNameFrom);
							$image = imagecreatetruecolor($diametre, $diametre);
							
							imagesavealpha($image, true);
							imagecopyresampled($image, $image_s, 0, 0, 0, 0, $width, $height, $aImg[0], $aImg[1]);

							// create masking
							$mask = imagecreatetruecolor($diametre, $diametre);
							
							$transparent = imagecolorallocate($mask, 255, 0, 0);
							imagecolortransparent($mask, $transparent);
							
							imagefilledellipse($mask, $diametre / 2, $diametre / 2, $diametre, $diametre, $transparent);
							
							imageantialias($image, false);
							imagealphablending($image, false);
							
							$around = imagecolorallocate($image, 240, 240, 240);
							imagefill($image, 0, 0, $around);
							imagecopymerge($image, $mask, 0, 0, 0, 0, $width, $height, 100);
							
							if ($saveImg ($image, $sFileNameTo)) {
								imagedestroy($image);
								return true;
							}
							
						break;
					}
				}
				
				$getImg = create_function ('$sFileNameFrom', 'return @imagecreatefrom'.$aTypes[$aImg[2]].'($sFileNameFrom);');
				$saveImg = create_function ('$img, $sFileNameTo', 'return @image'.$aTypes[$aImg[2]].'($img, $sFileNameTo);');
				$im = $getImg ($sFileNameFrom);
				$image_p = imagecreatetruecolor($width, $height);
				imagealphablending($image_p, false);
				//imageantialias($image_p, false);
				imagesavealpha($image_p, true);
				imagecopyresampled($image_p, $im, 0, 0, 0, 0, $width, $height, $aImg[0], $aImg[1]);
				
				if (!$sFileNameTo) {
					header('Content-Type: '.$aImg['mime']);
					switch ($aImg[2]) {
						case 1:{
							imagegif($image_p);
							break;
						}
						case 2:{
							imagejpeg($image_p);
							break;
						}
						case 3:{
							imagepng($image_p);
							break;
						}
					}
					imagedestroy($image_p);
				}
				else {
					if ($dress === true) {
						
						$size = $KEEP_PROPORTIONS[1];
						$image = imagecreatetruecolor($size, $size);
						
						$noir = imagecolorallocate($image, 0, 0, 0);
						
						imagecolortransparent($image, $noir);
						
						if ($aImg[2] == 3 && $width == $height) {
							imagealphablending($image, false);
							imagesavealpha($image, true);
						}

						$x = round(($KEEP_PROPORTIONS[1] - $width) / 2);
						$y = round(($KEEP_PROPORTIONS[1] - $height) / 2);
						
						imagecopymerge($image, $image_p, $x, $y, 0, 0, $width, $height, 100);
						
						imagepng($image, $sFileNameTo);
						
						imagedestroy($image);
					}
					elseif ($saveImg ($image_p, $sFileNameTo)) {
						imagedestroy($image_p);
						return true;
					} else {
						imagedestroy($image_p);
						return false;
					}
				}
			}
		}
	}
}

function is_ani($filename) {
        $filecontents=file_get_contents($filename);

        $str_loc=0;
        $count=0;
        while ($count < 2) # There is no point in continuing after we find a 2nd frame
        {

                $where1=strpos($filecontents,"\x00\x21\xF9\x04",$str_loc);
                if ($where1 === FALSE)
                {
                        break;
                }
                else
                {
                        $str_loc=$where1+1;
                        $where2=strpos($filecontents,"\x00\x2C",$str_loc);
                        if ($where2 === FALSE)
                        {
                                break;
                        }
                        else
                        {
                                if ($where1+8 == $where2)
                                {
                                        $count++;
                                }
                                $str_loc=$where2+1;
                        }
                }
        }

        if ($count > 1)
        {
                return(true);

        }
        else
        {
                return(false);
        }
}

function url_exists($url) {
    if (!$fp = curl_init($url)) return false;
    return true;
}

?>
