'use strict';


/*
 * @module formhandler
 *
 * @version 1.0.0
 * @author Sergey Pankov <pankov.seryi@gmail.com>
 *
 * @requires [jQuery]{@link http://jquery.com/download/}
 *
 * @param {Object} [options]
 * @property {String} [options.form] Form selector
 *
 * @example
 * FormHandler({
 *     form: '.js-form',
 *     handler: './php/form_sender.php'
 * });
 */
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

	/**
	 * Подготовка и валидация данных формы
	 *
	 * @param {Object} [form] Current form object
	 *
	 * @return {Boolean}
	 */
	function validationForm(form) {
		$('[type=submit]').attr('disabled', 'disabled');
		$('.' + classInvalid).removeClass(classInvalid);

		var $allInputs = form.find(':input[name]');
		var formData = {};
		var isError = false;

		/**
		 * Testing each form element
		 *
		 * @param  {Object} [allInput] Current inputs
		 */
		$.each($allInputs, function(idx, el) {
			var $input = form.find(':input[name=' + el.name + ']');


			if ($input && el.type !== 'hidden' && !el.value
				&& !$input.attr('readonly') && !$input.hasClass('validate_not')
				|| el.name === 'user_name' && !$input.attr('readonly')
				&& !validateName(el.value) && !$input.hasClass('validate_not')
				|| el.name === 'user_phone' && !$input.attr('readonly')
				&& !validatePhone(el.value) && !$input.hasClass('validate_not')
				|| el.name === 'user_email' && !$input.attr('readonly')
				&& !validateEmail(el.value) && !$input.hasClass('validate_not')) {

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

		try {
			// yaCounter000000.reachGoal('goal');
		} catch (e) {}

		sendForm(config, url, formData);

		return true;
	}

	/**
	 * User name validation
	 *
	 * @param  {String} [value] Current input value
	 * @return {Boolean}
	 */
	function validateName(value) {
		var reg = /[A-zА-я]/;
		var length = value.length;

		if (reg.test(value) && length >= 3) {
			return true;
		}

		return false;
	}

	/**
	 * User phone validation
	 *
	 * @param  {String} [value] Current input value
	 * @return {Boolean}
	 */
	function validatePhone(value) {
		var reg = /[0-9()+-]/;
		var length = value.length;

		if (reg.test(value) && length >= 5) {
			return true;
		}

		return false;
	}

	/**
	 * User email validation
	 *
	 * @param  {String} [value] Current input value
	 * @return {Boolean}
	 */
	function validateEmail(value) {
		var reg = /\S+@\S+\.\S+/;
		var length = value.length;

		if (reg.test(value) && length >= 5) {
			return true;
		}

		return false;
	}

	/**
	 * Form send via post request
	 *
	 * @param {Object} [config] All configs
	 * @param {Object} [url] Url params
	 * @param {Object} [formData] Form data
	 *
	 * @return {Boolean}
	 */
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

	/**
	 * Concat data to be sent
	 *
	 * @param {Object} [config] All configs
	 * @param {Object} [url] Url params
	 * @param {Object} [formData] Form data
	 *
	 * @return {Object} [allData] Concated data
	 */
	function concatData(configGlobal, url, formData) {
		var allData = {};

		// Add config data
		if (typeof configGlobal !== 'undefined') {
			allData.config = configGlobal;
		}

		// Add url data
		if (typeof url !== 'undefined') {
			allData.url = url.get();
		}

		// Add form data
		if (typeof formData !== 'undefined') {
			allData.form = formData;
		}

		return allData;
	}

	// Actions after a successful data
	function afterSend() {
		$('[type=submit]').removeAttr('disabled');
		$(':input[name]').removeClass(classValid);
		$(':input[name]').val('');

		// Close opened modal
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
				window.location = redirectUrl;
			}
		}
	}
};


// Инициализируем модуль
FormHandler({
	form: '.js-form',
	handler: './handler/form_sender.php'
});
