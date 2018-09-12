<?php

require('prepare.php');


$allData = json_decode(file_get_contents('php://input'), true);

$config = $allData['config'];
$formData = $allData['form'];
$url = $allData['url'];
$defaultUTM = $config['default_utm'];

$response = array();

// create order
if ($formData != '' && $formData['user_phone'] != '') {
	function CreateGoods($products) {
		$length = count($products);
		$goods = array();

		while ($length--) {
			$good = array(
				'good_name' => $products[$length]
			);

			array_push($goods, $good);
		}

		return $goods;
	}

	$phone = strtr($formData['user_phone'],
								 array('(' => '', ')' => '', '-' => '', ' ' => ''));
	// NOTE: для данных с форм страницы http://макияж1.рф/individ.html
	if (substr_count($formData['user_email'], '@') < 1) {
		$formData['user_email'] = null;
	}
	$email = $formData['user_email'] ? $formData['user_email'] : strtr($phone, array('+' => '')) . '@from.form';


	$send_data = array(
		'goods' => CreateGoods($config['products']),
		'bill_first_name' => $formData['user_name'],
		'bill_surname' => '-',
		'bill_otchestvo' => '-',
		'bill_phone' => $phone,
		'bill_email' => $email,
		'bill_country' => '-',
		'bill_region' => '-',
		'bill_city' => '-',
		'bill_address' => '-'
	);

	if ($url['partner'] != null) {
		$send_data['bill_aff'] = $url['partner'];
	}
	if ($config['tag'] != null) {
		$send_data['bill_tag'] = $config['tag'];
	}
	if ($url['utm'] != null) {
		foreach ($url['utm'] as $k => $v) {
			$send_data['utm[' . $k . ']'] = $v;
		}
	} else {
		foreach ($defaultUTM as $k => $v) {
			$send_data['utm[' . $k . ']'] = $v;
		}
	}

	$send_data['hash'] = GetHash($send_data, $user_rs);

	$res = json_decode(Send('http://' . $user_rs['user_id'] . '.justclick.ru/api/CreateOrder', $send_data));

	global $allData;

	if (!CheckResError($res) and !CheckHash($res, $user_rs)) {
		http_response_code(400);

		$response['order'] = $res;
		exit;
	} else {
		http_response_code(200);
		$allData['response'] = $res->result;
		setcookie('allData', json_encode($allData, JSON_UNESCAPED_UNICODE), time() + 60 * 60 * 24, '/');

		$response['order'] = $res;
	}
}

// create subscriber
if ($config['responder'] != '') {
	$phone = strtr($formData['user_phone'],
		array('(' => '', ')' => '', '-' => '', ' ' => ''));
	$email = $formData['user_email'] ? $formData['user_email'] : strtr($phone, array('+' => '')) . '@from.form';

	$send_data = array(
		'rid[0]' => $config['responder'],
		'lead_name' => $formData['user_name'],
		'lead_phone' => $phone,
		'lead_email' => $email,
		'aff' => $url['partner'] != '' ? $url['partner'] : '',
		'tag' => $config['tag'] != '' ? $config['tag'] : '',
		'doneurl2' => $config['final_url'] != '' ? $config['final_url'] : '',
	);

	if ($url['utm'] != null) {
		foreach ($url['utm'] as $k => $v) {
			$send_data['utm[' . $k . ']'] = $v;
		}
	} else {
		foreach ($defaultUTM as $k => $v) {
			$send_data['utm[' . $k . ']'] = $v;
		}
	}

	$send_data['hash'] = GetHash($send_data, $user_rs);

	$res = json_decode(Send('http://' . $user_rs['user_id'] . '.justclick.ru/api/AddLeadToGroup', $send_data));

	if (!CheckHash($res, $user_rs)) {
		http_response_code(400);

		$response['responder'] = $res;
		exit;
	} else {
		http_response_code(200);

		$response['responder'] = $res;
	}
}


echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT  | JSON_FORCE_OBJECT);

?>
