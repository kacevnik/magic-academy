<?php

$ROOT_DIR = __DIR__;

$config_local = json_decode(file_get_contents($ROOT_DIR . '/config.json'), true);
$config_jc = $config_local['justclick'];


$user_rs['user_id'] = $config_jc['login'];
$user_rs['user_rps_key'] = $config_jc['key'];
$pay_domain = $config_jc['pay_domain'];


function Send($url, $data) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$res = curl_exec($ch);

	curl_close($ch);

	return $res;
}

function GetHash($params, $user_rs) {
	$params = http_build_query($params);
	$user_id = $user_rs['user_id'];
	$secret = $user_rs['user_rps_key'];
	$params = "{$params}::{$user_id}::{$secret}";

	return md5($params);
}

function CheckHash($res, $user_rs) {
	$secret = $user_rs['user_rps_key'];
	$code = $res->error_code;
	$text = $res->error_text;
	$hash = md5("$code::$text::$secret");

	if ($hash == $res->hash) {
		return true;
	} else {
		return false;
	}
}

function CheckResError($res) {
	if ($res->error_code != 0) {
		return true;
	} else {
		return false;
	}
}
?>
