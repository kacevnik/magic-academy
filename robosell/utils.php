<?php
function SaveString($Str) {
  return sha1($Str.'1*$der?!-#Ag_d0#');
}

function CheckTextFromUser($aText, $StripSlash = false, $AddSlash = true, $SpecChar = false) {
  return CheckBigTextFromUser($aText, $StripSlash, $AddSlash, $SpecChar, '', false);
}

function CheckBigTextFromUser($aText, $StripSlash = false, $AddSlash = false, $SpecChar = false, $Tags = '<a><i><u><b><p><br><div>', $ActiveLnk = true) {
  $aText = str_replace('&nbsp;', '#nbsp;', $aText);
  //$aText = str_replace(chr(10).chr(13), '<br>', $aText);
  //$aText = str_replace(chr(13).chr(10), '<br>', $aText);
  //$aText = str_replace(chr(13), '<br>', $aText);
  $aText = str_replace("\n", '<br>', $aText);
  $aText = strip_tags($aText, $Tags);
  if ($StripSlash) {
    $aText = stripslashes($aText);
  }
  if ($AddSlash) {
    $aText = addslashes($aText);
  }
  if ($SpecChar) {
    $aText = htmlspecialchars($aText, 1);
  }
  $aText = str_replace('#nbsp;', '&nbsp;', $aText);
  if ($ActiveLnk) {
    $aText = preg_replace("#http://[^<\s\n]+#", '<a href="\0″ target="_blank">\0</a>', $aText);
    $aText = preg_replace("#www.[^<\s\n]+#", '<a href="http://\0″ target="_blank">\0</a>', $aText);
    $aText = preg_replace("/[_\.0-9a-z-]+@([0-9a-z][0-9a-z-]+\.)+[a-z]{2,3}/", '<a href="mailto:\\1">\\1</a>', $aText); 
  }
  return $aText;
}


function user_browser($agent) {
	preg_match("/(MSIE|Opera|Firefox|Chrome|Version|Opera Mini|Netscape|Konqueror|SeaMonkey|Camino|Minefield|Iceweasel|K-Meleon|Maxthon)(?:\/| )([0-9.]+)/", $agent, $browser_info); // регулярное выражение, которое позволяет отпределить 90% браузеров
  list(,$browser,$version) = $browser_info; // получаем данные из массива в переменную
  if (preg_match("/Opera ([0-9.]+)/i", $agent, $opera)) {
    return 'Opera '.$opera[1]; // определение _очень_старых_ версий Оперы (до 8.50), при желании можно убрать
  }
  if ($browser == 'MSIE') { // если браузер определён как IE
    preg_match("/(Maxthon|Avant Browser|MyIE2)/i", $agent, $ie); // проверяем, не разработка ли это на основе IE
    if ($ie) {
      return $ie[1].' based on IE '.$version;
    }
    return 'IE '.$version; // иначе просто возвращаем IE и номер версии
  }
  if ($browser == 'Firefox') { // если браузер определён как Firefox
    preg_match("/(Flock|Navigator|Epiphany)\/([0-9.]+)/", $agent, $ff); // проверяем, не разработка ли это на основе Firefox
    if ($ff) {
      return $ff[1].' '.$ff[2]; // если да, то выводим номер и версию
    }
  }
  if (($browser == 'Opera') && ($version == '9.80')) {
    return 'Opera '.substr($agent,-5); // если браузер определён как Opera 9.80, берём версию Оперы из конца строки
  }
  if ($browser == 'Version') {
    return 'Safari '.$version; // определяем Сафари
  }
  if (!$browser && strpos($agent, 'Gecko')) {
    return $agent;//'Browser based on Gecko'; // для неопознанных браузеров проверяем, если они на движке Gecko, и возращаем сообщение об этом
  }
  return $browser.' '.$version; // для всех остальных возвращаем браузер и версию
}

function GetUserAgent() {
  return substr(user_browser(getenv('HTTP_USER_AGENT')), 0 ,250);
}
function GetFullInfoStr() {
  return 'IP-address = '.getenv('REMOTE_ADDR').'; PREFER = '.getenv('HTTP_REFERER').'; User Agent: '.GetUserAgent().'; Email? = '.getenv('HTTP_FROM');
}

function WriteInLog($Str, $FullInfo = false, $FilePath = 'events.log') {
  if ($FullInfo) {
    $Str .= '; '.GetFullInfoStr();
  }
  $LogFile = fopen($FilePath, 'a+');
  fwrite($LogFile, $Str."<br>\n");
  if ($FullInfo) {
    fwrite($LogFile, "<br>\n");
  }
  fclose($LogFile);
}
?>