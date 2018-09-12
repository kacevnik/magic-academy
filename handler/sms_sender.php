<?php

require('prepare.php');


$config_ls = $config_local['letsads'];


$allData = json_decode($_COOKIE['allData'], true);
$config = $allData['config'];
$url = $allData['url'];
$formData = $allData['form'];
$config_sms = json_decode($_COOKIE['smsData'], true);

/**
 * Send SMS
 *
 * @param {String} $url
 * @param {Array} $data
 * @return {Array} $response
 */
function SendSMS($url, $data) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($ch);

	curl_close($ch);
	return $response;
}


if (isset($_POST['friend']) && is_array($_POST['friend'])) {

	foreach ($_POST['friend'] as $friend) {

		if (!empty($friend['name']) && !empty($friend['phone'])) {
			$user_name = $_POST['from'] != '' ? $_POST['from'] : $formData['user_name'];

			$shortcodes = array('[friend_name]', '[customer_name]');

			$replace = array($friend['name'], $user_name);

			$message = str_replace($shortcodes, $replace, $config_sms['text_sms']);

			$api_query = '<?xml version="1.0" encoding="UTF-8"?>
			<request>
				<auth>
					<login>' . $config_ls['login'] . '</login>
					<password>' . $config_ls['password'] . '</password>
				</auth>
				<message>
					<from>' . $config_ls['prefix'] . '</from>
					<text>' . $message . '</text>
					<recipient>' . preg_replace('/[^0-9]/', '', $friend['phone']) . '</recipient>
				</message>
			</request>';

			$res = SendSMS('http://letsads.com/api', $api_query);

			$allData = $GLOBALS['allData'];

			$config = $allData['config'];
			$url = $allData['url'];
			$formData = $allData['form'];
			$config_sms = $GLOBALS['config_sms'];
			$user_rs = $GLOBALS['user_rs'];

      $phone = strtr($friend['phone'],
                      array('(' => '', ')' => '', '-' => '', ' ' => ''));
      $email = strtr($phone, array('+' => '')) . '@smspodruge.ru';

			$send_data = array(
				'rid[0]' => $config_sms['group_sms'],
				'lead_name' => $friend['name'],
				'lead_phone' => $phone,
				'lead_email' => $email,
				'aff' => $url['partner'] != '' ? $url['partner'] : '',
				'tag' => $config['tag'] != '' ? $config['tag'] : ''
			);

			$send_data['hash'] = GetHash($send_data, $user_rs);

			$res = json_decode(Send('http://' . $user_rs['user_id'] . '.justclick.ru/api/AddLeadToGroup', $send_data));
		}
	}

}
?>

<!DOCTYPE HTML>
<html>

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta name="author" content="admin" />
	<meta name="format-detection" content="telephone=no">
	<link rel="stylesheet" href="../dop_page/css/reset.min.css" />
	<link rel="stylesheet" href="../dop_page/css/style.css" />
	<title>Академии Совершенства “Макияж для Себя”</title>
</head>

<body>
	<div class="wrapper">
		<div class="content">
			<center>
				<h2>SMS с видео отправлено!</h2>
				<h3>Узнайте у вашей подруги, понравилось ли оно ей, и приходите!</h3>
			</center>
		</div>
	</div>
</body>

</html>
