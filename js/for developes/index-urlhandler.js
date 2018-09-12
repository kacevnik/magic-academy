/*
 * @module urlhandler
 *
 * @version 1.0.0
 * @author Sergey Pankov <pankov.seryi@gmail.com>
 *
 * @requires [jQuery]{@link http://jquery.com/download/}
 *
 * @return {Object} Methods object
 *
 * @example
 * url.set(['partner', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term']);
 */
var url = function() {
	var urlCurrent = {};

	/**
	 * Add URL param to Object
	 *
	 * @param {Array} [urlParam] Array selected URL
	 */
	function prepareUrl(urlParam) {
		// Сбрасываем объект
		if (JSON.stringify(urlCurrent) !== '{}') {
			urlCurrent = {};
		}

		var utm = {};

		// Добавляем значения в обект URL параметров
		$.each(urlParam, function(i, v) {
			var paramValue = getUrlParam(v);
			var reg = /utm_/;

			if (reg.test(v)) {
				if (paramValue !== undefined) {
					utm[v] = paramValue;
				}
			} else {
				urlCurrent[v] = paramValue;
			}
		});

		if (JSON.stringify(utm) !== '{}') {
			urlCurrent['utm'] = utm;
		}
	};

	/**
	 * Get url param
	 *
	 * @param  {String} [name] Param name
	 * @return {String} Param value
	 */
	function getUrlParam(name) {
		return decodeURIComponent((
						new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)')
						.exec(location.search) || [, ''])[1]
						.replace(/\+/g, '%20'
				)) || undefined;
	};

	// Возвращаем объект методов
	return {
		/**
		 * Метод создания объекта URL параметров, на основании массива имён нужны URL
		 *
		 * @param {Array} [urlParam] The URL param that need to parse
		 * @return {Object} [urlCurrent] Object URL параметров
		 */
		set: function(urlParam) {
			prepareUrl(urlParam);
		},
		/**
		 * Метод получения объекта URL параметров
		 *
		 * @return {Object} [urlCurrent] Object URL параметров
		 */
		get: function() {
			return urlCurrent;
		}
	};
}();

// Инициализируем модуль
url.set(['partner', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term']);
