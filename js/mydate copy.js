/*	%D - день недели
* 	%d - число
* 	%M - месяц
* 	%y - год
* 	%Y - короткий год
* 	%h - час
* 	%m - минута
* 	%s - секунда
* 	~xxxxxx~ - мерцающие символы
*/

/*******************************************/
$(function(){
	var date = new Date();
	var moscowHours = date.getUTCHours() + 3;

	if ( moscowHours >= 5 && moscowHours <= 10 ) {

		$('.text-left span').text('1');
		$('.text-right span').text('6 мест');

	} else if ( moscowHours >= 10 && moscowHours <= 14 ) {

		$('.text-left span').text('4');
		$('.text-right span').text('5 мест');

	} else if ( moscowHours >= 14 && moscowHours <= 18 ) {

		$('.text-left span').text('6');
		$('.text-right span').text('4 места');

	} else if ( moscowHours >= 18 && moscowHours <= 20 ) {

		$('.text-left span').text('7');
		$('.text-right span').text('3 места');

	} else if ( moscowHours >= 20 && moscowHours <= 22 ) {

		$('.text-left span').text('8');
		$('.text-right span').text('2 места');

	} else if ( moscowHours >= 22 || moscowHours <= 5 ) {

		$('.text-left span').text('9');
		$('.text-right span').text('1 место');

	}
});