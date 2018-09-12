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
		$('.text-right span').text('4 места');

	} else if ( moscowHours >= 10 && moscowHours <= 13 ) {

		$('.text-left span').text('2');
		$('.text-right span').text('3 места');

	} else if ( moscowHours >= 13 && moscowHours <= 17 ) {

		$('.text-left span').text('3');
		$('.text-right span').text('2 места');

	} else if ( moscowHours >= 17 && moscowHours <= 20 ) {

		$('.text-left span').text('3');
		$('.text-right span').text('2 места');

	} else if ( moscowHours >= 20 && moscowHours <= 22 ) {

		$('.text-left span').text('4');
		$('.text-right span').text('1 место');

	} else if ( moscowHours >= 22 || moscowHours <= 5 ) {

		$('.text-left span').text('4');
		$('.text-right span').text('1 место');

	}
});