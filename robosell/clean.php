<?
  require_once('params.php');
  require_once('utils.php');
  $error = 1;
  $error_txt = '';
  
  if (isset($_POST['code'])) {
     $code = checktextfromuser($_POST['code']);
     $pass = checktextfromuser($_POST['pass']);
     
     if ($pass != $DBPwd) {
       $error_txt = 'Пароль не верный, письмо админу отправлено';
     } else {
       $db_conn = mysql_connect($DBHost, $DBUser, $DBPwd);
       if (!$db_conn) {
          $error = 2;
          $error_txt = 'Немогу подключиться к базе<br>'.mysql_error();
       }
       
       if ($error == 1) {
         if (!mysql_select_db($DBName, $db_conn)) {
           $error = 2;
           $error_txt = 'Немогу подключиться к базе '.$DBName.'<br>'.mysql_error();
         }
       }
       
       if ($error == 1) {
         $nt = (int)$_POST['time'];
         if ($nt > 0) {
           mysql_query("update SavePage set SaveTime=$nt where Code = '$code'", $db_conn);
         }
         mysql_query("delete from CookiePage where PageID=(select ID from SavePage where Code = '$code')", $db_conn);
         $error_txt = 'Успешно очищено';
       }
     }
  }

  if ($error > 0) {
?>
<html>
<head><title>RoboSell - управление таймерами</title></head>
<body>
  <table border="0" align="center">
    <? if ($error_txt != '') {?><tr><td colspan="2" align="center" color="red"><? echo $error_txt; ?></td></tr><? } ?>
    <form action="" method="POST">
      <tr><td>Код страницы:</td><td><input name="code" /></td></tr>
      <tr><td>Новое время (оставьте пустым если не хотите менять):</td><td><input name="time" /></td></tr>
      <tr><td>Пароль к базе данных:</td><td><input name="pass" type="password"/></td></tr>
      <tr><td colspan="2" align="center"><input type="submit" value="Сохранить"/></td></tr>
    </form>
  </table>
</body>
</html>
<? 
  } 
?>