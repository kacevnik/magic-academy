<?
  $error = 1;
  $error_txt = '';
  if (isset($_POST['host'])) {
     $host = $_POST['host'];
     $dbname = $_POST['dbname'];
     $user = $_POST['user'];
     $pass = $_POST['pass'];
     
     $db_conn = mysql_connect($host, $user, $pass);
     if (!$db_conn) {
        $error = 2;
        $error_txt = 'Не могу подсоединиться к базе<br>'.mysql_error();
     }
     
     if ($error == 1) {
        if (!mysql_select_db($dbname, $db_conn)) {
          $error = 2;
          $error_txt = 'Не могу подсоединиться к базе '.$dbname.'<br>'.mysql_error();
        }
     }
     
     if ($error == 1) {
       //mysql_query('SET NAMES utf8', $db_conn);
       if (!mysql_query('create table SavePage(ID int(6) not null auto_increment,Code char(10) not null,SaveTime int(10) not null/*,SavedTxt varchar(4000),TimeoutTxt varchar(4000),RedirectUrl varchar(250)*/,primary key(ID));', $db_conn)) {
         $error = 2;
         $error_txt = 'Ошибка создания таблицы SavePage<br>'.mysql_error().'<br>';
       }
       
       if (($error == 1) && !mysql_query('create unique index UIDX_SavePage_Code on SavePage (Code);', $db_conn)) {
         $error = 2;
         $error_txt = 'Ошибка создания индекса SavePage<br>'.mysql_error().'<br>';
       }
       
       if (($error == 1) && !mysql_query('create table Cookie(ID int(10) not null auto_increment,Hash char(40) not null,primary key(ID));', $db_conn)) {
         $error = 2;
         $error_txt = 'Ошибка создания таблицы Cookie<br>'.mysql_error().'<br>';
       }
       
       if (($error == 1) && !mysql_query('create unique index UIDX_CookieIP_HASH on Cookie (Hash);', $db_conn)) {
         $error = 2;
         $error_txt .= 'Ошибка создания индекса Cookie<br>'.mysql_error().'<br>';
       }
       
       if (($error == 1) && !mysql_query('create table CookiePage(PageID int(6) not null,CookieID int(10) not null,TimeTo int(10) not null,primary key(PageID, CookieID));', $db_conn)) {
         $error = 2;
         $error_txt = 'Ошибка создания таблицы CookiePage<br>'.mysql_error().'<br>';
       }
       
       if (($error == 1) && !mysql_query('create table CookieIP (CookieID int(10) not null,IP varchar(15) not null,Proxy varchar(15) not null);', $db_conn)) {
         $error = 2;
         $error_txt .= 'Ошибка создания таблицы CookieIP<br>'.mysql_error().'<br>';
       }
       
       if (($error == 1) && !mysql_query('create index IDX_CookieIP_COOKIE on CookieIP (CookieID);', $db_conn)) { 
         $error = 2;
         $error_txt .= 'Ошибка создания индекса CookieIP<br>'.mysql_error().'<br>';
       }
       
       if ($error == 1) {
          $file = fopen('params.php', 'w+');
          if ($file) {
            $error += fwrite($file, "<?\n") ? 0 : 1;
            $error += fwrite($file, '  $DBHost = '."'$host';\n") ? 0 : 1;
            $error += fwrite($file, '  $DBUser = '."'$user';\n") ? 0 : 1;
            $error += fwrite($file, '  $DBPwd = '."'$pass';\n") ? 0 : 1;
            $error += fwrite($file, '  $DBName = '."'$dbname';\n") ? 0 : 1;
            $error += fwrite($file, "?>") ? 0 : 1;
            $error += fclose($file) ? 0 : 1;
            if ($error == 1) {
              $error = 0;
            }
          }
       }
     }
  }

  if ($error == 0) {
    $link = str_replace('install.php', 'add.php', $_SERVER['SCRIPT_NAME']);
    ?><h1>Скрипт успешно установлен</h1><h2><a href="<? echo $link ?>">Начнем!</a></h2><?
  }
  if ($error > 0) {
?>
<html>
<head><title>Инсталяция таймера</title></head>
<body>
  <table border="0" align="center">
    <? if ($error_txt != '') {?><tr><td colspan="2" align="center" color="red"><? echo $error_txt; ?></td></tr><? } ?>
    <form action="" method="POST">
      <tr><td>Хост базы данных:</td><td><input name="host" /></td></tr>
      <tr><td>Имя базы данных:</td><td><input name="dbname" /></td></tr>
      <tr><td>Пользователь:</td><td><input name="user" /></td></tr>
      <tr><td>Пароль:</td><td><input name="pass" type="password"/></td></tr>
      <tr><td colspan="2" align="center"><input type="submit" value="Инсталировать"/></td></tr>
    </form>
  </table>
</body>
</html>
<? 
  } 
?>