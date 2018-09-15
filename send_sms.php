<?php

    $loginApi = 'z1536868746838';
    $passApi  = '962809';
    $fromName = 'MAGIC';
    $message  = 'Вебинар по фокусам через 15 мин: http://.вебинар-фокусы.академия.рус';
    $sUrl     = 'http://api.iqsms.ru/messages/v2/send.json';
    $time = date("Y-m-d").'T'.date("H:i:s")."Z";
    $count    = 200;

    $db = mysqli_connect('mysql100.1gb.ru', 'gb_magic_wsms', 'aceacz6ztyu', 'gb_magic_wsms');
    if(!$db){
        echo "Ошибка: Невозможно установить соединение с MySQL." . PHP_EOL;
        echo "Код ошибки errno: " . mysqli_connect_errno() . PHP_EOL;
        echo "Текст ошибки error: " . mysqli_connect_error() . PHP_EOL;
    }
    mysqli_query($db, "SET NAMES 'utf8'");         //Установка кодировки данных из базы.

    $res = mysqli_query($db, "SELECT user_phone,id FROM sms_users WHERE type='0' LIMIT $count");

    if(mysqli_num_rows($res) > 0){

    $text = '{
    "scheduleTime": "2008-07-12T14:30:01Z", 
    "messages": [';

    $myr = mysqli_fetch_assoc($res);
    do{

    $text.='{
            "phone": "'.$myr['user_phone'].'", 
            "sender": "'.$fromName.'", 
            "clientId": "'.$myr['id'].'", 
            "text": "'.$message.'"
        },';

    $metka = time();
    $up = mysqli_query($db, "UPDATE sms_users SET type='1',unix_send = '$metka' WHERE user_phone='".$myr['user_phone']."'");

    }while($myr = mysqli_fetch_assoc($res));

    $text.= "::";

    $text = str_replace(",::", "", $text);

    $text.='], 
    "statusQueueName": "'.$fromName.'", 
    "showBillingDetails": true, 
    "login": "'.$loginApi.'", 
    "password": "'.$passApi.'"
}';
}

        $rCurl = curl_init($sUrl);
        curl_setopt($rCurl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($rCurl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($rCurl, CURLOPT_HEADER, 0);
        curl_setopt($rCurl, CURLOPT_POSTFIELDS, $text);
        curl_setopt($rCurl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($rCurl, CURLOPT_POST, 1);
        $sAnswer = curl_exec($rCurl);
        curl_close($rCurl);

        // echo $sAnswer;

?>