function showVideo(e) {
	src = $(e).data('video');
	width = $(e).data('width');
	height = $(e).data('height');
	$('#top-video-ytb').slideDown();
	$('#top-video-ytb').css({'display': 'table' });
	$('#top-video-ytb .video-container .ytb-video').html(
		'<iframe  width="' + width + '" height="' + height + '"  src="' + src + '" frameborder="0" allowfullscreen></iframe>');
}
function hideVideo() {
	$('#top-video-ytb').slideUp();
	$('#top-video-ytb .video-container .ytb-video').empty();
}
$.fn.toggleAttr = function(attr,val){
	return this.each(function(){
		var $this = $(this);
		if ($this.is("[" + attr + "]")) {
			$this.removeAttr(attr);
		}
		else {
			$this.attr(attr,val);
		}
	});
}
$(document).ready(function() {
	$(".menu-opener").click(function() {
		$( "#drop-down" ).toggleClass( "drop-edite" );
	});
	$(".drop ul li").click(function() {
		$( "#drop-down" ).removeClass( "drop-edite" );
	});
	$("#main_video22").click(function main_video() {
		$('#main_video22 img').hide();
		$('#main_video22 div').show();
		var $video = $('#videomain'),
		src = $video.attr('src');
 
	$video.attr('src', src + '&autoplay=1');
	});
	$("#main-video1").click(function() {
		$('#main-video1 img').hide();
		$('#main-video1 div').show();
	var $video = $('#video-play'),
		src = $video.attr('src');
 
	$video.attr('src', src + '&autoplay=1');
	 });
	$("#main-video2").click(function() {
		$('#main-video2 img').hide();
		$('#main-video2 div').show();
		var $video = $('#video-play'),
		src = $video.attr('src');
 
	$video.attr('src', src + '&autoplay=1');
	 });
	$("#main-video3").click(function() {
	 	$('#main-video3 img').hide();
		$('#main-video3 div').show();
		var $video = $('#video-play'),
		src = $video.attr('src');
 
	$video.attr('src', src + '&autoplay=1');
	});
	 $("#main-video4").click(function() {
		$('#main-video4 img').hide();
		$('#main-video4 div').show();
		var $video = $('#video-play'),
		src = $video.attr('src');
 
	$video.attr('src', src + '&autoplay=1');
	 });
	 
	$('input#checkbox').click(function() {
		$("input#checkbox").toggleAttr("checked", "checked");
		$('#email-form').toggleAttr('readonly', 'readonly');
		$('#email-form').toggleAttr('value', 'Нет Email...');
		$('#email-form').toggleClass('no-active-email');
	});
$('input#checkbox1').click(function() {
		$("input#checkbox1").toggleAttr("checked", "checked");
		$('#email-form1').toggleAttr('readonly', 'readonly');
		$('#email-form1').toggleAttr('value', 'Нет Email...');
		$('#email-form1').toggleClass('no-active-email');
	});
	$('input#checkbox2').click(function() {
		$("input#checkbox2").toggleAttr("checked", "checked");
		$('#email-form2').toggleAttr('readonly', 'readonly');
		$('#email-form2').toggleAttr('value', 'Нет Email...');
		$('#email-form2').toggleClass('no-active-email');
	});
	$('input#checkbox3').click(function() {
		$("input#checkbox3").toggleAttr("checked", "checked");
		$('#email-form3').toggleAttr('readonly', 'readonly');
		$('#email-form3').toggleAttr('value', 'Нет Email...');
		$('#email-form3').toggleClass('no-active-email');
	});
	$('input#checkbox4').click(function() {
		$("input#checkbox4").toggleAttr("checked", "checked");
		$('#email-form4').toggleAttr('readonly', 'readonly');
		$('#email-form4').toggleAttr('value', 'Нет Email...');
		$('#email-form4').toggleClass('no-active-email');
	});
});
$(document).ready(function(){
	gallery1 = $('.gallery-vk-1').gallery({
		duration: 3000,
		autoRotation: 10000,
		listOfSlides: 'ul.gallery-list>li',
		changeHeight: true,
		switcher: 'ul.switcher>li',
		effect: 'fade'
	});
});
$(document).ready(function(){
	gallery1 = $('.gallery-vk-2').gallery({
		duration: 3000,
		autoRotation: 10000,
		listOfSlides: 'ul.gallery-list>li',
		changeHeight: true,
		switcher: 'ul.switcher>li',
		effect: 'fade'
	});
});
(function($) {
	$.fn.gallery = function(options) { return new Gallery(this.get(0), options); };

	function Gallery(context, options) { this.init(context, options); };

	Gallery.prototype = {
		options:{},
		init: function (context, options){
			this.options = $.extend({
				duration: 700,
				slideElement: 1,
				autoRotation: false,
				effect: false,
				listOfSlides: 'ul > li',
				switcher: false,
				disableBtn: false,
				nextBtn: 'a.link-next, a.btn-next, a.next',
				prevBtn: 'a.link-prev, a.btn-prev, a.prev',
				circle: true,
				direction: false,
				event: 'click',
				IE: false
			}, options || {});
			var _el = $(context).find(this.options.listOfSlides);
			if (this.options.effect) this.list = _el;
			else this.list = _el.parent();
			this.switcher = $(context).find(this.options.switcher);
			this.nextBtn = $(context).find(this.options.nextBtn);
			this.prevBtn = $(context).find(this.options.prevBtn);
			this.count = _el.index(_el.filter(':last'));

			if (this.options.switcher) this.active = this.switcher.index(this.switcher.filter('.active:eq(0)'));
			else this.active = _el.index(_el.filter('.active:eq(0)'));
			if (this.active < 0) this.active = 0;
			this.last = this.active;

			this.woh = _el.outerWidth(true);
			if (!this.options.direction) this.installDirections(this.list.parent().width());
			else {
				this.woh = _el.outerHeight(true);
				this.installDirections(this.list.parent().height());
			}

			if (!this.options.effect) {
				this.rew = this.count - this.wrapHolderW + 1;
				if (!this.options.direction) this.anim = '{marginLeft: -(this.woh * this.active)}';
				else this.anim = '{marginTop: -(this.woh * this.active)}';
				eval('this.list.css('+this.anim+')');
			}
			else {
				this.rew = this.count;
				this.list.css({opacity: 0}).removeClass('active').eq(this.active).addClass('active').css({opacity: 1}).css('opacity', 'auto');
				this.switcher.removeClass('active').eq(this.active).addClass('active');
			}

			this.initEvent(this, this.nextBtn, true);
			this.initEvent(this, this.prevBtn, false);
			if (this.options.disableBtn) this.initDisableBtn();
			if (this.options.autoRotation) this.runTimer(this);
			if (this.options.switcher) this.initEventSwitcher(this, this.switcher);
		},
		initDisableBtn: function(){
			this.prevBtn.removeClass('prev-'+this.options.disableBtn);
			this.nextBtn.removeClass('next-'+this.options.disableBtn);
			if (this.active == 0 || this.count+1 == this.wrapHolderW) this.prevBtn.addClass('prev-'+this.options.disableBtn);
			if (this.active == 0 && this.count == 1 || this.count+1 == this.wrapHolderW) this.nextBtn.addClass('next-'+this.options.disableBtn);
			if (this.active == this.rew) this.nextBtn.addClass('next-'+this.options.disableBtn);
		},
		installDirections: function(temp){
			this.wrapHolderW = Math.ceil(temp / this.woh);
			if (((this.wrapHolderW - 1) * this.woh + this.woh / 2) > temp) this.wrapHolderWwrapHolderW--;
		},
		fadeElement: function(){
			if ($.browser.msie && this.options.IE){
				this.list.eq(this.last).css({opacity:0});
				this.list.removeClass('active').eq(this.active).addClass('active').css({opacity:'auto'});
			}
			else{
				this.list.eq(this.last).animate({opacity:0}, {queue:false, duration: this.options.duration});
				this.list.removeClass('active').eq(this.active).addClass('active').animate({
					opacity:1
				}, {queue:false, duration: this.options.duration, complete: function(){
					$(this).css('opacity','auto');
				}});
			}
			if (this.options.switcher) this.switcher.removeClass('active').eq(this.active).addClass('active');
			this.last = this.active;
		},
		scrollElement: function(){
			eval('this.list.animate('+this.anim+', {queue:false, duration: this.options.duration});');
			if (this.options.switcher) this.switcher.removeClass('active').eq(this.active / this.options.slideElement).addClass('active');
		},
		runTimer: function($this){
			if($this._t) clearTimeout($this._t);
			$this._t = setInterval(function(){
				$this.toPrepare($this, true);
			}, this.options.autoRotation);
		},
		initEventSwitcher: function($this, el){
			el.bind($this.options.event, function(){
				$this.active = $this.switcher.index($(this)) * $this.options.slideElement;
				if($this._t) clearTimeout($this._t);
				if ($this.options.disableBtn) $this.initDisableBtn();
				if (!$this.options.effect) $this.scrollElement();
				else $this.fadeElement();
				if ($this.options.autoRotation) $this.runTimer($this);
				return false;
			});
		},
		initEvent: function($this, addEventEl, dir){
			addEventEl.bind($this.options.event, function(){
				if($this._t) clearTimeout($this._t);
				$this.toPrepare($this, dir);
				if ($this.options.autoRotation) $this.runTimer($this);
				return false;
			});
		},
		toPrepare: function($this, side){
			if (($this.active == $this.rew) && $this.options.circle && side) $this.active = -$this.options.slideElement;
			if (($this.active == 0) && $this.options.circle && !side) $this.active = $this.rew + $this.options.slideElement;
			for (var i = 0; i < $this.options.slideElement; i++){
				if (side) { if ($this.active + 1 <= $this.rew) $this.active++; }
				else { if ($this.active - 1 >= 0) $this.active--; }
			};
			if (this.options.disableBtn) this.initDisableBtn();
			if (!$this.options.effect) $this.scrollElement();
			else $this.fadeElement();
		},
		stop: function(){
			if (this._t) clearTimeout(this._t);
		},
		play: function(){
			if (this._t) clearTimeout(this._t);
			if (this.options.autoRotation) this.runTimer(this);
		}
	}
}(jQuery));
$(document).ready(function() {
	$('.popup-with-move-anim').magnificPopup({
		type: 'inline',

		fixedContentPos: false,
		fixedBgPos: true,

		overflowY: 'auto',

		closeBtnInside: true,
		preloader: false,

		midClick: true,
		removalDelay: 300,
		mainClass: 'my-mfp-slide-bottom'
	});
});
$(document).ready(function() {
	$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
		disableOn: 0,
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,

		fixedContentPos: false
	});
});


var MyTime = (function(){
	function MyTime(){
		this.config = {
      delay: 1000 // Частота обновления таймера
    };
  }
  MyTime.prototype = {
  	constructor: MyTime,
  	len: function(value){
  		value = value + '';
  		value = (value.length === 1) ? ('0' + value) : value;
  		return value;
  	},
  	format: function(date){
  		var hours = date.getHours();
  		var minutes = date.getMinutes();
  		var seconds = date.getSeconds();
  		var milliseconds = date.getMilliseconds();

  		var h = 24 - hours;
  		var m = 59 - minutes;
  		var s = 59 - seconds;
  		var ms = 999 - milliseconds;

  		h = this.len(h);
  		m = this.len(m);
  		s = this.len(s);

  		return { h: h, m: m, s: s, ms: ms };
  	},
  	setDate: function(time){
  		var config = this.config;
  		config.serverDate = new Date(+time * 1000);
  		config.clientDate = new Date();
  	},
  	update: function(fn){
  		var self = this;
  		var config = this.config;
  		var delay = config.delay || 1000;

  		var clientDate = config.clientDate;
  		var clientTime = clientDate.getTime();
  		var currentTime = new Date().getTime();
  		var elapsedTime = currentTime - clientTime;
  		var serverDate = config.serverDate;
  		var date = new Date(serverDate.getTime() + elapsedTime);

  		if (fn && typeof fn === 'function'){
  			fn.call(this, date);
  			setTimeout(function(){
  				self.update(fn);
  			}, delay);
  		}
  	}
  };
  return MyTime;
})();

var t1 = document.getElementById('time'),
t2 = document.getElementById('time2');

var time = new MyTime(); // Создали таймер
time.config.delay = 1000; // Указали частоту обновления таймера (не обязательно). Если не указать по умолчанию стоит 1000
time.setDate(1440190797); /* Передаём серверное время в unix формате */
time.update(function(date){

	var d = this.format(date);
	var f = d.h + ':' + d.m + ':' + d.s;


});

/* Можно создать несколько таймеров */
var time2 = new MyTime();
time2.config.delay = 1;
time2.setDate(new Date().getTime() / 1000);
time2.update(function(date){

	var d = this.format(date);
	var f = '(осталось: 0дня ' + d.h + 'часов ' + d.m + 'мин. ' + d.s + 'сек.)';
	t2.innerHTML = f;

});
