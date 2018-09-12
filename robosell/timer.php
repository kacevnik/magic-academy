<?
require_once('utils.php');
require_once('params.php');

  function GetDBConnect() {
    global $DBHost, $DBUser, $DBPwd, $DBName;
    $DBConnect = @mysql_connect($DBHost, $DBUser, $DBPwd, true);
    if ($DBConnect === false) {
      WriteInLog('Can\'t connect to database ', true);
      return false;
    } else {
      mysql_select_db($DBName, $DBConnect);
      //mysql_query('SET NAMES utf8');
      return $DBConnect;
    }
  }

  function CloseDBConnect($DBConnect) {
    return mysql_close($DBConnect);
  }

  function GetQueryResult($SqlText, $ReturnAutoID = false) {
    global $DBConnect;
    $res = mysql_query($SqlText, $DBConnect);
    if ($res === false) {
      WriteInLog($SqlText."\n".mysql_error());
      return $res;
    } else {
      if ($ReturnAutoID) {
        $result = mysql_insert_id($DBConnect);
      } else {
        $result = $res;
      }
    }
    return $result;
  }

  function GetFirstCellQueryResult($SqlText, $DeffVal = 0) {
    $res = GetQueryResult($SqlText);
    if (($res === false) || (mysql_num_rows($res) == 0)) {
      return $DeffVal;
    }
    return mysql_result($res, 0);
  }

  // main function
  function InitTimer($Code, $PathTo) {
    global $AllGood, $DBConnect, $HaveTime, $PathToScript;
    $PathToScript = $PathTo;
    WriteInLog('Init '.$Code, true);
    $AllGood = true;
    $DBConnect = GetDBConnect();
    if ($DBConnect) {
      // init page variable
      $res = GetQueryResult("select ID,SaveTime from SavePage where Code='$Code'");
      $row = mysql_fetch_assoc($res);
      $PageID = $row['ID'];
      $Period = $row['SaveTime'];
      
      // init process variable
      $CookieID = 0;
      $Now = time();
      $NewIP = substr(getenv('REMOTE_ADDR'), 0, 15);
      $NewProxy = substr(getenv('HTTP_X_FORWARDED_FOR'), 0, 15);
      $Hash = '';
      $HaveTime = 0;
      $AddIPInfo = false;
      
      // check and set cookie
      if (isset($_COOKIE['t'])) {
        $Hash = CheckTextFromUser($_COOKIE['t']);
        $CookieID = GetFirstCellQueryResult("select c.ID from Cookie c where c.Hash='$Hash'", 0);
        $AddIPInfo = ($CookieID > 0) && GetFirstCellQueryResult("select Count(*)from CookieIP c where c.CookieID=$CookieID and c.IP='$NewIP' and c.Proxy='$NewProxy'", 0) == 0;
      } 
      if ($CookieID == 0) {
        $CookieID = GetFirstCellQueryResult("select CookieID from CookieIP where IP='$NewIP' and Proxy='$NewProxy' limit 1", 0);
      }
      if ($CookieID == 0) {
        $AddIPInfo = true;
        $Hash = SaveString($Now.$NewIP.$NewProxy.mt_rand(1, 1000));
        $CookieID = GetQueryResult("insert into Cookie(Hash)values('$Hash')", true);
        SetCookie('t', $Hash, $Now + 24 * 60 * 60 * 365 * 2);
      }
      if ($AddIPInfo) {
        GetQueryResult("insert into CookieIP(CookieID,IP,Proxy)values($CookieID,'$NewIP','$NewProxy')");
      }

      // check time
      $TimeTo = GetFirstCellQueryResult("select TimeTo from CookiePage where PageID=$PageID and CookieID=$CookieID", 0);
      if ($TimeTo == 0) {
        $TimeTo = $Now + $Period * 60;
        GetQueryResult("insert into CookiePage(PageID,CookieID,TimeTo)values($PageID,$CookieID,$TimeTo)");
      }

      $HaveTime = $TimeTo - $Now;
      
      $AllGood = true;
      
      CloseDBConnect($DBConnect);
    } else {
      $AllGood = false;
    }
  }
  
  function ShowSavedText($ShowTimer = true) {
    global $AllGood, $SavedText, $TimeoutText, $RedirectUrl, $HaveTime, $PathToScript;
    if ($AllGood) {
	  echo "<script type=\"text/javascript\" src=\"$PathToScript\"></script><script type=\"text/javascript\">Time=$HaveTime;Msg='$TimeoutText';RedirectUrl='$RedirectUrl';</script>";
      return $HaveTime > 0;
      /*if ($HaveTime > 0) {
        ?><script type="text/javascript" src="<? echo $PathToScript; ?>"></script><script type="text/javascript">Time=<? echo $HaveTime;?>;Msg='<? echo $TimeoutText; ?>';RedirectUrl='<? echo $RedirectUrl; ?>';</script><?
        if ($ShowTimer) {
          echo '<div id="timer"></div>';
        }
        echo '<div id="timer_content_div">'.$SavedText.'</div><script type="text/javascript">ShowTime();</script>';
      } else {
        if ($RedirectUrl != '') {
          echo '<script type="text/javascript"><!--window.location = "'.$RedirectUrl.'"//--></script>';
        } else {
          echo $TimeoutText;
        }

      }*/
    } else {
      echo '<h2 style="color:red;">Database connection error</h2>';
    }
  }

?>