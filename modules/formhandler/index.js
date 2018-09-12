'use strict';
var FormHandler = function(options) {
	var classInvalid = 'js-input_no-valid';
	var classValid = 'js-input_valid';
	$(':input[name]').on('input propertychange', function() {
		var $elem = $(this);
		if ($elem.hasClass(classInvalid)) {
			$elem.removeClass(classInvalid);
		} else if ($elem.hasClass(classValid)) {
			$elem.removeClass(classValid);
		}
	});
	$(options.form).submit(function(e) {
		var $form = $(this);
		validationForm($form);
		e.preventDefault();
	});

	function validationForm(form) {
		$('[type=submit]').attr('disabled', 'disabled');
		$('.' + classInvalid).removeClass(classInvalid);
		var $allInputs = form.find(':input[name]');
		var formData = {};
		var isError = false;
		$.each($allInputs, function(idx, el) {
			var $input = form.find(':input[name=' + el.name + ']');
			if ($input && el.type !== 'hidden' && !el.value && !$input.attr('readonly') && !$input.hasClass('validate_not') || el.name === 'user_name' && !$input.attr('readonly') && !validateName(el.value) && !$input.hasClass('validate_not') || el.name === 'user_phone' && !$input.attr('readonly') && !validatePhone(el.value) && !$input.hasClass('validate_not') || el.name === 'user_email' && !$input.attr('readonly') && !validateEmail(el.value) && !$input.hasClass('validate_not')) {
				if ($input.hasClass(classValid)) {
					$input.removeClass(classValid);
				}
				$input.addClass(classInvalid);
				$input.focus();
				isError = true;
				return false;
			} else {
				$input.addClass(classValid);
				formData[el.name] = el.value;
			}
		});
		if (isError) {
			$('[type=submit]').removeAttr('disabled');
			return false;
		}
		try {} catch (e) {}
		sendForm(config, url, formData);
		return true;
	}

	function validateName(value) {
		var reg = /[A-zА-я]/;
		var length = value.length;
		if (reg.test(value) && length >= 3) {
			return true;
		}
		return false;
	}

	function validatePhone(value) {
		var reg = /[0-9()+-]/;
		var length = value.length;
		if (reg.test(value) && length >= 5) {
			return true;
		}
		return false;
	}

	function validateEmail(value) {
		var reg = /\S+@\S+\.\S+/;
		var length = value.length;
		if (reg.test(value) && length >= 5) {
			return true;
		}
		return false;
	}

	function sendForm(config, url, formData) {
		var allData = concatData(config, url, formData);
		allData = JSON.stringify(allData);
		$.ajax({
			url: options.handler,
			type: 'post',
			contentType: 'application/json; charset=utf-8',
			data: allData,
			processData: false,
			success: afterSend
		});
		return true;
	}

	function concatData(configGlobal, url, formData) {
		var allData = {};
		if (typeof configGlobal !== 'undefined') {
			allData.config = configGlobal;
		}
		if (typeof url !== 'undefined') {
			allData.url = url.get();
		}
		if (typeof formData !== 'undefined') {
			allData.form = formData;
		}
		console.log(allData)
		return allData;
	}

	function afterSend(resp) {
		var respObj = JSON.parse(resp);

		$('[type=submit]').removeAttr('disabled');
		$(':input[name]').removeClass(classValid);
		$(':input[name]').val('');
		var $allModal = $('.modal');
		var i = $allModal.length;
		while (i--) {
			var $currentModal = $allModal[i];
			var $id = $currentModal.getAttribute('id');
			if ($currentModal.getAttribute('aria-hidden') === 'false') {
				$('#' + $id).modal('hide');
			}
		}
		var thanksDelay = options.thanksDelay || 0;
		var thanksClose = options.thanksClose || 5000;
		setTimeout(function() {
			$('#modal_thanks').modal('show');
		}, thanksDelay);
		setTimeout(function() {
			$('#modal_thanks').modal('hide');
		}, thanksClose);
		if (typeof config !== 'undefined') {
			var redirectUrl = config.final_url;
			if (redirectUrl !== undefined && redirectUrl !== '') {
				if (respObj.order && respObj.order.result.bill_id) {
					window.location = redirectUrl + '?order_id=' + respObj.order.result.bill_id;
				} else {
					window.location = redirectUrl;
				}
			}
		}
	}
};
FormHandler({
	form: '.js-form',
	handler: './handler/form_sender.php'
});
