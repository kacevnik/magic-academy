<?
 $error = 1;
 $error_txt = '';
 
 if (isset($_POST['submit'])) {
   $page = $_POST['page'];
   if ($page == '') {
     $error = 2;
     $error_txt = 'Поле "Ссылка на страницу" должно быть заполнено<br>';
   }
   $time = (int)$_POST['time'];
   if ($time <= 0) {
     $error = 2;
     $error_txt .= 'Поле "Время" должно быть больше 0<br>';
   }
   /*$saved_text = $_POST['saved_text'];
   if ($saved_text == '') {
     $error = 2;
     $error_txt .= 'Поле "Защищаемый текст" должно быть заполнено<br>';
   }*/
   $timeout_text = $_POST['timeout_text'];
   if ($_POST['redirect'] == 1) {
     $redirect_url = $_POST['url'];
     if ($redirect_url == '') {
        $error = 2;
        $error_txt .= 'Если вы хотите редирект по истечению времени заполните "Ссылка редиректа"<br>';
     }
   }
   if ($error == 1) {
     require_once('params.php');
     $db_conn = mysql_connect($DBHost, $DBUser, $DBPwd);
     if (!$db_conn) {
        $error = 2;
        $error_txt = 'Не могу подсоединиться к базе<br>'.mysql_error();
     }
     
     if ($error == 1) {
       if (!mysql_select_db($DBName, $db_conn)) {
         $error = 2;
         $error_txt = 'Не могу подсоединиться к базе '.$DBName.'<br>'.mysql_error();
       }
     }
     
     if ($error == 1) {
       $Code = substr(md5(time()), 0, 7).mt_rand(100, 999);
       if (!mysql_query("insert into SavePage(Code,SaveTime)values('$Code',$time)", $db_conn)) {
         $error = 2;
         $error_txt = 'Не могу сохранить настройки<br>'.mysql_error();
       } else {
         $error = 0;
       }
     }
   }
 } else {
   $_POST['time'] = 1440;
 }
 
 if ($error == 0)  {
  $link = str_replace('add.php', 'timer.php', $_SERVER['SCRIPT_NAME']);
  $jslink = str_replace('add.php', 'timer.js', $_SERVER['SCRIPT_NAME']);
  if (substr($page, 0, 1) != '/') {
    $page = '/'.$page;
  }
  $lnbefore = strlen($page) - 1;
  $lnafter = strlen(str_replace('/', '', $page));
  $prefix = '';
  while ($lnafter++ < $lnbefore) {
    $prefix .= '../';
  }
  if ($prefix != '') {
    $prefix = substr($prefix, 0, strlen($prefix) - 1);
  }
  $link = $prefix.$link;
  if (substr($link, 0, 1) == '/') {
	$link = substr($link, 1);
  }
?>
<html>
<head><title>Создание защищеной страницы</title>
<style type="text/css">
textarea{width:100%;}
pre{border:1px dotted black;}
b.R{font-size:90%;color:#f00;}
b.G{font-size:105%;color:#9f9;}
h2{color:#f00;}
</style>
</head>
<body>
  <h3><b><? echo $Code; ?></b> - запомните этот код, он понадобиться для сброса и изменения счетчика</h3>
  <h3>Вставьте код с самого верха защищеной страницы, до любого текста (включая пробелы)</h3>
  <pre>
    &lt;? 
      require_once('<? echo $link; ?>'); 
      InitTimer('<? echo $Code.'\', \''.$jslink; ?>');
    ?&gt;</pre>
  <h3>Код в котором будет отображаться время</h3>
  <pre>
    &lt;!-- В этом блоке будет отображаться время вы можете разместить его в любом месте сраницы --&gt;
    &lt;!-- и применять любые стили --&gt;
    &lt;div id="timer"&gt;&lt;/div&gt;  </pre>
  <h3>Вставьте код в месте где должен быть защищеный текст</h3>
  <pre>
    <b class="G">&lt;!-- открывающий тег --&gt;</b>
    <b class="R">&lt;?</b> if (ShowSavedText()) { <b class="R">?&gt;</b>
    &lt;div id="timer_content_div"&gt;
  </pre>
    <h2>&lt;!-- Сюда вставьте HTML который должен быть защищен --&gt;</h2>
  <pre>
    &lt;/div&gt;
    <b class="G">&lt;!-- тег завершения времени --&gt;</b>
    <b class="R">&lt;?</b> } else { <b class="R">?&gt;</b>
<?     if ($redirect_url != '') {
         echo "    &lt;!-- Скрипт который перебросит пользователя на указаный адрес по истечению времени --&gt;\n";
         echo "    &lt;!-- если вам ненадо перебрасывать уберите этот код и замените нужным текстом --&gt;\n";
         echo '    &lt;script type="text/javascript"&gt;&lt;!--window.location = "'.$redirect_url.'"//--&gt;&lt;/script&gt;'."\n";
       } else {
         echo "&lt;!-- Сюда вставьте текст который будет виден после истечения времени --&gt;\n";
         echo "$timeout_text\n";
       } ?>
    <b class="R">&lt;?</b> } <b class="R">?&gt;</b>
    <b class="G">&lt;!-- закрывающий тег --&gt;</b>  </pre>
  <h1><a href="<? echo $_SERVER['SCRIPT_NAME']; ?>">Добавить</a> новую страницу</h1>
</body>
</html>
<?
 } else {
?>
<html>
<head><title>Создание защищеной страницы</title>
<style type="text/css">
textarea{width:100%;}
</style>
</head>
<body>
  <table border="0">
    <? if ($error_txt != '') {?><tr><td colspan="2" color="red"><? echo $error_txt; ?></td></tr><? } ?>
    <form action="" method="POST">
      <tr><td>Ссылка на страницу (от корня сайта):</td><td><input name="page" value="<? echo $_POST['page'];?>"/></td></tr>
      <tr><td>Время (мин.):</td><td><input name="time" value="<? echo $_POST['time']; ?>"/></td></tr>
      <tr><td colspan="2">Текст по истечению времени:</td></tr>
      <tr><td colspan="2"><textarea name="timeout_text"><? echo $_POST['timeout_text']; ?></textarea></td></tr>
      <tr><td>Нужен редирект по истечению времени?:</td><td><input type="checkbox" name="redirect" value="1" <? if (isset($_POST['redirect'])) {echo 'checked="checked"';} ?>/></td></tr>
      <tr><td>Ссылка редиректа:</td><td><input name="url" value="<? echo $_POST['url']; ?>"/></td></tr>
      <tr><td colspan="2" align="center"><input type="submit" name="submit" value="Создать"/></td></tr>
    </form>
  </table>
</body>
</html>
<?
 }
?>