jQuery(function() {
    initCarousel();
});

function initCarousel() {
    jQuery('div.gallery-holder').scrollGallery({
        mask: 'div.gmask',
        slider: '.slideset',
        slides: '.slide',
        currentNumber: 'span.cur-num',
        totalNumber: 'span.all-num',
        disableWhileAnimating: true,
        generatePagination: 'div.pagination',
        circularRotation: true,
        pauseOnHover: false,
        autoRotation: true,
        maskAutoSize: false,
        switchTime: 4000,
        animSpeed: 600,
        stretchSlideToMask: true,
        step: 1
    });
    jQuery('div.gallery-holder2').scrollGallery({
        mask: 'div.gmask',
        slider: '.slideset',
        slides: '.slide',
        currentNumber: 'span.cur-num',
        totalNumber: 'span.all-num',
        disableWhileAnimating: true,
        generatePagination: 'div.pagination',
        circularRotation: true,
        pauseOnHover: false,
        autoRotation: true,
        maskAutoSize: false,
        switchTime: 4000,
        animSpeed: 600,
        step: 3
    });
};
(function($) {
    function ScrollGallery(options) {
        this.options = $.extend({
            mask: 'div.mask',
            slider: '>*',
            slides: '>*',
            activeClass: 'active',
            disabledClass: 'disabled',
            btnPrev: 'a.btn-prev',
            btnNext: 'a.btn-next',
            generatePagination: false,
            pagerList: '<ul>',
            pagerListItem: '<li><a href="#"></a></li>',
            pagerListItemText: 'a',
            pagerLinks: '.pagination li',
            currentNumber: 'span.current-num',
            totalNumber: 'span.total-num',
            btnPlay: '.btn-play',
            btnPause: '.btn-pause',
            btnPlayPause: '.btn-play-pause',
            galleryReadyClass: 'gallery-js-ready',
            autorotationActiveClass: 'autorotation-active',
            autorotationDisabledClass: 'autorotation-disabled',
            stretchSlideToMask: false,
            circularRotation: true,
            disableWhileAnimating: false,
            autoRotation: false,
            pauseOnHover: isTouchDevice ? false : true,
            maskAutoSize: false,
            switchTime: 4000,
            animSpeed: 600,
            event: 'click',
            swipeGap: false,
            swipeThreshold: 15,
            handleTouch: true,
            vertical: false,
            useTranslate3D: false,
            step: false
        }, options);
        this.init();
    }
    ScrollGallery.prototype = {
        init: function() {
            if (this.options.holder) {
                this.findElements();
                this.attachEvents();
                this.refreshPosition();
                this.refreshState(true);
                this.resumeRotation();
                this.makeCallback('onInit', this);
            }
        },
        findElements: function() {
            this.fullSizeFunction = this.options.vertical ? 'outerHeight' : 'outerWidth';
            this.innerSizeFunction = this.options.vertical ? 'height' : 'width';
            this.slideSizeFunction = 'outerHeight';
            this.maskSizeProperty = 'height';
            this.animProperty = this.options.vertical ? 'marginTop' : 'marginLeft';
            this.swipeProperties = this.options.vertical ? ['up', 'down'] : ['left', 'right'];
            this.gallery = $(this.options.holder).addClass(this.options.galleryReadyClass);
            this.mask = this.gallery.find(this.options.mask);
            this.slider = this.mask.find(this.options.slider);
            this.slides = this.slider.find(this.options.slides);
            this.btnPrev = this.gallery.find(this.options.btnPrev);
            this.btnNext = this.gallery.find(this.options.btnNext);
            this.currentStep = 0;
            this.stepsCount = 0;
            if (this.options.step === false) {
                var activeSlide = this.slides.filter('.' + this.options.activeClass);
                if (activeSlide.length) {
                    this.currentStep = this.slides.index(activeSlide);
                }
            }
            this.calculateOffsets();
            if (typeof this.options.generatePagination === 'string') {
                this.pagerLinks = $();
                this.buildPagination();
            } else {
                this.pagerLinks = this.gallery.find(this.options.pagerLinks);
                this.attachPaginationEvents();
            }
            this.btnPlay = this.gallery.find(this.options.btnPlay);
            this.btnPause = this.gallery.find(this.options.btnPause);
            this.btnPlayPause = this.gallery.find(this.options.btnPlayPause);
            this.curNum = this.gallery.find(this.options.currentNumber);
            this.allNum = this.gallery.find(this.options.totalNumber);
        },
        attachEvents: function() {
            var self = this;
            this.bindHandlers(['onWindowResize']);
            $(window).bind('load resize orientationchange', this.onWindowResize);
            if (this.btnPrev.length) {
                this.prevSlideHandler = function(e) {
                    e.preventDefault();
                    self.prevSlide();
                };
                this.btnPrev.bind(this.options.event, this.prevSlideHandler);
            }
            if (this.btnNext.length) {
                this.nextSlideHandler = function(e) {
                    e.preventDefault();
                    self.nextSlide();
                };
                this.btnNext.bind(this.options.event, this.nextSlideHandler);
            }
            if (this.options.pauseOnHover && !isTouchDevice) {
                this.hoverHandler = function() {
                    if (self.options.autoRotation) {
                        self.galleryHover = true;
                        self.pauseRotation();
                    }
                };
                this.leaveHandler = function() {
                    if (self.options.autoRotation) {
                        self.galleryHover = false;
                        self.resumeRotation();
                    }
                };
                this.gallery.bind({
                    mouseenter: this.hoverHandler,
                    mouseleave: this.leaveHandler
                });
            }
            if (this.btnPlay.length) {
                this.btnPlayHandler = function(e) {
                    e.preventDefault();
                    self.startRotation();
                };
                this.btnPlay.bind(this.options.event, this.btnPlayHandler);
            }
            if (this.btnPause.length) {
                this.btnPauseHandler = function(e) {
                    e.preventDefault();
                    self.stopRotation();
                };
                this.btnPause.bind(this.options.event, this.btnPauseHandler);
            }
            if (this.btnPlayPause.length) {
                this.btnPlayPauseHandler = function(e) {
                    e.preventDefault();
                    if (!self.gallery.hasClass(self.options.autorotationActiveClass)) {
                        self.startRotation();
                    } else {
                        self.stopRotation();
                    }
                };
                this.btnPlayPause.bind(this.options.event, this.btnPlayPauseHandler);
            }
            if (isTouchDevice) {
                if (this.options.useTranslate3D) {
                    this.slider.css({
                        '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                    });
                }
                if (this.options.handleTouch && jQuery.fn.hammer) {
                    this.mask.hammer({
                        drag_block_horizontal: this.options.vertical ? false : true,
                        drag_block_vertical: this.options.vertical ? true : false,
                        drag_min_distance: 1
                    }).on(this.options.vertical ? 'touch release dragup dragdown swipeup swipedown' : 'touch release dragleft dragright swipeleft swiperight', function(ev) {
                        switch (ev.type) {
                            case 'touch':
                                if (!self.galleryAnimating) {
                                    self.originalOffset = parseInt(self.slider.stop(true, false).css(self.animProperty), 10);
                                }
                                break;
                            case (self.options.vertical ? 'dragup' : 'dragright'):
                            case (self.options.vertical ? 'dragdown' : 'dragleft'):
                                if (!self.galleryAnimating) {
                                    if (ev.gesture.direction === self.swipeProperties[0] || ev.gesture.direction === self.swipeProperties[1]) {
                                        var tmpOffset = self.originalOffset + ev.gesture[self.options.vertical ? 'deltaY' : 'deltaX'];
                                        tmpOffset = Math.max(Math.min(0, tmpOffset), self.maxOffset)
                                        self.tmpProps = {};
                                        self.tmpProps[self.animProperty] = tmpOffset;
                                        self.slider.css(self.tmpProps);
                                        ev.gesture.preventDefault();
                                    };
                                };
                                break;
                            case (self.options.vertical ? 'swipeup' : 'swipeleft'):
                                if (!self.galleryAnimating) {
                                    if (ev.gesture.direction === self.swipeProperties[0]) self.nextSlide();
                                }
                                ev.gesture.stopDetect();
                                break;
                            case (self.options.vertical ? 'swipedown' : 'swiperight'):
                                if (!self.galleryAnimating) {
                                    if (ev.gesture.direction === self.swipeProperties[1]) self.prevSlide();
                                }
                                ev.gesture.stopDetect();
                                break;
                            case 'release':
                                if (!self.galleryAnimating) {
                                    if (Math.abs(ev.gesture[self.options.vertical ? 'deltaY' : 'deltaX']) > self.options.swipeThreshold) {
                                        if (self.options.vertical) {
                                            if (ev.gesture.direction == 'down') self.prevSlide();
                                            else if (ev.gesture.direction == 'up') self.nextSlide();
                                        } else {
                                            if (ev.gesture.direction == 'right') self.prevSlide();
                                            else if (ev.gesture.direction == 'left') self.nextSlide();
                                        }
                                    } else {
                                        self.switchSlide();
                                    }
                                }
                                break;
                        }
                    });
                }
            }
        },
        onWindowResize: function() {
            if (!this.galleryAnimating) {
                this.calculateOffsets();
                this.refreshPosition();
                this.buildPagination();
                this.refreshState();
                this.resizeQueue = false;
            } else {
                this.resizeQueue = true;
            }
        },
        refreshPosition: function() {
            this.currentStep = Math.min(this.currentStep, this.stepsCount - 1);
            this.tmpProps = {};
            this.tmpProps[this.animProperty] = this.getStepOffset();
            this.slider.stop().css(this.tmpProps);
        },
        calculateOffsets: function() {
            var self = this,
                tmpOffset, tmpStep;
            if (this.options.stretchSlideToMask) {
                var tmpObj = {};
                tmpObj[this.innerSizeFunction] = this.mask[this.innerSizeFunction]();
                this.slides.css(tmpObj);
            }
            this.maskSize = this.mask[this.innerSizeFunction]();
            this.sumSize = this.getSumSize();
            this.maxOffset = this.maskSize - this.sumSize;
            if (this.options.vertical && this.options.maskAutoSize) {
                this.options.step = 1;
                this.stepsCount = this.slides.length;
                this.stepOffsets = [0];
                tmpOffset = 0;
                for (var i = 0; i < this.slides.length; i++) {
                    tmpOffset -= $(this.slides[i])[this.fullSizeFunction](true);
                    this.stepOffsets.push(tmpOffset);
                }
                this.maxOffset = tmpOffset;
                return;
            }
            if (typeof this.options.step === 'number' && this.options.step > 0) {
                this.slideDimensions = [];
                this.slides.each($.proxy(function(ind, obj) {
                    self.slideDimensions.push($(obj)[self.fullSizeFunction](true));
                }, this));
                this.stepOffsets = [0];
                this.stepsCount = 1;
                tmpOffset = tmpStep = 0;
                while (tmpOffset > this.maxOffset) {
                    tmpOffset -= this.getSlideSize(tmpStep, tmpStep + this.options.step);
                    tmpStep += this.options.step;
                    this.stepOffsets.push(Math.max(tmpOffset, this.maxOffset));
                    this.stepsCount++;
                }
            } else {
                this.stepSize = this.maskSize;
                this.stepsCount = 1;
                tmpOffset = 0;
                while (tmpOffset > this.maxOffset) {
                    tmpOffset -= this.stepSize;
                    this.stepsCount++;
                }
            }
        },
        getSumSize: function() {
            var sum = 0;
            this.slides.each($.proxy(function(ind, obj) {
                sum += $(obj)[this.fullSizeFunction](true);
            }, this));
            this.slider.css(this.innerSizeFunction, sum);
            return sum;
        },
        getStepOffset: function(step) {
            step = step || this.currentStep;
            if (typeof this.options.step === 'number') {
                return this.stepOffsets[this.currentStep];
            } else {
                return Math.max(-this.currentStep * this.stepSize, this.maxOffset);
            }
        },
        getSlideSize: function(i1, i2) {
            var sum = 0;
            for (var i = i1; i < Math.min(i2, this.slideDimensions.length); i++) {
                sum += this.slideDimensions[i];
            }
            return sum;
        },
        buildPagination: function() {
            if (typeof this.options.generatePagination === 'string') {
                if (!this.pagerHolder) {
                    this.pagerHolder = this.gallery.find(this.options.generatePagination);
                }
                if (this.pagerHolder.length && this.oldStepsCount != this.stepsCount) {
                    this.oldStepsCount = this.stepsCount;
                    this.pagerHolder.empty();
                    this.pagerList = $(this.options.pagerList).appendTo(this.pagerHolder);
                    for (var i = 0; i < this.stepsCount; i++) {
                        $(this.options.pagerListItem).appendTo(this.pagerList).find(this.options.pagerListItemText).text(i + 1);
                    }
                    this.pagerLinks = this.pagerList.children();
                    this.attachPaginationEvents();
                }
            }
        },
        attachPaginationEvents: function() {
            var self = this;
            this.pagerLinksHandler = function(e) {
                e.preventDefault();
                self.numSlide(self.pagerLinks.index(e.currentTarget));
            };
            this.pagerLinks.bind(this.options.event, this.pagerLinksHandler);
        },
        prevSlide: function() {
            if (!(this.options.disableWhileAnimating && this.galleryAnimating)) {
                if (this.currentStep > 0) {
                    this.currentStep--;
                    this.switchSlide();
                } else if (this.options.circularRotation) {
                    this.currentStep = this.stepsCount - 1;
                    this.switchSlide();
                }
            }
        },
        nextSlide: function(fromAutoRotation) {
            if (!(this.options.disableWhileAnimating && this.galleryAnimating)) {
                if (this.currentStep < this.stepsCount - 1) {
                    this.currentStep++;
                    this.switchSlide();
                } else if (this.options.circularRotation || fromAutoRotation === true) {
                    this.currentStep = 0;
                    this.switchSlide();
                }
            }
        },
        numSlide: function(c) {
            if (this.currentStep != c) {
                this.currentStep = c;
                this.switchSlide();
            }
        },
        switchSlide: function() {
            var self = this;
            this.galleryAnimating = true;
            this.tmpProps = {};
            this.tmpProps[this.animProperty] = this.getStepOffset();
            this.slider.stop().animate(this.tmpProps, {
                duration: this.options.animSpeed,
                complete: function() {
                    self.galleryAnimating = false;
                    if (self.resizeQueue) {
                        self.onWindowResize();
                    }
                    self.makeCallback('onChange', self);
                    self.autoRotate();
                }
            });
            this.refreshState();
            this.makeCallback('onBeforeChange', this);
        },
        refreshState: function(initial) {
            if (this.options.step === 1 || this.stepsCount === this.slides.length) {
                this.slides.removeClass(this.options.activeClass).eq(this.currentStep).addClass(this.options.activeClass);
            }
            this.pagerLinks.removeClass(this.options.activeClass).eq(this.currentStep).addClass(this.options.activeClass);
            this.curNum.html(this.currentStep + 1);
            this.allNum.html(this.stepsCount);
            if (this.options.maskAutoSize && typeof this.options.step === 'number') {
                this.tmpProps = {};
                this.tmpProps[this.maskSizeProperty] = this.slides.eq(Math.min(this.currentStep, this.slides.length - 1))[this.slideSizeFunction](true);
                this.mask.stop()[initial ? 'css' : 'animate'](this.tmpProps);
            }
            if (!this.options.circularRotation) {
                this.btnPrev.add(this.btnNext).removeClass(this.options.disabledClass);
                if (this.currentStep === 0) this.btnPrev.addClass(this.options.disabledClass);
                if (this.currentStep === this.stepsCount - 1) this.btnNext.addClass(this.options.disabledClass);
            }
        },
        startRotation: function() {
            this.options.autoRotation = true;
            this.galleryHover = false;
            this.autoRotationStopped = false;
            this.resumeRotation();
        },
        stopRotation: function() {
            this.galleryHover = true;
            this.autoRotationStopped = true;
            this.pauseRotation();
        },
        pauseRotation: function() {
            this.gallery.addClass(this.options.autorotationDisabledClass);
            this.gallery.removeClass(this.options.autorotationActiveClass);
            clearTimeout(this.timer);
        },
        resumeRotation: function() {
            if (!this.autoRotationStopped) {
                this.gallery.addClass(this.options.autorotationActiveClass);
                this.gallery.removeClass(this.options.autorotationDisabledClass);
                this.autoRotate();
            }
        },
        autoRotate: function() {
            var self = this;
            clearTimeout(this.timer);
            if (this.options.autoRotation && !this.galleryHover && !this.autoRotationStopped) {
                this.timer = setTimeout(function() {
                    self.nextSlide(true);
                }, this.options.switchTime);
            } else {
                this.pauseRotation();
            }
        },
        bindHandlers: function(handlersList) {
            var self = this;
            $.each(handlersList, function(index, handler) {
                var origHandler = self[handler];
                self[handler] = function() {
                    return origHandler.apply(self, arguments);
                };
            });
        },
        makeCallback: function(name) {
            if (typeof this.options[name] === 'function') {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                this.options[name].apply(this, args);
            }
        },
        destroy: function() {
            $(window).unbind('load resize orientationchange', this.onWindowResize);
            this.btnPrev.unbind(this.options.event, this.prevSlideHandler);
            this.btnNext.unbind(this.options.event, this.nextSlideHandler);
            this.pagerLinks.unbind(this.options.event, this.pagerLinksHandler);
            this.gallery.unbind({
                mouseenter: this.hoverHandler,
                mouseleave: this.leaveHandler
            });
            this.stopRotation();
            this.btnPlay.unbind(this.options.event, this.btnPlayHandler);
            this.btnPause.unbind(this.options.event, this.btnPauseHandler);
            this.btnPlayPause.unbind(this.options.event, this.btnPlayPauseHandler);
            if (this.options.handleTouch && $.fn.hammer) {
                this.mask.hammer().off('touch release dragup dragdown dragleft dragright swipeup swipedown swipeleft swiperight');
            }
            var unneededClasses = [this.options.galleryReadyClass, this.options.autorotationActiveClass, this.options.autorotationDisabledClass];
            this.gallery.removeClass(unneededClasses.join(' '));
            this.slider.add(this.slides).removeAttr('style');
            if (typeof this.options.generatePagination === 'string') {
                this.pagerHolder.empty();
            }
        }
    };
    var isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    $.fn.scrollGallery = function(opt) {
        return this.each(function() {
            $(this).data('ScrollGallery', new ScrollGallery($.extend(opt, {
                holder: this
            })));
        });
    };
}(jQuery));;
(function(t, e) {
    "use strict";

    function n() {
        if (!i.READY) {
            i.event.determineEventTypes();
            for (var t in i.gestures) i.gestures.hasOwnProperty(t) && i.detection.register(i.gestures[t]);
            i.event.onTouch(i.DOCUMENT, i.EVENT_MOVE, i.detection.detect), i.event.onTouch(i.DOCUMENT, i.EVENT_END, i.detection.detect), i.READY = !0
        }
    }
    var i = function(t, e) {
        return new i.Instance(t, e || {})
    };
    i.defaults = {
        stop_browser_behavior: {
            userSelect: "none",
            touchAction: "none",
            touchCallout: "none",
            contentZooming: "none",
            userDrag: "none",
            tapHighlightColor: "rgba(0,0,0,0)"
        }
    }, i.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled, i.HAS_TOUCHEVENTS = "ontouchstart" in t, i.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i, i.NO_MOUSEEVENTS = i.HAS_TOUCHEVENTS && navigator.userAgent.match(i.MOBILE_REGEX), i.EVENT_TYPES = {}, i.DIRECTION_DOWN = "down", i.DIRECTION_LEFT = "left", i.DIRECTION_UP = "up", i.DIRECTION_RIGHT = "right", i.POINTER_MOUSE = "mouse", i.POINTER_TOUCH = "touch", i.POINTER_PEN = "pen", i.EVENT_START = "start", i.EVENT_MOVE = "move", i.EVENT_END = "end", i.DOCUMENT = document, i.plugins = {}, i.READY = !1, i.Instance = function(t, e) {
        var r = this;
        return n(), this.element = t, this.enabled = !0, this.options = i.utils.extend(i.utils.extend({}, i.defaults), e || {}), this.options.stop_browser_behavior && i.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior), i.event.onTouch(t, i.EVENT_START, function(t) {
            r.enabled && i.detection.startDetect(r, t)
        }), this
    }, i.Instance.prototype = {
        on: function(t, e) {
            for (var n = t.split(" "), i = 0; n.length > i; i++) this.element.addEventListener(n[i], e, !1);
            return this
        },
        off: function(t, e) {
            for (var n = t.split(" "), i = 0; n.length > i; i++) this.element.removeEventListener(n[i], e, !1);
            return this
        },
        trigger: function(t, e) {
            var n = i.DOCUMENT.createEvent("Event");
            n.initEvent(t, !0, !0), n.gesture = e;
            var r = this.element;
            return i.utils.hasParent(e.target, r) && (r = e.target), r.dispatchEvent(n), this
        },
        enable: function(t) {
            return this.enabled = t, this
        }
    };
    var r = null,
        o = !1,
        s = !1;
    i.event = {
        bindDom: function(t, e, n) {
            for (var i = e.split(" "), r = 0; i.length > r; r++) t.addEventListener(i[r], n, !1)
        },
        onTouch: function(t, e, n) {
            var a = this;
            this.bindDom(t, i.EVENT_TYPES[e], function(c) {
                var u = c.type.toLowerCase();
                if (!u.match(/mouse/) || !s) {
                    (u.match(/touch/) || u.match(/pointerdown/) || u.match(/mouse/) && 1 === c.which) && (o = !0), u.match(/touch|pointer/) && (s = !0);
                    var h = 0;
                    o && (i.HAS_POINTEREVENTS && e != i.EVENT_END ? h = i.PointerEvent.updatePointer(e, c) : u.match(/touch/) ? h = c.touches.length : s || (h = u.match(/up/) ? 0 : 1), h > 0 && e == i.EVENT_END ? e = i.EVENT_MOVE : h || (e = i.EVENT_END), h || null === r ? r = c : c = r, n.call(i.detection, a.collectEventData(t, e, c)), i.HAS_POINTEREVENTS && e == i.EVENT_END && (h = i.PointerEvent.updatePointer(e, c))), h || (r = null, o = !1, s = !1, i.PointerEvent.reset())
                }
            })
        },
        determineEventTypes: function() {
            var t;
            t = i.HAS_POINTEREVENTS ? i.PointerEvent.getEvents() : i.NO_MOUSEEVENTS ? ["touchstart", "touchmove", "touchend touchcancel"] : ["touchstart mousedown", "touchmove mousemove", "touchend touchcancel mouseup"], i.EVENT_TYPES[i.EVENT_START] = t[0], i.EVENT_TYPES[i.EVENT_MOVE] = t[1], i.EVENT_TYPES[i.EVENT_END] = t[2]
        },
        getTouchList: function(t) {
            return i.HAS_POINTEREVENTS ? i.PointerEvent.getTouchList() : t.touches ? t.touches : [{
                identifier: 1,
                pageX: t.pageX,
                pageY: t.pageY,
                target: t.target
            }]
        },
        collectEventData: function(t, e, n) {
            var r = this.getTouchList(n, e),
                o = i.POINTER_TOUCH;
            return (n.type.match(/mouse/) || i.PointerEvent.matchType(i.POINTER_MOUSE, n)) && (o = i.POINTER_MOUSE), {
                center: i.utils.getCenter(r),
                timeStamp: (new Date).getTime(),
                target: n.target,
                touches: r,
                eventType: e,
                pointerType: o,
                srcEvent: n,
                preventDefault: function() {
                    this.srcEvent.preventManipulation && this.srcEvent.preventManipulation(), this.srcEvent.preventDefault && this.srcEvent.preventDefault()
                },
                stopPropagation: function() {
                    this.srcEvent.stopPropagation()
                },
                stopDetect: function() {
                    return i.detection.stopDetect()
                }
            }
        }
    }, i.PointerEvent = {
        pointers: {},
        getTouchList: function() {
            var t = this,
                e = [];
            return Object.keys(t.pointers).sort().forEach(function(n) {
                e.push(t.pointers[n])
            }), e
        },
        updatePointer: function(t, e) {
            return t == i.EVENT_END ? this.pointers = {} : (e.identifier = e.pointerId, this.pointers[e.pointerId] = e), Object.keys(this.pointers).length
        },
        matchType: function(t, e) {
            if (!e.pointerType) return !1;
            var n = {};
            return n[i.POINTER_MOUSE] = e.pointerType == e.MSPOINTER_TYPE_MOUSE || e.pointerType == i.POINTER_MOUSE, n[i.POINTER_TOUCH] = e.pointerType == e.MSPOINTER_TYPE_TOUCH || e.pointerType == i.POINTER_TOUCH, n[i.POINTER_PEN] = e.pointerType == e.MSPOINTER_TYPE_PEN || e.pointerType == i.POINTER_PEN, n[t]
        },
        getEvents: function() {
            return ["pointerdown MSPointerDown", "pointermove MSPointerMove", "pointerup pointercancel MSPointerUp MSPointerCancel"]
        },
        reset: function() {
            this.pointers = {}
        }
    }, i.utils = {
        extend: function(t, n, i) {
            for (var r in n) t[r] !== e && i || (t[r] = n[r]);
            return t
        },
        hasParent: function(t, e) {
            for (; t;) {
                if (t == e) return !0;
                t = t.parentNode
            }
            return !1
        },
        getCenter: function(t) {
            for (var e = [], n = [], i = 0, r = t.length; r > i; i++) e.push(t[i].pageX), n.push(t[i].pageY);
            return {
                pageX: (Math.min.apply(Math, e) + Math.max.apply(Math, e)) / 2,
                pageY: (Math.min.apply(Math, n) + Math.max.apply(Math, n)) / 2
            }
        },
        getVelocity: function(t, e, n) {
            return {
                x: Math.abs(e / t) || 0,
                y: Math.abs(n / t) || 0
            }
        },
        getAngle: function(t, e) {
            var n = e.pageY - t.pageY,
                i = e.pageX - t.pageX;
            return 180 * Math.atan2(n, i) / Math.PI
        },
        getDirection: function(t, e) {
            var n = Math.abs(t.pageX - e.pageX),
                r = Math.abs(t.pageY - e.pageY);
            return n >= r ? t.pageX - e.pageX > 0 ? i.DIRECTION_LEFT : i.DIRECTION_RIGHT : t.pageY - e.pageY > 0 ? i.DIRECTION_UP : i.DIRECTION_DOWN
        },
        getDistance: function(t, e) {
            var n = e.pageX - t.pageX,
                i = e.pageY - t.pageY;
            return Math.sqrt(n * n + i * i)
        },
        getScale: function(t, e) {
            return t.length >= 2 && e.length >= 2 ? this.getDistance(e[0], e[1]) / this.getDistance(t[0], t[1]) : 1
        },
        getRotation: function(t, e) {
            return t.length >= 2 && e.length >= 2 ? this.getAngle(e[1], e[0]) - this.getAngle(t[1], t[0]) : 0
        },
        isVertical: function(t) {
            return t == i.DIRECTION_UP || t == i.DIRECTION_DOWN
        },
        stopDefaultBrowserBehavior: function(t, e) {
            var n, i = ["webkit", "khtml", "moz", "ms", "o", ""];
            if (e && t.style) {
                for (var r = 0; i.length > r; r++)
                    for (var o in e) e.hasOwnProperty(o) && (n = o, i[r] && (n = i[r] + n.substring(0, 1).toUpperCase() + n.substring(1)), t.style[n] = e[o]);
                "none" == e.userSelect && (t.onselectstart = function() {
                    return !1
                })
            }
        }
    }, i.detection = {
        gestures: [],
        current: null,
        previous: null,
        stopped: !1,
        startDetect: function(t, e) {
            this.current || (this.stopped = !1, this.current = {
                inst: t,
                startEvent: i.utils.extend({}, e),
                lastEvent: !1,
                name: ""
            }, this.detect(e))
        },
        detect: function(t) {
            if (this.current && !this.stopped) {
                t = this.extendEventData(t);
                for (var e = this.current.inst.options, n = 0, r = this.gestures.length; r > n; n++) {
                    var o = this.gestures[n];
                    if (!this.stopped && e[o.name] !== !1 && o.handler.call(o, t, this.current.inst) === !1) {
                        this.stopDetect();
                        break
                    }
                }
                return this.current && (this.current.lastEvent = t), t.eventType == i.EVENT_END && !t.touches.length - 1 && this.stopDetect(), t
            }
        },
        stopDetect: function() {
            this.previous = i.utils.extend({}, this.current), this.current = null, this.stopped = !0
        },
        extendEventData: function(t) {
            var e = this.current.startEvent;
            if (e && (t.touches.length != e.touches.length || t.touches === e.touches)) {
                e.touches = [];
                for (var n = 0, r = t.touches.length; r > n; n++) e.touches.push(i.utils.extend({}, t.touches[n]))
            }
            var o = t.timeStamp - e.timeStamp,
                s = t.center.pageX - e.center.pageX,
                a = t.center.pageY - e.center.pageY,
                c = i.utils.getVelocity(o, s, a);
            return i.utils.extend(t, {
                deltaTime: o,
                deltaX: s,
                deltaY: a,
                velocityX: c.x,
                velocityY: c.y,
                distance: i.utils.getDistance(e.center, t.center),
                angle: i.utils.getAngle(e.center, t.center),
                direction: i.utils.getDirection(e.center, t.center),
                scale: i.utils.getScale(e.touches, t.touches),
                rotation: i.utils.getRotation(e.touches, t.touches),
                startEvent: e
            }), t
        },
        register: function(t) {
            var n = t.defaults || {};
            return n[t.name] === e && (n[t.name] = !0), i.utils.extend(i.defaults, n, !0), t.index = t.index || 1e3, this.gestures.push(t), this.gestures.sort(function(t, e) {
                return t.index < e.index ? -1 : t.index > e.index ? 1 : 0
            }), this.gestures
        }
    }, i.gestures = i.gestures || {}, i.gestures.Hold = {
        name: "hold",
        index: 10,
        defaults: {
            hold_timeout: 500,
            hold_threshold: 1
        },
        timer: null,
        handler: function(t, e) {
            switch (t.eventType) {
                case i.EVENT_START:
                    clearTimeout(this.timer), i.detection.current.name = this.name, this.timer = setTimeout(function() {
                        "hold" == i.detection.current.name && e.trigger("hold", t)
                    }, e.options.hold_timeout);
                    break;
                case i.EVENT_MOVE:
                    t.distance > e.options.hold_threshold && clearTimeout(this.timer);
                    break;
                case i.EVENT_END:
                    clearTimeout(this.timer)
            }
        }
    }, i.gestures.Tap = {
        name: "tap",
        index: 100,
        defaults: {
            tap_max_touchtime: 250,
            tap_max_distance: 10,
            tap_always: !0,
            doubletap_distance: 20,
            doubletap_interval: 300
        },
        handler: function(t, e) {
            if (t.eventType == i.EVENT_END) {
                var n = i.detection.previous,
                    r = !1;
                if (t.deltaTime > e.options.tap_max_touchtime || t.distance > e.options.tap_max_distance) return;
                n && "tap" == n.name && t.timeStamp - n.lastEvent.timeStamp < e.options.doubletap_interval && t.distance < e.options.doubletap_distance && (e.trigger("doubletap", t), r = !0), (!r || e.options.tap_always) && (i.detection.current.name = "tap", e.trigger(i.detection.current.name, t))
            }
        }
    }, i.gestures.Swipe = {
        name: "swipe",
        index: 40,
        defaults: {
            swipe_max_touches: 1,
            swipe_velocity: .7
        },
        handler: function(t, e) {
            if (t.eventType == i.EVENT_END) {
                if (e.options.swipe_max_touches > 0 && t.touches.length > e.options.swipe_max_touches) return;
                (t.velocityX > e.options.swipe_velocity || t.velocityY > e.options.swipe_velocity) && (e.trigger(this.name, t), e.trigger(this.name + t.direction, t))
            }
        }
    }, i.gestures.Drag = {
        name: "drag",
        index: 50,
        defaults: {
            drag_min_distance: 10,
            drag_max_touches: 1,
            drag_block_horizontal: !1,
            drag_block_vertical: !1,
            drag_lock_to_axis: !1,
            drag_lock_min_distance: 25
        },
        triggered: !1,
        handler: function(t, n) {
            if (i.detection.current.name != this.name && this.triggered) return n.trigger(this.name + "end", t), this.triggered = !1, e;
            if (!(n.options.drag_max_touches > 0 && t.touches.length > n.options.drag_max_touches)) switch (t.eventType) {
                case i.EVENT_START:
                    this.triggered = !1;
                    break;
                case i.EVENT_MOVE:
                    if (t.distance < n.options.drag_min_distance && i.detection.current.name != this.name) return;
                    i.detection.current.name = this.name, (i.detection.current.lastEvent.drag_locked_to_axis || n.options.drag_lock_to_axis && n.options.drag_lock_min_distance <= t.distance) && (t.drag_locked_to_axis = !0);
                    var r = i.detection.current.lastEvent.direction;
                    t.drag_locked_to_axis && r !== t.direction && (t.direction = i.utils.isVertical(r) ? 0 > t.deltaY ? i.DIRECTION_UP : i.DIRECTION_DOWN : 0 > t.deltaX ? i.DIRECTION_LEFT : i.DIRECTION_RIGHT), this.triggered || (n.trigger(this.name + "start", t), this.triggered = !0), n.trigger(this.name, t), n.trigger(this.name + t.direction, t), (n.options.drag_block_vertical && i.utils.isVertical(t.direction) || n.options.drag_block_horizontal && !i.utils.isVertical(t.direction)) && t.preventDefault();
                    break;
                case i.EVENT_END:
                    this.triggered && n.trigger(this.name + "end", t), this.triggered = !1
            }
        }
    }, i.gestures.Transform = {
        name: "transform",
        index: 45,
        defaults: {
            transform_min_scale: .01,
            transform_min_rotation: 1,
            transform_always_block: !1
        },
        triggered: !1,
        handler: function(t, n) {
            if (i.detection.current.name != this.name && this.triggered) return n.trigger(this.name + "end", t), this.triggered = !1, e;
            if (!(2 > t.touches.length)) switch (n.options.transform_always_block && t.preventDefault(), t.eventType) {
                case i.EVENT_START:
                    this.triggered = !1;
                    break;
                case i.EVENT_MOVE:
                    var r = Math.abs(1 - t.scale),
                        o = Math.abs(t.rotation);
                    if (n.options.transform_min_scale > r && n.options.transform_min_rotation > o) return;
                    i.detection.current.name = this.name, this.triggered || (n.trigger(this.name + "start", t), this.triggered = !0), n.trigger(this.name, t), o > n.options.transform_min_rotation && n.trigger("rotate", t), r > n.options.transform_min_scale && (n.trigger("pinch", t), n.trigger("pinch" + (1 > t.scale ? "in" : "out"), t));
                    break;
                case i.EVENT_END:
                    this.triggered && n.trigger(this.name + "end", t), this.triggered = !1
            }
        }
    }, i.gestures.Touch = {
        name: "touch",
        index: -1 / 0,
        defaults: {
            prevent_default: !1,
            prevent_mouseevents: !1
        },
        handler: function(t, n) {
            return n.options.prevent_mouseevents && t.pointerType == i.POINTER_MOUSE ? (t.stopDetect(), e) : (n.options.prevent_default && t.preventDefault(), t.eventType == i.EVENT_START && n.trigger(this.name, t), e)
        }
    }, i.gestures.Release = {
        name: "release",
        index: 1 / 0,
        handler: function(t, e) {
            t.eventType == i.EVENT_END && e.trigger(this.name, t)
        }
    }, "object" == typeof module && "object" == typeof module.exports ? module.exports = i : (t.Hammer = i, "function" == typeof t.define && t.define.amd && t.define("hammer", [], function() {
        return i
    }))
})(this),
function(t, e) {
    "use strict";
    t !== e && (Hammer.event.bindDom = function(n, i, r) {
        t(n).on(i, function(t) {
            var n = t.originalEvent || t;
            n.pageX === e && (n.pageX = t.pageX, n.pageY = t.pageY), n.target || (n.target = t.target), n.which === e && (n.which = n.button), n.preventDefault || (n.preventDefault = t.preventDefault), n.stopPropagation || (n.stopPropagation = t.stopPropagation), r.call(this, n)
        })
    }, Hammer.Instance.prototype.on = function(e, n) {
        return t(this.element).on(e, n)
    }, Hammer.Instance.prototype.off = function(e, n) {
        return t(this.element).off(e, n)
    }, Hammer.Instance.prototype.trigger = function(e, n) {
        var i = t(this.element);
        return i.has(n.target).length && (i = t(n.target)), i.trigger({
            type: e,
            gesture: n
        })
    }, t.fn.hammer = function(e) {
        return this.each(function() {
            var n = t(this),
                i = n.data("hammer");
            i ? i && e && Hammer.utils.extend(i.options, e) : n.data("hammer", new Hammer(this, e || {}))
        })
    })
}(window.jQuery || window.Zepto);
(function($) {
    var days = 6 * 24 * 60 * 60,
        hours = 60 * 60,
        minutes = 60;
    $.fn.countdown = function(prop) {
        var options = $.extend({
            callback: function() {},
            timestamp: 0
        }, prop);
        var left, d, h, m, s, positions;
        init(this, options);
        positions = this.find('.position');
        (function tick() {
            left = Math.floor((options.timestamp - (new Date())) / 1000);
            if (left < 0) {
                left = 0;
            }
            d = Math.floor(left / days);
            updateDuo(0, 1, d);
            left -= d * days;
            h = Math.floor(left / hours);
            updateDuo(2, 3, h);
            left -= h * hours;
            m = Math.floor(left / minutes);
            updateDuo(4, 5, m);
            left -= m * minutes;
            s = left;
            updateDuo(6, 7, s);
            options.callback(d, h, m, s);
            setTimeout(tick, 1000);
        })();

        function updateDuo(minor, major, value) {
            switchDigit(positions.eq(minor), Math.floor(value / 10) % 10);
            switchDigit(positions.eq(major), value % 10);
        }
        return this;
    };

    function init(elem, options) {
        elem.addClass('countdownHolder');
        $.each(['Days', 'Hours', 'Minutes', 'Seconds'], function(i) {
            $('<span class="count' + this + '">').html('<div>\
				<p class="position">\
					<span class="digit static">0</span>\
				</p>\
				</div>\
				<div>\
				<p class="position">\
					<span class="digit static">0</span>\
				</p>\
				</div>').appendTo(elem);
            if (this != "Seconds") {
                elem.append('<em>:</em><span class="countDiv countDiv' + i + '"></span>');
            }
        });
    }

    function switchDigit(position, number) {
        var digit = position.find('.digit')
        if (digit.is(':animated')) {
            return false;
        }
        if (position.data('digit') == number) {
            return false;
        }
        position.data('digit', number);
        var replacement = $('<span>', {
            'class': 'digit',
            css: {
                top: 0,
                opacity: 0
            },
            html: number
        });
        digit.before(replacement).removeClass('static').animate({
            top: 0,
            opacity: 0
        }, 'fast', function() {
            digit.remove();
        })
        replacement.delay(100).animate({
            top: 0,
            opacity: 1
        }, 'fast', function() {
            replacement.addClass('static');
        });
    }
})(jQuery);
$(document).ready(function() {
    size_li = $("#reviews-list li").size();
    x = 3;
    $('#reviews-list li:lt(' + x + ')').show();
    $('.more').click(function() {
        x = (x + 3 <= size_li) ? x + 3 : size_li;
        $('#reviews-list li:lt(' + x + ')').show();
    });
});
$(document).ready(function() {
    $('.slideshow').cycle({
        fx: 'fade',
        speed: 3000,
        timeout: 7000
    });
});;
(function($) {
    var ver = '2.88';
    if ($.support == undefined) {
        $.support = {
            opacity: !($.browser.msie)
        };
    }

    function debug(s) {
        if ($.fn.cycle.debug) log(s);
    }

    function log() {
        if (window.console && window.console.log) window.console.log('[cycle] ' + Array.prototype.join.call(arguments, ' '));
    };
    $.fn.cycle = function(options, arg2) {
        var o = {
            s: this.selector,
            c: this.context
        };
        if (this.length === 0 && options != 'stop') {
            if (!$.isReady && o.s) {
                log('DOM not ready, queuing slideshow');
                $(function() {
                    $(o.s, o.c).cycle(options, arg2);
                });
                return this;
            }
            log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
            return this;
        }
        return this.each(function() {
            var opts = handleArguments(this, options, arg2);
            if (opts === false) return;
            opts.updateActivePagerLink = opts.updateActivePagerLink || $.fn.cycle.updateActivePagerLink;
            if (this.cycleTimeout) clearTimeout(this.cycleTimeout);
            this.cycleTimeout = this.cyclePause = 0;
            var $cont = $(this);
            var $slides = opts.slideExpr ? $(opts.slideExpr, this) : $cont.children();
            var els = $slides.get();
            if (els.length < 2) {
                log('terminating; too few slides: ' + els.length);
                return;
            }
            var opts2 = buildOptions($cont, $slides, els, opts, o);
            if (opts2 === false) return;
            var startTime = opts2.continuous ? 10 : getTimeout(els[opts2.currSlide], els[opts2.nextSlide], opts2, !opts2.rev);
            if (startTime) {
                startTime += (opts2.delay || 0);
                if (startTime < 10) startTime = 10;
                debug('first timeout: ' + startTime);
                this.cycleTimeout = setTimeout(function() {
                    go(els, opts2, 0, (!opts2.rev && !opts.backwards))
                }, startTime);
            }
        });
    };

    function handleArguments(cont, options, arg2) {
        if (cont.cycleStop == undefined) cont.cycleStop = 0;
        if (options === undefined || options === null) options = {};
        if (options.constructor == String) {
            switch (options) {
                case 'destroy':
                case 'stop':
                    var opts = $(cont).data('cycle.opts');
                    if (!opts) return false;
                    cont.cycleStop++;
                    if (cont.cycleTimeout) clearTimeout(cont.cycleTimeout);
                    cont.cycleTimeout = 0;
                    $(cont).removeData('cycle.opts');
                    if (options == 'destroy') destroy(opts);
                    return false;
                case 'toggle':
                    cont.cyclePause = (cont.cyclePause === 1) ? 0 : 1;
                    checkInstantResume(cont.cyclePause, arg2, cont);
                    return false;
                case 'pause':
                    cont.cyclePause = 1;
                    return false;
                case 'resume':
                    cont.cyclePause = 0;
                    checkInstantResume(false, arg2, cont);
                    return false;
                case 'prev':
                case 'next':
                    var opts = $(cont).data('cycle.opts');
                    if (!opts) {
                        log('options not found, "prev/next" ignored');
                        return false;
                    }
                    $.fn.cycle[options](opts);
                    return false;
                default:
                    options = {
                        fx: options
                    };
            };
            return options;
        } else if (options.constructor == Number) {
            var num = options;
            options = $(cont).data('cycle.opts');
            if (!options) {
                log('options not found, can not advance slide');
                return false;
            }
            if (num < 0 || num >= options.elements.length) {
                log('invalid slide index: ' + num);
                return false;
            }
            options.nextSlide = num;
            if (cont.cycleTimeout) {
                clearTimeout(cont.cycleTimeout);
                cont.cycleTimeout = 0;
            }
            if (typeof arg2 == 'string') options.oneTimeFx = arg2;
            go(options.elements, options, 1, num >= options.currSlide);
            return false;
        }
        return options;

        function checkInstantResume(isPaused, arg2, cont) {
            if (!isPaused && arg2 === true) {
                var options = $(cont).data('cycle.opts');
                if (!options) {
                    log('options not found, can not resume');
                    return false;
                }
                if (cont.cycleTimeout) {
                    clearTimeout(cont.cycleTimeout);
                    cont.cycleTimeout = 0;
                }
                go(options.elements, options, 1, (!opts.rev && !opts.backwards));
            }
        }
    };

    function removeFilter(el, opts) {
        if (!$.support.opacity && opts.cleartype && el.style.filter) {
            try {
                el.style.removeAttribute('filter');
            } catch (smother) {}
        }
    };

    function destroy(opts) {
        if (opts.next) $(opts.next).unbind(opts.prevNextEvent);
        if (opts.prev) $(opts.prev).unbind(opts.prevNextEvent);
        if (opts.pager || opts.pagerAnchorBuilder) $.each(opts.pagerAnchors || [], function() {
            this.unbind().remove();
        });
        opts.pagerAnchors = null;
        if (opts.destroy) opts.destroy(opts);
    };

    function buildOptions($cont, $slides, els, options, o) {
        var opts = $.extend({}, $.fn.cycle.defaults, options || {}, $.metadata ? $cont.metadata() : $.meta ? $cont.data() : {});
        if (opts.autostop) opts.countdown = opts.autostopCount || els.length;
        var cont = $cont[0];
        $cont.data('cycle.opts', opts);
        opts.$cont = $cont;
        opts.stopCount = cont.cycleStop;
        opts.elements = els;
        opts.before = opts.before ? [opts.before] : [];
        opts.after = opts.after ? [opts.after] : [];
        opts.after.unshift(function() {
            opts.busy = 0;
        });
        if (!$.support.opacity && opts.cleartype) opts.after.push(function() {
            removeFilter(this, opts);
        });
        if (opts.continuous) opts.after.push(function() {
            go(els, opts, 0, (!opts.rev && !opts.backwards));
        });
        saveOriginalOpts(opts);
        if (!$.support.opacity && opts.cleartype && !opts.cleartypeNoBg) clearTypeFix($slides);
        if ($cont.css('position') == 'static') $cont.css('position', 'relative');
        if (opts.width) $cont.width(opts.width);
        if (opts.height && opts.height != 'auto') $cont.height(opts.height);
        if (opts.startingSlide) opts.startingSlide = parseInt(opts.startingSlide);
        else if (opts.backwards) opts.startingSlide = els.length - 1;
        if (opts.random) {
            opts.randomMap = [];
            for (var i = 0; i < els.length; i++) opts.randomMap.push(i);
            opts.randomMap.sort(function(a, b) {
                return Math.random() - 0.5;
            });
            opts.randomIndex = 1;
            opts.startingSlide = opts.randomMap[1];
        } else if (opts.startingSlide >= els.length) opts.startingSlide = 0;
        opts.currSlide = opts.startingSlide || 0;
        var first = opts.startingSlide;
        $slides.css({
            position: 'absolute',
            top: 0,
            left: 0
        }).hide().each(function(i) {
            var z;
            if (opts.backwards) z = first ? i <= first ? els.length + (i - first) : first - i : els.length - i;
            else
                z = first ? i >= first ? els.length - (i - first) : first - i : els.length - i;
            $(this).css('z-index', z)
        });
        $(els[first]).css('opacity', 1).show();
        removeFilter(els[first], opts);
        if (opts.fit && opts.width) $slides.width(opts.width);
        if (opts.fit && opts.height && opts.height != 'auto') $slides.height(opts.height);
        var reshape = opts.containerResize && !$cont.innerHeight();
        if (reshape) {
            var maxw = 0,
                maxh = 0;
            for (var j = 0; j < els.length; j++) {
                var $e = $(els[j]),
                    e = $e[0],
                    w = $e.outerWidth(),
                    h = $e.outerHeight();
                if (!w) w = e.offsetWidth || e.width || $e.attr('width')
                if (!h) h = e.offsetHeight || e.height || $e.attr('height');
                maxw = w > maxw ? w : maxw;
                maxh = h > maxh ? h : maxh;
            }
            if (maxw > 0 && maxh > 0) $cont.css({
                width: maxw + 'px',
                height: maxh + 'px'
            });
        }
        if (opts.pause) $cont.hover(function() {
            this.cyclePause++;
        }, function() {
            this.cyclePause--;
        });
        if (supportMultiTransitions(opts) === false) return false;
        var requeue = false;
        options.requeueAttempts = options.requeueAttempts || 0;
        $slides.each(function() {
            var $el = $(this);
            this.cycleH = (opts.fit && opts.height) ? opts.height : ($el.height() || this.offsetHeight || this.height || $el.attr('height') || 0);
            this.cycleW = (opts.fit && opts.width) ? opts.width : ($el.width() || this.offsetWidth || this.width || $el.attr('width') || 0);
            if ($el.is('img')) {
                var loadingIE = ($.browser.msie && this.cycleW == 28 && this.cycleH == 30 && !this.complete);
                var loadingFF = ($.browser.mozilla && this.cycleW == 34 && this.cycleH == 19 && !this.complete);
                var loadingOp = ($.browser.opera && ((this.cycleW == 42 && this.cycleH == 19) || (this.cycleW == 37 && this.cycleH == 17)) && !this.complete);
                var loadingOther = (this.cycleH == 0 && this.cycleW == 0 && !this.complete);
                if (loadingIE || loadingFF || loadingOp || loadingOther) {
                    if (o.s && opts.requeueOnImageNotLoaded && ++options.requeueAttempts < 100) {
                        log(options.requeueAttempts, ' - img slide not loaded, requeuing slideshow: ', this.src, this.cycleW, this.cycleH);
                        setTimeout(function() {
                            $(o.s, o.c).cycle(options)
                        }, opts.requeueTimeout);
                        requeue = true;
                        return false;
                    } else {
                        log('could not determine size of image: ' + this.src, this.cycleW, this.cycleH);
                    }
                }
            }
            return true;
        });
        if (requeue) return false;
        opts.cssBefore = opts.cssBefore || {};
        opts.animIn = opts.animIn || {};
        opts.animOut = opts.animOut || {};
        $slides.not(':eq(' + first + ')').css(opts.cssBefore);
        if (opts.cssFirst) $($slides[first]).css(opts.cssFirst);
        if (opts.timeout) {
            opts.timeout = parseInt(opts.timeout);
            if (opts.speed.constructor == String) opts.speed = $.fx.speeds[opts.speed] || parseInt(opts.speed);
            if (!opts.sync) opts.speed = opts.speed / 2;
            var buffer = opts.fx == 'shuffle' ? 500 : 250;
            while ((opts.timeout - opts.speed) < buffer) opts.timeout += opts.speed;
        }
        if (opts.easing) opts.easeIn = opts.easeOut = opts.easing;
        if (!opts.speedIn) opts.speedIn = opts.speed;
        if (!opts.speedOut) opts.speedOut = opts.speed;
        opts.slideCount = els.length;
        opts.currSlide = opts.lastSlide = first;
        if (opts.random) {
            if (++opts.randomIndex == els.length) opts.randomIndex = 0;
            opts.nextSlide = opts.randomMap[opts.randomIndex];
        } else if (opts.backwards) opts.nextSlide = opts.startingSlide == 0 ? (els.length - 1) : opts.startingSlide - 1;
        else
            opts.nextSlide = opts.startingSlide >= (els.length - 1) ? 0 : opts.startingSlide + 1;
        if (!opts.multiFx) {
            var init = $.fn.cycle.transitions[opts.fx];
            if ($.isFunction(init)) init($cont, $slides, opts);
            else if (opts.fx != 'custom' && !opts.multiFx) {
                log('unknown transition: ' + opts.fx, '; slideshow terminating');
                return false;
            }
        }
        var e0 = $slides[first];
        if (opts.before.length) opts.before[0].apply(e0, [e0, e0, opts, true]);
        if (opts.after.length > 1) opts.after[1].apply(e0, [e0, e0, opts, true]);
        if (opts.next) $(opts.next).bind(opts.prevNextEvent, function() {
            return advance(opts, opts.rev ? -1 : 1)
        });
        if (opts.prev) $(opts.prev).bind(opts.prevNextEvent, function() {
            return advance(opts, opts.rev ? 1 : -1)
        });
        if (opts.pager || opts.pagerAnchorBuilder) buildPager(els, opts);
        exposeAddSlide(opts, els);
        return opts;
    };

    function saveOriginalOpts(opts) {
        opts.original = {
            before: [],
            after: []
        };
        opts.original.cssBefore = $.extend({}, opts.cssBefore);
        opts.original.cssAfter = $.extend({}, opts.cssAfter);
        opts.original.animIn = $.extend({}, opts.animIn);
        opts.original.animOut = $.extend({}, opts.animOut);
        $.each(opts.before, function() {
            opts.original.before.push(this);
        });
        $.each(opts.after, function() {
            opts.original.after.push(this);
        });
    };

    function supportMultiTransitions(opts) {
        var i, tx, txs = $.fn.cycle.transitions;
        if (opts.fx.indexOf(',') > 0) {
            opts.multiFx = true;
            opts.fxs = opts.fx.replace(/\s*/g, '').split(',');
            for (i = 0; i < opts.fxs.length; i++) {
                var fx = opts.fxs[i];
                tx = txs[fx];
                if (!tx || !txs.hasOwnProperty(fx) || !$.isFunction(tx)) {
                    log('discarding unknown transition: ', fx);
                    opts.fxs.splice(i, 1);
                    i--;
                }
            }
            if (!opts.fxs.length) {
                log('No valid transitions named; slideshow terminating.');
                return false;
            }
        } else if (opts.fx == 'all') {
            opts.multiFx = true;
            opts.fxs = [];
            for (p in txs) {
                tx = txs[p];
                if (txs.hasOwnProperty(p) && $.isFunction(tx)) opts.fxs.push(p);
            }
        }
        if (opts.multiFx && opts.randomizeEffects) {
            var r1 = Math.floor(Math.random() * 20) + 30;
            for (i = 0; i < r1; i++) {
                var r2 = Math.floor(Math.random() * opts.fxs.length);
                opts.fxs.push(opts.fxs.splice(r2, 1)[0]);
            }
            debug('randomized fx sequence: ', opts.fxs);
        }
        return true;
    };

    function exposeAddSlide(opts, els) {
        opts.addSlide = function(newSlide, prepend) {
            var $s = $(newSlide),
                s = $s[0];
            if (!opts.autostopCount) opts.countdown++;
            els[prepend ? 'unshift' : 'push'](s);
            if (opts.els) opts.els[prepend ? 'unshift' : 'push'](s);
            opts.slideCount = els.length;
            $s.css('position', 'absolute');
            $s[prepend ? 'prependTo' : 'appendTo'](opts.$cont);
            if (prepend) {
                opts.currSlide++;
                opts.nextSlide++;
            }
            if (!$.support.opacity && opts.cleartype && !opts.cleartypeNoBg) clearTypeFix($s);
            if (opts.fit && opts.width) $s.width(opts.width);
            if (opts.fit && opts.height && opts.height != 'auto') $slides.height(opts.height);
            s.cycleH = (opts.fit && opts.height) ? opts.height : $s.height();
            s.cycleW = (opts.fit && opts.width) ? opts.width : $s.width();
            $s.css(opts.cssBefore);
            if (opts.pager || opts.pagerAnchorBuilder) $.fn.cycle.createPagerAnchor(els.length - 1, s, $(opts.pager), els, opts);
            if ($.isFunction(opts.onAddSlide)) opts.onAddSlide($s);
            else
                $s.hide();
        };
    }
    $.fn.cycle.resetState = function(opts, fx) {
        fx = fx || opts.fx;
        opts.before = [];
        opts.after = [];
        opts.cssBefore = $.extend({}, opts.original.cssBefore);
        opts.cssAfter = $.extend({}, opts.original.cssAfter);
        opts.animIn = $.extend({}, opts.original.animIn);
        opts.animOut = $.extend({}, opts.original.animOut);
        opts.fxFn = null;
        $.each(opts.original.before, function() {
            opts.before.push(this);
        });
        $.each(opts.original.after, function() {
            opts.after.push(this);
        });
        var init = $.fn.cycle.transitions[fx];
        if ($.isFunction(init)) init(opts.$cont, $(opts.elements), opts);
    };

    function go(els, opts, manual, fwd) {
        if (manual && opts.busy && opts.manualTrump) {
            debug('manualTrump in go(), stopping active transition');
            $(els).stop(true, true);
            opts.busy = false;
        }
        if (opts.busy) {
            debug('transition active, ignoring new tx request');
            return;
        }
        var p = opts.$cont[0],
            curr = els[opts.currSlide],
            next = els[opts.nextSlide];
        if (p.cycleStop != opts.stopCount || p.cycleTimeout === 0 && !manual) return;
        if (!manual && !p.cyclePause && !opts.bounce && ((opts.autostop && (--opts.countdown <= 0)) || (opts.nowrap && !opts.random && opts.nextSlide < opts.currSlide))) {
            if (opts.end) opts.end(opts);
            return;
        }
        var changed = false;
        if ((manual || !p.cyclePause) && (opts.nextSlide != opts.currSlide)) {
            changed = true;
            var fx = opts.fx;
            curr.cycleH = curr.cycleH || $(curr).height();
            curr.cycleW = curr.cycleW || $(curr).width();
            next.cycleH = next.cycleH || $(next).height();
            next.cycleW = next.cycleW || $(next).width();
            if (opts.multiFx) {
                if (opts.lastFx == undefined || ++opts.lastFx >= opts.fxs.length) opts.lastFx = 0;
                fx = opts.fxs[opts.lastFx];
                opts.currFx = fx;
            }
            if (opts.oneTimeFx) {
                fx = opts.oneTimeFx;
                opts.oneTimeFx = null;
            }
            $.fn.cycle.resetState(opts, fx);
            if (opts.before.length) $.each(opts.before, function(i, o) {
                if (p.cycleStop != opts.stopCount) return;
                o.apply(next, [curr, next, opts, fwd]);
            });
            var after = function() {
                $.each(opts.after, function(i, o) {
                    if (p.cycleStop != opts.stopCount) return;
                    o.apply(next, [curr, next, opts, fwd]);
                });
            };
            debug('tx firing; currSlide: ' + opts.currSlide + '; nextSlide: ' + opts.nextSlide);
            opts.busy = 1;
            if (opts.fxFn) opts.fxFn(curr, next, opts, after, fwd, manual && opts.fastOnEvent);
            else if ($.isFunction($.fn.cycle[opts.fx])) $.fn.cycle[opts.fx](curr, next, opts, after, fwd, manual && opts.fastOnEvent);
            else
                $.fn.cycle.custom(curr, next, opts, after, fwd, manual && opts.fastOnEvent);
        }
        if (changed || opts.nextSlide == opts.currSlide) {
            opts.lastSlide = opts.currSlide;
            if (opts.random) {
                opts.currSlide = opts.nextSlide;
                if (++opts.randomIndex == els.length) opts.randomIndex = 0;
                opts.nextSlide = opts.randomMap[opts.randomIndex];
                if (opts.nextSlide == opts.currSlide) opts.nextSlide = (opts.currSlide == opts.slideCount - 1) ? 0 : opts.currSlide + 1;
            } else if (opts.backwards) {
                var roll = (opts.nextSlide - 1) < 0;
                if (roll && opts.bounce) {
                    opts.backwards = !opts.backwards;
                    opts.nextSlide = 1;
                    opts.currSlide = 0;
                } else {
                    opts.nextSlide = roll ? (els.length - 1) : opts.nextSlide - 1;
                    opts.currSlide = roll ? 0 : opts.nextSlide + 1;
                }
            } else {
                var roll = (opts.nextSlide + 1) == els.length;
                if (roll && opts.bounce) {
                    opts.backwards = !opts.backwards;
                    opts.nextSlide = els.length - 2;
                    opts.currSlide = els.length - 1;
                } else {
                    opts.nextSlide = roll ? 0 : opts.nextSlide + 1;
                    opts.currSlide = roll ? els.length - 1 : opts.nextSlide - 1;
                }
            }
        }
        if (changed && opts.pager) opts.updateActivePagerLink(opts.pager, opts.currSlide, opts.activePagerClass);
        var ms = 0;
        if (opts.timeout && !opts.continuous) ms = getTimeout(els[opts.currSlide], els[opts.nextSlide], opts, fwd);
        else if (opts.continuous && p.cyclePause) ms = 10;
        if (ms > 0) p.cycleTimeout = setTimeout(function() {
            go(els, opts, 0, (!opts.rev && !opts.backwards))
        }, ms);
    };
    $.fn.cycle.updateActivePagerLink = function(pager, currSlide, clsName) {
        $(pager).each(function() {
            $(this).children().removeClass(clsName).eq(currSlide).addClass(clsName);
        });
    };

    function getTimeout(curr, next, opts, fwd) {
        if (opts.timeoutFn) {
            var t = opts.timeoutFn.call(curr, curr, next, opts, fwd);
            while ((t - opts.speed) < 250) t += opts.speed;
            debug('calculated timeout: ' + t + '; speed: ' + opts.speed);
            if (t !== false) return t;
        }
        return opts.timeout;
    };
    $.fn.cycle.next = function(opts) {
        advance(opts, opts.rev ? -1 : 1);
    };
    $.fn.cycle.prev = function(opts) {
        advance(opts, opts.rev ? 1 : -1);
    };

    function advance(opts, val) {
        var els = opts.elements;
        var p = opts.$cont[0],
            timeout = p.cycleTimeout;
        if (timeout) {
            clearTimeout(timeout);
            p.cycleTimeout = 0;
        }
        if (opts.random && val < 0) {
            opts.randomIndex--;
            if (--opts.randomIndex == -2) opts.randomIndex = els.length - 2;
            else if (opts.randomIndex == -1) opts.randomIndex = els.length - 1;
            opts.nextSlide = opts.randomMap[opts.randomIndex];
        } else if (opts.random) {
            opts.nextSlide = opts.randomMap[opts.randomIndex];
        } else {
            opts.nextSlide = opts.currSlide + val;
            if (opts.nextSlide < 0) {
                if (opts.nowrap) return false;
                opts.nextSlide = els.length - 1;
            } else if (opts.nextSlide >= els.length) {
                if (opts.nowrap) return false;
                opts.nextSlide = 0;
            }
        }
        var cb = opts.onPrevNextEvent || opts.prevNextClick;
        if ($.isFunction(cb)) cb(val > 0, opts.nextSlide, els[opts.nextSlide]);
        go(els, opts, 1, val >= 0);
        return false;
    };

    function buildPager(els, opts) {
        var $p = $(opts.pager);
        $.each(els, function(i, o) {
            $.fn.cycle.createPagerAnchor(i, o, $p, els, opts);
        });
        opts.updateActivePagerLink(opts.pager, opts.startingSlide, opts.activePagerClass);
    };
    $.fn.cycle.createPagerAnchor = function(i, el, $p, els, opts) {
        var a;
        if ($.isFunction(opts.pagerAnchorBuilder)) {
            a = opts.pagerAnchorBuilder(i, el);
            debug('pagerAnchorBuilder(' + i + ', el) returned: ' + a);
        } else
            a = '<a href="#">' + (i + 1) + '</a>';
        if (!a) return;
        var $a = $(a);
        if ($a.parents('body').length === 0) {
            var arr = [];
            if ($p.length > 1) {
                $p.each(function() {
                    var $clone = $a.clone(true);
                    $(this).append($clone);
                    arr.push($clone[0]);
                });
                $a = $(arr);
            } else {
                $a.appendTo($p);
            }
        }
        opts.pagerAnchors = opts.pagerAnchors || [];
        opts.pagerAnchors.push($a);
        $a.bind(opts.pagerEvent, function(e) {
            e.preventDefault();
            opts.nextSlide = i;
            var p = opts.$cont[0],
                timeout = p.cycleTimeout;
            if (timeout) {
                clearTimeout(timeout);
                p.cycleTimeout = 0;
            }
            var cb = opts.onPagerEvent || opts.pagerClick;
            if ($.isFunction(cb)) cb(opts.nextSlide, els[opts.nextSlide]);
            go(els, opts, 1, opts.currSlide < i);
        });
        if (!/^click/.test(opts.pagerEvent) && !opts.allowPagerClickBubble) $a.bind('click.cycle', function() {
            return false;
        });
        if (opts.pauseOnPagerHover) $a.hover(function() {
            opts.$cont[0].cyclePause++;
        }, function() {
            opts.$cont[0].cyclePause--;
        });
    };
    $.fn.cycle.hopsFromLast = function(opts, fwd) {
        var hops, l = opts.lastSlide,
            c = opts.currSlide;
        if (fwd) hops = c > l ? c - l : opts.slideCount - l;
        else
            hops = c < l ? l - c : l + opts.slideCount - c;
        return hops;
    };

    function clearTypeFix($slides) {
        debug('applying clearType background-color hack');

        function hex(s) {
            s = parseInt(s).toString(16);
            return s.length < 2 ? '0' + s : s;
        };

        function getBg(e) {
            for (; e && e.nodeName.toLowerCase() != 'html'; e = e.parentNode) {
                var v = $.css(e, 'background-color');
                if (v.indexOf('rgb') >= 0) {
                    var rgb = v.match(/\d+/g);
                    return '#' + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
                }
                if (v && v != 'transparent') return v;
            }
            return '#ffffff';
        };
        $slides.each(function() {
            $(this).css('background-color', getBg(this));
        });
    };
    $.fn.cycle.commonReset = function(curr, next, opts, w, h, rev) {
        $(opts.elements).not(curr).hide();
        opts.cssBefore.opacity = 1;
        opts.cssBefore.display = 'block';
        if (w !== false && next.cycleW > 0) opts.cssBefore.width = next.cycleW;
        if (h !== false && next.cycleH > 0) opts.cssBefore.height = next.cycleH;
        opts.cssAfter = opts.cssAfter || {};
        opts.cssAfter.display = 'none';
        $(curr).css('zIndex', opts.slideCount + (rev === true ? 1 : 0));
        $(next).css('zIndex', opts.slideCount + (rev === true ? 0 : 1));
    };
    $.fn.cycle.custom = function(curr, next, opts, cb, fwd, speedOverride) {
        var $l = $(curr),
            $n = $(next);
        var speedIn = opts.speedIn,
            speedOut = opts.speedOut,
            easeIn = opts.easeIn,
            easeOut = opts.easeOut;
        $n.css(opts.cssBefore);
        if (speedOverride) {
            if (typeof speedOverride == 'number') speedIn = speedOut = speedOverride;
            else
                speedIn = speedOut = 1;
            easeIn = easeOut = null;
        }
        var fn = function() {
            $n.animate(opts.animIn, speedIn, easeIn, cb)
        };
        $l.animate(opts.animOut, speedOut, easeOut, function() {
            if (opts.cssAfter) $l.css(opts.cssAfter);
            if (!opts.sync) fn();
        });
        if (opts.sync) fn();
    };
    $.fn.cycle.transitions = {
        fade: function($cont, $slides, opts) {
            $slides.not(':eq(' + opts.currSlide + ')').css('opacity', 0);
            opts.before.push(function(curr, next, opts) {
                $.fn.cycle.commonReset(curr, next, opts);
                opts.cssBefore.opacity = 0;
            });
            opts.animIn = {
                opacity: 1
            };
            opts.animOut = {
                opacity: 0
            };
            opts.cssBefore = {
                top: 0,
                left: 0
            };
        }
    };
    $.fn.cycle.ver = function() {
        return ver;
    };
    $.fn.cycle.defaults = {
        fx: 'fade',
        timeout: 4000,
        timeoutFn: null,
        continuous: 0,
        speed: 1000,
        speedIn: null,
        speedOut: null,
        next: null,
        prev: null,
        onPrevNextEvent: null,
        prevNextEvent: 'click.cycle',
        pager: null,
        onPagerEvent: null,
        pagerEvent: 'click.cycle',
        allowPagerClickBubble: false,
        pagerAnchorBuilder: null,
        before: null,
        after: null,
        end: null,
        easing: null,
        easeIn: null,
        easeOut: null,
        shuffle: null,
        animIn: null,
        animOut: null,
        cssBefore: null,
        cssAfter: null,
        fxFn: null,
        height: 'auto',
        startingSlide: 0,
        sync: 1,
        random: 0,
        fit: 0,
        containerResize: 1,
        pause: 0,
        pauseOnPagerHover: 0,
        autostop: 0,
        autostopCount: 0,
        delay: 0,
        slideExpr: null,
        cleartype: !$.support.opacity,
        cleartypeNoBg: false,
        nowrap: 0,
        fastOnEvent: 0,
        randomizeEffects: 1,
        rev: 0,
        manualTrump: true,
        requeueOnImageNotLoaded: true,
        requeueTimeout: 250,
        activePagerClass: 'activeSlide',
        updateActivePagerLink: null,
        backwards: false
    };
})(jQuery);
(function($) {
    $.fn.cycle.transitions.none = function($cont, $slides, opts) {
        opts.fxFn = function(curr, next, opts, after) {
            $(next).show();
            $(curr).hide();
            after();
        };
    }
    $.fn.cycle.transitions.scrollUp = function($cont, $slides, opts) {
        $cont.css('overflow', 'hidden');
        opts.before.push($.fn.cycle.commonReset);
        var h = $cont.height();
        opts.cssBefore = {
            top: h,
            left: 0
        };
        opts.cssFirst = {
            top: 0
        };
        opts.animIn = {
            top: 0
        };
        opts.animOut = {
            top: -h
        };
    };
    $.fn.cycle.transitions.scrollDown = function($cont, $slides, opts) {
        $cont.css('overflow', 'hidden');
        opts.before.push($.fn.cycle.commonReset);
        var h = $cont.height();
        opts.cssFirst = {
            top: 0
        };
        opts.cssBefore = {
            top: -h,
            left: 0
        };
        opts.animIn = {
            top: 0
        };
        opts.animOut = {
            top: h
        };
    };
    $.fn.cycle.transitions.scrollLeft = function($cont, $slides, opts) {
        $cont.css('overflow', 'hidden');
        opts.before.push($.fn.cycle.commonReset);
        var w = $cont.width();
        opts.cssFirst = {
            left: 0
        };
        opts.cssBefore = {
            left: w,
            top: 0
        };
        opts.animIn = {
            left: 0
        };
        opts.animOut = {
            left: 0 - w
        };
    };
    $.fn.cycle.transitions.scrollRight = function($cont, $slides, opts) {
        $cont.css('overflow', 'hidden');
        opts.before.push($.fn.cycle.commonReset);
        var w = $cont.width();
        opts.cssFirst = {
            left: 0
        };
        opts.cssBefore = {
            left: -w,
            top: 0
        };
        opts.animIn = {
            left: 0
        };
        opts.animOut = {
            left: w
        };
    };
    $.fn.cycle.transitions.scrollHorz = function($cont, $slides, opts) {
        $cont.css('overflow', 'hidden').width();
        opts.before.push(function(curr, next, opts, fwd) {
            $.fn.cycle.commonReset(curr, next, opts);
            opts.cssBefore.left = fwd ? (next.cycleW - 1) : (1 - next.cycleW);
            opts.animOut.left = fwd ? -curr.cycleW : curr.cycleW;
        });
        opts.cssFirst = {
            left: 0
        };
        opts.cssBefore = {
            top: 0
        };
        opts.animIn = {
            left: 0
        };
        opts.animOut = {
            top: 0
        };
    };
    $.fn.cycle.transitions.scrollVert = function($cont, $slides, opts) {
        $cont.css('overflow', 'hidden');
        opts.before.push(function(curr, next, opts, fwd) {
            $.fn.cycle.commonReset(curr, next, opts);
            opts.cssBefore.top = fwd ? (1 - next.cycleH) : (next.cycleH - 1);
            opts.animOut.top = fwd ? curr.cycleH : -curr.cycleH;
        });
        opts.cssFirst = {
            top: 0
        };
        opts.cssBefore = {
            left: 0
        };
        opts.animIn = {
            top: 0
        };
        opts.animOut = {
            left: 0
        };
    };
    $.fn.cycle.transitions.slideX = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $(opts.elements).not(curr).hide();
            $.fn.cycle.commonReset(curr, next, opts, false, true);
            opts.animIn.width = next.cycleW;
        });
        opts.cssBefore = {
            left: 0,
            top: 0,
            width: 0
        };
        opts.animIn = {
            width: 'show'
        };
        opts.animOut = {
            width: 0
        };
    };
    $.fn.cycle.transitions.slideY = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $(opts.elements).not(curr).hide();
            $.fn.cycle.commonReset(curr, next, opts, true, false);
            opts.animIn.height = next.cycleH;
        });
        opts.cssBefore = {
            left: 0,
            top: 0,
            height: 0
        };
        opts.animIn = {
            height: 'show'
        };
        opts.animOut = {
            height: 0
        };
    };
    $.fn.cycle.transitions.shuffle = function($cont, $slides, opts) {
        var i, w = $cont.css('overflow', 'visible').width();
        $slides.css({
            left: 0,
            top: 0
        });
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, true, true, true);
        });
        if (!opts.speedAdjusted) {
            opts.speed = opts.speed / 2;
            opts.speedAdjusted = true;
        }
        opts.random = 0;
        opts.shuffle = opts.shuffle || {
            left: -w,
            top: 15
        };
        opts.els = [];
        for (i = 0; i < $slides.length; i++) opts.els.push($slides[i]);
        for (i = 0; i < opts.currSlide; i++) opts.els.push(opts.els.shift());
        opts.fxFn = function(curr, next, opts, cb, fwd) {
            var $el = fwd ? $(curr) : $(next);
            $(next).css(opts.cssBefore);
            var count = opts.slideCount;
            $el.animate(opts.shuffle, opts.speedIn, opts.easeIn, function() {
                var hops = $.fn.cycle.hopsFromLast(opts, fwd);
                for (var k = 0; k < hops; k++) fwd ? opts.els.push(opts.els.shift()) : opts.els.unshift(opts.els.pop());
                if (fwd) {
                    for (var i = 0, len = opts.els.length; i < len; i++) $(opts.els[i]).css('z-index', len - i + count);
                } else {
                    var z = $(curr).css('z-index');
                    $el.css('z-index', parseInt(z) + 1 + count);
                }
                $el.animate({
                    left: 0,
                    top: 0
                }, opts.speedOut, opts.easeOut, function() {
                    $(fwd ? this : curr).hide();
                    if (cb) cb();
                });
            });
        };
        opts.cssBefore = {
            display: 'block',
            opacity: 1,
            top: 0,
            left: 0
        };
    };
    $.fn.cycle.transitions.turnUp = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, true, false);
            opts.cssBefore.top = next.cycleH;
            opts.animIn.height = next.cycleH;
        });
        opts.cssFirst = {
            top: 0
        };
        opts.cssBefore = {
            left: 0,
            height: 0
        };
        opts.animIn = {
            top: 0
        };
        opts.animOut = {
            height: 0
        };
    };
    $.fn.cycle.transitions.turnDown = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, true, false);
            opts.animIn.height = next.cycleH;
            opts.animOut.top = curr.cycleH;
        });
        opts.cssFirst = {
            top: 0
        };
        opts.cssBefore = {
            left: 0,
            top: 0,
            height: 0
        };
        opts.animOut = {
            height: 0
        };
    };
    $.fn.cycle.transitions.turnLeft = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, false, true);
            opts.cssBefore.left = next.cycleW;
            opts.animIn.width = next.cycleW;
        });
        opts.cssBefore = {
            top: 0,
            width: 0
        };
        opts.animIn = {
            left: 0
        };
        opts.animOut = {
            width: 0
        };
    };
    $.fn.cycle.transitions.turnRight = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, false, true);
            opts.animIn.width = next.cycleW;
            opts.animOut.left = curr.cycleW;
        });
        opts.cssBefore = {
            top: 0,
            left: 0,
            width: 0
        };
        opts.animIn = {
            left: 0
        };
        opts.animOut = {
            width: 0
        };
    };
    $.fn.cycle.transitions.zoom = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, false, false, true);
            opts.cssBefore.top = next.cycleH / 2;
            opts.cssBefore.left = next.cycleW / 2;
            opts.animIn = {
                top: 0,
                left: 0,
                width: next.cycleW,
                height: next.cycleH
            };
            opts.animOut = {
                width: 0,
                height: 0,
                top: curr.cycleH / 2,
                left: curr.cycleW / 2
            };
        });
        opts.cssFirst = {
            top: 0,
            left: 0
        };
        opts.cssBefore = {
            width: 0,
            height: 0
        };
    };
    $.fn.cycle.transitions.fadeZoom = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, false, false);
            opts.cssBefore.left = next.cycleW / 2;
            opts.cssBefore.top = next.cycleH / 2;
            opts.animIn = {
                top: 0,
                left: 0,
                width: next.cycleW,
                height: next.cycleH
            };
        });
        opts.cssBefore = {
            width: 0,
            height: 0
        };
        opts.animOut = {
            opacity: 0
        };
    };
    $.fn.cycle.transitions.blindX = function($cont, $slides, opts) {
        var w = $cont.css('overflow', 'hidden').width();
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts);
            opts.animIn.width = next.cycleW;
            opts.animOut.left = curr.cycleW;
        });
        opts.cssBefore = {
            left: w,
            top: 0
        };
        opts.animIn = {
            left: 0
        };
        opts.animOut = {
            left: w
        };
    };
    $.fn.cycle.transitions.blindY = function($cont, $slides, opts) {
        var h = $cont.css('overflow', 'hidden').height();
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts);
            opts.animIn.height = next.cycleH;
            opts.animOut.top = curr.cycleH;
        });
        opts.cssBefore = {
            top: h,
            left: 0
        };
        opts.animIn = {
            top: 0
        };
        opts.animOut = {
            top: h
        };
    };
    $.fn.cycle.transitions.blindZ = function($cont, $slides, opts) {
        var h = $cont.css('overflow', 'hidden').height();
        var w = $cont.width();
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts);
            opts.animIn.height = next.cycleH;
            opts.animOut.top = curr.cycleH;
        });
        opts.cssBefore = {
            top: h,
            left: w
        };
        opts.animIn = {
            top: 0,
            left: 0
        };
        opts.animOut = {
            top: h,
            left: w
        };
    };
    $.fn.cycle.transitions.growX = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, false, true);
            opts.cssBefore.left = this.cycleW / 2;
            opts.animIn = {
                left: 0,
                width: this.cycleW
            };
            opts.animOut = {
                left: 0
            };
        });
        opts.cssBefore = {
            width: 0,
            top: 0
        };
    };
    $.fn.cycle.transitions.growY = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, true, false);
            opts.cssBefore.top = this.cycleH / 2;
            opts.animIn = {
                top: 0,
                height: this.cycleH
            };
            opts.animOut = {
                top: 0
            };
        });
        opts.cssBefore = {
            height: 0,
            left: 0
        };
    };
    $.fn.cycle.transitions.curtainX = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, false, true, true);
            opts.cssBefore.left = next.cycleW / 2;
            opts.animIn = {
                left: 0,
                width: this.cycleW
            };
            opts.animOut = {
                left: curr.cycleW / 2,
                width: 0
            };
        });
        opts.cssBefore = {
            top: 0,
            width: 0
        };
    };
    $.fn.cycle.transitions.curtainY = function($cont, $slides, opts) {
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, true, false, true);
            opts.cssBefore.top = next.cycleH / 2;
            opts.animIn = {
                top: 0,
                height: next.cycleH
            };
            opts.animOut = {
                top: curr.cycleH / 2,
                height: 0
            };
        });
        opts.cssBefore = {
            left: 0,
            height: 0
        };
    };
    $.fn.cycle.transitions.cover = function($cont, $slides, opts) {
        var d = opts.direction || 'left';
        var w = $cont.css('overflow', 'hidden').width();
        var h = $cont.height();
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts);
            if (d == 'right') opts.cssBefore.left = -w;
            else if (d == 'up') opts.cssBefore.top = h;
            else if (d == 'down') opts.cssBefore.top = -h;
            else
                opts.cssBefore.left = w;
        });
        opts.animIn = {
            left: 0,
            top: 0
        };
        opts.animOut = {
            opacity: 1
        };
        opts.cssBefore = {
            top: 0,
            left: 0
        };
    };
    $.fn.cycle.transitions.uncover = function($cont, $slides, opts) {
        var d = opts.direction || 'left';
        var w = $cont.css('overflow', 'hidden').width();
        var h = $cont.height();
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, true, true, true);
            if (d == 'right') opts.animOut.left = w;
            else if (d == 'up') opts.animOut.top = -h;
            else if (d == 'down') opts.animOut.top = h;
            else
                opts.animOut.left = -w;
        });
        opts.animIn = {
            left: 0,
            top: 0
        };
        opts.animOut = {
            opacity: 1
        };
        opts.cssBefore = {
            top: 0,
            left: 0
        };
    };
    $.fn.cycle.transitions.toss = function($cont, $slides, opts) {
        var w = $cont.css('overflow', 'visible').width();
        var h = $cont.height();
        opts.before.push(function(curr, next, opts) {
            $.fn.cycle.commonReset(curr, next, opts, true, true, true);
            if (!opts.animOut.left && !opts.animOut.top) opts.animOut = {
                left: w * 2,
                top: -h / 2,
                opacity: 0
            };
            else
                opts.animOut.opacity = 0;
        });
        opts.cssBefore = {
            left: 0,
            top: 0
        };
        opts.animIn = {
            left: 0
        };
    };
    $.fn.cycle.transitions.wipe = function($cont, $slides, opts) {
        var w = $cont.css('overflow', 'hidden').width();
        var h = $cont.height();
        opts.cssBefore = opts.cssBefore || {};
        var clip;
        if (opts.clip) {
            if (/l2r/.test(opts.clip)) clip = 'rect(0px 0px ' + h + 'px 0px)';
            else if (/r2l/.test(opts.clip)) clip = 'rect(0px ' + w + 'px ' + h + 'px ' + w + 'px)';
            else if (/t2b/.test(opts.clip)) clip = 'rect(0px ' + w + 'px 0px 0px)';
            else if (/b2t/.test(opts.clip)) clip = 'rect(' + h + 'px ' + w + 'px ' + h + 'px 0px)';
            else if (/zoom/.test(opts.clip)) {
                var top = parseInt(h / 2);
                var left = parseInt(w / 2);
                clip = 'rect(' + top + 'px ' + left + 'px ' + top + 'px ' + left + 'px)';
            }
        }
        opts.cssBefore.clip = opts.cssBefore.clip || clip || 'rect(0px 0px 0px 0px)';
        var d = opts.cssBefore.clip.match(/(\d+)/g);
        var t = parseInt(d[0]),
            r = parseInt(d[1]),
            b = parseInt(d[2]),
            l = parseInt(d[3]);
        opts.before.push(function(curr, next, opts) {
            if (curr == next) return;
            var $curr = $(curr),
                $next = $(next);
            $.fn.cycle.commonReset(curr, next, opts, true, true, false);
            opts.cssAfter.display = 'block';
            var step = 1,
                count = parseInt((opts.speedIn / 13)) - 1;
            (function f() {
                var tt = t ? t - parseInt(step * (t / count)) : 0;
                var ll = l ? l - parseInt(step * (l / count)) : 0;
                var bb = b < h ? b + parseInt(step * ((h - b) / count || 1)) : h;
                var rr = r < w ? r + parseInt(step * ((w - r) / count || 1)) : w;
                $next.css({
                    clip: 'rect(' + tt + 'px ' + rr + 'px ' + bb + 'px ' + ll + 'px)'
                });
                (step++ <= count) ? setTimeout(f, 13): $curr.css('display', 'none');
            })();
        });
        opts.cssBefore = {
            display: 'block',
            opacity: 1,
            top: 0,
            left: 0
        };
        opts.animIn = {
            left: 0
        };
        opts.animOut = {
            left: 0
        };
    };
})(jQuery);
jQuery(function() {
    initLightbox();
});

function initLightbox() {
    jQuery('a[rel*="lightbox"]').each(function() {
        var link = jQuery(this);
        link.fancybox({
            padding: 10,
            cyclic: false,
            overlayShow: true,
            overlayOpacity: 0.65,
            overlayColor: '#000',
            titlePosition: 'inside',
            titleFormat: function(title, currentArray, currentIndex, currentOpts) {
                return '<span>Image ' + (currentIndex + 1) + ' / ' + currentArray.length + (title.length ? ' &nbsp; ' + title : '') + '</span>';
            },
            onComplete: function(box) {
                if (link.attr('href').indexOf('#') === 0) {
                    jQuery('#fancybox-content').find('a.close').unbind('click.fb').bind('click.fb', function(e) {
                        jQuery.fancybox.close();
                        e.preventDefault();
                    });
                }
            }
        });
    });
    jQuery('a.lightbox').each(function() {
        var link = jQuery(this);
        link.fancybox({
            padding: 10,
            cyclic: false,
            overlayShow: true,
            overlayOpacity: 0.65,
            overlayColor: '#000',
            titlePosition: 'inside',
            onComplete: function(box) {
                if (link.attr('href').indexOf('#') === 0) {
                    jQuery('#fancybox-content').find('a.close').unbind('click.fb').bind('click.fb', function(e) {
                        jQuery.fancybox.close();
                        e.preventDefault();
                    });
                }
            }
        });
    });
}
jQuery(function() {
    var isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    var isWinPhoneDevice = navigator.msPointerEnabled && /MSIE 10.*Touch/.test(navigator.userAgent);
    if (!isTouchDevice && !isWinPhoneDevice) {
        var head = document.getElementsByTagName('head')[0],
            style = document.createElement('style'),
            rules = document.createTextNode('#fancybox-overlay' + '{' + 'position:fixed;' + 'top:0;' + 'left:0;' + '}');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = rules.nodeValue;
        } else {
            style.appendChild(rules);
        }
        head.appendChild(style);
    }
});;
(function(B) {
    var L, T, Q, M, d, m, J, A, O, z, C = 0,
        H = {},
        j = [],
        e = 0,
        G = {},
        y = [],
        f = null,
        o = new Image(),
        i = /\.(jpg|gif|png|bmp|jpeg)(.*)?$/i,
        k = /[^\.]\.(swf)\s*$/i,
        p, N = 1,
        h = 0,
        t = "",
        b, c, P = false,
        s = B.extend(B("<div/>")[0], {
            prop: 0
        }),
        S = /MSIE 6/.test(navigator.userAgent) && B.browser.version < 7 && !window.XMLHttpRequest,
        r = function() {
            T.hide();
            o.onerror = o.onload = null;
            if (f) {
                f.abort()
            }
            L.empty()
        },
        x = function() {
            if (false === H.onError(j, C, H)) {
                T.hide();
                P = false;
                return
            }
            H.titleShow = false;
            H.width = "auto";
            H.height = "auto";
            L.html('<p id="fancybox-error">The requested content cannot be loaded.<br />Please try again later.</p>');
            n()
        },
        w = function() {
            var Z = j[C],
                W, Y, ab, aa, V, X;
            r();
            H = B.extend({}, B.fn.fancybox.defaults, (typeof B(Z).data("fancybox") == "undefined" ? H : B(Z).data("fancybox")));
            X = H.onStart(j, C, H);
            if (X === false) {
                P = false;
                return
            } else {
                if (typeof X == "object") {
                    H = B.extend(H, X)
                }
            }
            ab = H.title || (Z.nodeName ? B(Z).attr("title") : Z.title) || "";
            if (Z.nodeName && !H.orig) {
                H.orig = B(Z).children("img:first").length ? B(Z).children("img:first") : B(Z)
            }
            if (ab === "" && H.orig && H.titleFromAlt) {
                ab = H.orig.attr("alt")
            }
            W = H.href || (Z.nodeName ? B(Z).attr("href") : Z.href) || null;
            if ((/^(?:javascript)/i).test(W) || W == "#") {
                W = null
            }
            if (H.type) {
                Y = H.type;
                if (!W) {
                    W = H.content
                }
            } else {
                if (H.content) {
                    Y = "html"
                } else {
                    if (W) {
                        if (W.match(i)) {
                            Y = "image"
                        } else {
                            if (W.match(k)) {
                                Y = "swf"
                            } else {
                                if (B(Z).hasClass("iframe")) {
                                    Y = "iframe"
                                } else {
                                    if (W.indexOf("#") === 0) {
                                        Y = "inline"
                                    } else {
                                        Y = "ajax"
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (!Y) {
                x();
                return
            }
            if (Y == "inline") {
                Z = W.substr(W.indexOf("#"));
                Y = B(Z).length > 0 ? "inline" : "ajax"
            }
            H.type = Y;
            H.href = W;
            H.title = ab;
            if (H.autoDimensions) {
                if (H.type == "html" || H.type == "inline" || H.type == "ajax") {
                    H.width = "auto";
                    H.height = "auto"
                } else {
                    H.autoDimensions = false
                }
            }
            if (H.modal) {
                H.overlayShow = true;
                H.hideOnOverlayClick = false;
                H.hideOnContentClick = false;
                H.enableEscapeButton = false;
                H.showCloseButton = false
            }
            H.padding = parseInt(H.padding, 10);
            H.margin = parseInt(H.margin, 10);
            L.css("padding", (H.padding + H.margin));
            B(".fancybox-inline-tmp").unbind("fancybox-cancel").bind("fancybox-change", function() {
                B(this).replaceWith(m.children())
            });
            switch (Y) {
                case "html":
                    L.html(H.content);
                    n();
                    break;
                case "inline":
                    if (B(Z).parent().is("#fancybox-content") === true) {
                        P = false;
                        return
                    }
                    B('<div class="fancybox-inline-tmp" />').hide().insertBefore(B(Z)).bind("fancybox-cleanup", function() {
                        B(this).replaceWith(m.children())
                    }).bind("fancybox-cancel", function() {
                        B(this).replaceWith(L.children())
                    });
                    B(Z).appendTo(L);
                    n();
                    break;
                case "image":
                    P = false;
                    B.fancybox.showActivity();
                    o = new Image();
                    o.onerror = function() {
                        x()
                    };
                    o.onload = function() {
                        P = true;
                        o.onerror = o.onload = null;
                        F()
                    };
                    o.src = W;
                    break;
                case "swf":
                    H.scrolling = "no";
                    aa = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + H.width + '" height="' + H.height + '"><param name="movie" value="' + W + '"></param>';
                    V = "";
                    B.each(H.swf, function(ac, ad) {
                        aa += '<param name="' + ac + '" value="' + ad + '"></param>';
                        V += " " + ac + '="' + ad + '"'
                    });
                    aa += '<embed src="' + W + '" type="application/x-shockwave-flash" width="' + H.width + '" height="' + H.height + '"' + V + "></embed></object>";
                    L.html(aa);
                    n();
                    break;
                case "ajax":
                    P = false;
                    B.fancybox.showActivity();
                    H.ajax.win = H.ajax.success;
                    f = B.ajax(B.extend({}, H.ajax, {
                        url: W,
                        data: H.ajax.data || {},
                        dataType: "text",
                        error: function(ac, ae, ad) {
                            if (ac.status > 0) {
                                x()
                            }
                        },
                        success: function(ad, af, ac) {
                            var ae = typeof ac == "object" ? ac : f;
                            if (ae.status == 200 || ae.status === 0) {
                                if (typeof H.ajax.win == "function") {
                                    X = H.ajax.win(W, ad, af, ac);
                                    if (X === false) {
                                        T.hide();
                                        return
                                    } else {
                                        if (typeof X == "string" || typeof X == "object") {
                                            ad = X
                                        }
                                    }
                                }
                                L.html(ad);
                                n()
                            }
                        }
                    }));
                    break;
                case "iframe":
                    E();
                    break
            }
        },
        n = function() {
            var V = H.width,
                W = H.height;
            if (V.toString().indexOf("%") > -1) {
                V = parseInt((B(window).width() - (H.margin * 2)) * parseFloat(V) / 100, 10) + "px"
            } else {
                V = V == "auto" ? "auto" : V + "px"
            }
            if (W.toString().indexOf("%") > -1) {
                W = parseInt((B(window).height() - (H.margin * 2)) * parseFloat(W) / 100, 10) + "px"
            } else {
                W = W == "auto" ? "auto" : W + "px"
            }
            L.wrapInner('<div style="width:' + V + ";height:" + W + ";overflow: " + (H.scrolling == "auto" ? "auto" : (H.scrolling == "yes" ? "scroll" : "hidden")) + ';position:relative;"></div>');
            H.width = L.width();
            H.height = L.height();
            E()
        },
        F = function() {
            H.width = o.width;
            H.height = o.height;
            B("<img />").attr({
                id: "fancybox-img",
                src: o.src,
                alt: H.title
            }).appendTo(L);
            E()
        },
        E = function() {
            var W, V;
            T.hide();
            if (M.is(":visible") && false === G.onCleanup(y, e, G)) {
                B('.fancybox-inline-tmp').trigger('fancybox-cancel');
                P = false;
                return
            }
            P = true;
            B(m.add(Q)).unbind();
            B(window).unbind("resize.fb scroll.fb");
            B(document).unbind("keydown.fb");
            if (M.is(":visible") && G.titlePosition !== "outside") {
                M.css("height", M.height())
            }
            y = j;
            e = C;
            G = H;
            if (G.overlayShow) {
                Q.css({
                    "background-color": G.overlayColor,
                    opacity: G.overlayOpacity,
                    cursor: G.hideOnOverlayClick ? "pointer" : "auto",
                    height: B(document).height()
                });
                if (!Q.is(":visible")) {
                    if (S) {
                        B("select:not(#fancybox-tmp select)").filter(function() {
                            return this.style.visibility !== "hidden"
                        }).css({
                            visibility: "hidden"
                        }).one("fancybox-cleanup", function() {
                            this.style.visibility = "inherit"
                        })
                    }
                    Q.show()
                }
            } else {
                Q.hide()
            }
            c = R();
            l();
            if (M.is(":visible")) {
                B(J.add(O).add(z)).hide();
                W = M.position(), b = {
                    top: W.top,
                    left: W.left,
                    width: M.width(),
                    height: M.height()
                };
                V = (b.width == c.width && b.height == c.height);
                m.fadeTo(G.changeFade, 0.3, function() {
                    var X = function() {
                        m.html(L.contents()).fadeTo(G.changeFade, 1, v)
                    };
                    B('.fancybox-inline-tmp').trigger('fancybox-change');
                    m.empty().removeAttr("filter").css({
                        "border-width": G.padding,
                        width: c.width - G.padding * 2,
                        height: H.autoDimensions ? "auto" : c.height - h - G.padding * 2
                    });
                    if (V) {
                        X()
                    } else {
                        s.prop = 0;
                        B(s).animate({
                            prop: 1
                        }, {
                            duration: G.changeSpeed,
                            easing: G.easingChange,
                            step: U,
                            complete: X
                        })
                    }
                });
                return
            }
            M.removeAttr("style");
            m.css("border-width", G.padding);
            if (G.transitionIn == "elastic") {
                b = I();
                m.html(L.contents());
                M.show();
                if (G.opacity) {
                    c.opacity = 0
                }
                s.prop = 0;
                B(s).animate({
                    prop: 1
                }, {
                    duration: G.speedIn,
                    easing: G.easingIn,
                    step: U,
                    complete: v
                });
                return
            }
            if (G.titlePosition == "inside" && h > 0) {
                A.show()
            }
            m.css({
                width: c.width - G.padding * 2,
                height: H.autoDimensions ? "auto" : c.height - h - G.padding * 2
            }).html(L.contents());
            M.css(c).fadeIn(G.transitionIn == "none" ? 0 : G.speedIn, v)
        },
        D = function(V) {
            if (V && V.length) {
                if (G.titlePosition == "float") {
                    return '<table id="fancybox-title-float-wrap" cellpadding="0" cellspacing="0"><tr><td id="fancybox-title-float-left"></td><td id="fancybox-title-float-main">' + V + '</td><td id="fancybox-title-float-right"></td></tr></table>'
                }
                return '<div id="fancybox-title-' + G.titlePosition + '">' + V + "</div>"
            }
            return false
        },
        l = function() {
            t = G.title || "";
            h = 0;
            A.empty().removeAttr("style").removeClass();
            if (G.titleShow === false) {
                A.hide();
                return
            }
            t = B.isFunction(G.titleFormat) ? G.titleFormat(t, y, e, G) : D(t);
            if (!t || t === "") {
                A.hide();
                return
            }
            A.addClass("fancybox-title-" + G.titlePosition).html(t).appendTo("body").show();
            switch (G.titlePosition) {
                case "inside":
                    A.css({
                        width: c.width - (G.padding * 2),
                        marginLeft: G.padding,
                        marginRight: G.padding
                    });
                    h = A.outerHeight(true);
                    A.appendTo(d);
                    c.height += h;
                    break;
                case "over":
                    A.css({
                        marginLeft: G.padding,
                        width: c.width - (G.padding * 2),
                        bottom: G.padding
                    }).appendTo(d);
                    break;
                case "float":
                    A.css("left", parseInt((A.width() - c.width - 40) / 2, 10) * -1).appendTo(M);
                    break;
                default:
                    A.css({
                        width: c.width - (G.padding * 2),
                        paddingLeft: G.padding,
                        paddingRight: G.padding
                    }).appendTo(M);
                    break
            }
            A.hide()
        },
        g = function() {
            if (G.enableEscapeButton || G.enableKeyboardNav) {
                B(document).bind("keydown.fb", function(V) {
                    if (V.keyCode == 27 && G.enableEscapeButton) {
                        V.preventDefault();
                        B.fancybox.close()
                    } else {
                        if ((V.keyCode == 37 || V.keyCode == 39) && G.enableKeyboardNav && V.target.tagName !== "INPUT" && V.target.tagName !== "TEXTAREA" && V.target.tagName !== "SELECT") {
                            V.preventDefault();
                            B.fancybox[V.keyCode == 37 ? "prev" : "next"]()
                        }
                    }
                })
            }
            if (!G.showNavArrows) {
                O.hide();
                z.hide();
                return
            }
            if ((G.cyclic && y.length > 1) || e !== 0) {
                O.show()
            }
            if ((G.cyclic && y.length > 1) || e != (y.length - 1)) {
                z.show()
            }
        },
        v = function() {
            if (!B.support.opacity) {
                m.get(0).style.removeAttribute("filter");
                M.get(0).style.removeAttribute("filter")
            }
            if (H.autoDimensions) {
                m.css("height", "auto")
            }
            M.css("height", "auto");
            if (t && t.length) {
                A.show()
            }
            if (G.showCloseButton) {
                J.show()
            }
            g();
            if (G.hideOnContentClick) {
                m.bind("click", B.fancybox.close)
            }
            if (G.hideOnOverlayClick) {
                Q.bind("click", B.fancybox.close)
            }
            B(window).bind("resize.fb", B.fancybox.resize);
            if (G.centerOnScroll) {
                B(window).bind("scroll.fb", B.fancybox.center)
            }
            if (G.type == "iframe") {
                B('<iframe id="fancybox-frame" name="fancybox-frame' + new Date().getTime() + '" frameborder="0" hspace="0" ' + (window.attachEvent ? 'allowtransparency="true""' : "") + ' scrolling="' + H.scrolling + '" src="' + G.href + '"></iframe>').appendTo(m)
            }
            M.show();
            P = false;
            B.fancybox.center();
            G.onComplete(y, e, G);
            K()
        },
        K = function() {
            var V, W;
            if ((y.length - 1) > e) {
                V = y[e + 1].href;
                if (typeof V !== "undefined" && V.match(i)) {
                    W = new Image();
                    W.src = V
                }
            }
            if (e > 0) {
                V = y[e - 1].href;
                if (typeof V !== "undefined" && V.match(i)) {
                    W = new Image();
                    W.src = V
                }
            }
        },
        U = function(W) {
            var V = {
                width: parseInt(b.width + (c.width - b.width) * W, 10),
                height: parseInt(b.height + (c.height - b.height) * W, 10),
                top: parseInt(b.top + (c.top - b.top) * W, 10),
                left: parseInt(b.left + (c.left - b.left) * W, 10)
            };
            if (typeof c.opacity !== "undefined") {
                V.opacity = W < 0.5 ? 0.5 : W
            }
            M.css(V);
            m.css({
                width: V.width - G.padding * 2,
                height: V.height - (h * W) - G.padding * 2
            })
        },
        u = function() {
            return [B(window).width() - (G.margin * 2), B(window).height() - (G.margin * 2), B(document).scrollLeft() + G.margin, B(document).scrollTop() + G.margin]
        },
        R = function() {
            var V = u(),
                Z = {},
                W = G.autoScale,
                X = G.padding * 2,
                Y;
            if (G.width.toString().indexOf("%") > -1) {
                Z.width = parseInt((V[0] * parseFloat(G.width)) / 100, 10)
            } else {
                Z.width = G.width + X
            }
            if (G.height.toString().indexOf("%") > -1) {
                Z.height = parseInt((V[1] * parseFloat(G.height)) / 100, 10)
            } else {
                Z.height = G.height + X
            }
            if (W && (Z.width > V[0] || Z.height > V[1])) {
                if (H.type == "image" || H.type == "swf") {
                    Y = (G.width) / (G.height);
                    if ((Z.width) > V[0]) {
                        Z.width = V[0];
                        Z.height = parseInt(((Z.width - X) / Y) + X, 10)
                    }
                    if ((Z.height) > V[1]) {
                        Z.height = V[1];
                        Z.width = parseInt(((Z.height - X) * Y) + X, 10)
                    }
                } else {
                    Z.width = Math.min(Z.width, V[0]);
                    Z.height = Math.min(Z.height, V[1])
                }
            }
            Z.top = parseInt(Math.max(V[3] - 20, V[3] + ((V[1] - Z.height - 40) * 0.5)), 10);
            Z.left = parseInt(Math.max(V[2] - 20, V[2] + ((V[0] - Z.width - 40) * 0.5)), 10);
            return Z
        },
        q = function(V) {
            var W = V.offset();
            W.top += parseInt(V.css("paddingTop"), 10) || 0;
            W.left += parseInt(V.css("paddingLeft"), 10) || 0;
            W.top += parseInt(V.css("border-top-width"), 10) || 0;
            W.left += parseInt(V.css("border-left-width"), 10) || 0;
            W.width = V.width();
            W.height = V.height();
            return W
        },
        I = function() {
            var Y = H.orig ? B(H.orig) : false,
                X = {},
                W, V;
            if (Y && Y.length) {
                W = q(Y);
                X = {
                    width: W.width + (G.padding * 2),
                    height: W.height + (G.padding * 2),
                    top: W.top - G.padding - 20,
                    left: W.left - G.padding - 20
                }
            } else {
                V = u();
                X = {
                    width: G.padding * 2,
                    height: G.padding * 2,
                    top: parseInt(V[3] + V[1] * 0.5, 10),
                    left: parseInt(V[2] + V[0] * 0.5, 10)
                }
            }
            return X
        },
        a = function() {
            if (!T.is(":visible")) {
                clearInterval(p);
                return
            }
            B("div", T).css("top", (N * -40) + "px");
            N = (N + 1) % 12
        };
    B.fn.fancybox = function(V) {
        if (!B(this).length) {
            return this
        }
        B(this).data("fancybox", B.extend({}, V, (B.metadata ? B(this).metadata() : {}))).unbind("click.fb").bind("click.fb", function(X) {
            X.preventDefault();
            if (P) {
                return
            }
            P = true;
            B(this).blur();
            j = [];
            C = 0;
            var W = B(this).attr("rel") || "";
            if (!W || W == "" || W === "nofollow") {
                j.push(this)
            } else {
                j = B('a[rel="' + W + '"], area[rel="' + W + '"]');
                C = j.index(this)
            }
            w();
            return
        });
        return this
    };
    B.fancybox = function(Y) {
        var X;
        if (P) {
            return
        }
        P = true;
        X = typeof arguments[1] !== "undefined" ? arguments[1] : {};
        j = [];
        C = parseInt(X.index, 10) || 0;
        if (B.isArray(Y)) {
            for (var W = 0, V = Y.length; W < V; W++) {
                if (typeof Y[W] == "object") {
                    B(Y[W]).data("fancybox", B.extend({}, X, Y[W]))
                } else {
                    Y[W] = B({}).data("fancybox", B.extend({
                        content: Y[W]
                    }, X))
                }
            }
            j = jQuery.merge(j, Y)
        } else {
            if (typeof Y == "object") {
                B(Y).data("fancybox", B.extend({}, X, Y))
            } else {
                Y = B({}).data("fancybox", B.extend({
                    content: Y
                }, X))
            }
            j.push(Y)
        }
        if (C > j.length || C < 0) {
            C = 0
        }
        w()
    };
    B.fancybox.showActivity = function() {
        clearInterval(p);
        T.show();
        p = setInterval(a, 66)
    };
    B.fancybox.hideActivity = function() {
        T.hide()
    };
    B.fancybox.next = function() {
        return B.fancybox.pos(e + 1)
    };
    B.fancybox.prev = function() {
        return B.fancybox.pos(e - 1)
    };
    B.fancybox.pos = function(V) {
        if (P) {
            return
        }
        V = parseInt(V);
        j = y;
        if (V > -1 && V < y.length) {
            C = V;
            w()
        } else {
            if (G.cyclic && y.length > 1) {
                C = V >= y.length ? 0 : y.length - 1;
                w()
            }
        }
        return
    };
    B.fancybox.cancel = function() {
        if (P) {
            return
        }
        P = true;
        B('.fancybox-inline-tmp').trigger('fancybox-cancel');
        r();
        H.onCancel(j, C, H);
        P = false
    };
    B.fancybox.close = function() {
        if (P || M.is(":hidden")) {
            return
        }
        P = true;
        if (G && false === G.onCleanup(y, e, G)) {
            P = false;
            return
        }
        r();
        B(J.add(O).add(z)).hide();
        B(m.add(Q)).unbind();
        B(window).unbind("resize.fb scroll.fb");
        B(document).unbind("keydown.fb");
        if (G.type === "iframe") {
            m.find("iframe").attr("src", S && /^https/i.test(window.location.href || "") ? "javascript:void(false)" : "about:blank")
        }
        if (G.titlePosition !== "inside") {
            A.empty()
        }
        M.stop();

        function V() {
            Q.fadeOut("fast");
            A.empty().hide();
            M.hide();
            B('.fancybox-inline-tmp').trigger('fancybox-cleanup');
            m.empty();
            G.onClosed(y, e, G);
            y = H = [];
            e = C = 0;
            G = H = {};
            P = false
        }
        if (G.transitionOut == "elastic") {
            b = I();
            var W = M.position();
            c = {
                top: W.top,
                left: W.left,
                width: M.width(),
                height: M.height()
            };
            if (G.opacity) {
                c.opacity = 1
            }
            A.empty().hide();
            s.prop = 1;
            B(s).animate({
                prop: 0
            }, {
                duration: G.speedOut,
                easing: G.easingOut,
                step: U,
                complete: V
            })
        } else {
            M.fadeOut(G.transitionOut == "none" ? 0 : G.speedOut, V)
        }
    };
    B.fancybox.resize = function() {
        if (Q.is(":visible")) {
            Q.css("height", B(document).height())
        }
        B.fancybox.center(true)
    };
    B.fancybox.center = function() {
        var V, W;
        if (P) {
            return
        }
        W = arguments[0] === true ? 1 : 0;
        V = u();
        if (!W && (M.width() > V[0] || M.height() > V[1])) {
            return
        }
        M.stop().animate({
            top: parseInt(Math.max(V[3] - 20, V[3] + ((V[1] - m.height() - 40) * 0.5) - G.padding)),
            left: parseInt(Math.max(V[2] - 20, V[2] + ((V[0] - m.width() - 40) * 0.5) - G.padding))
        }, typeof arguments[0] == "number" ? arguments[0] : 200)
    };
    B.fancybox.init = function() {
        if (B("#fancybox-wrap").length) {
            return
        }
        B("body").append(L = B('<div id="fancybox-tmp"></div>'), T = B('<div id="fancybox-loading"><div></div></div>'), Q = B('<div id="fancybox-overlay"></div>'), M = B('<div id="fancybox-wrap"></div>'));
        d = B('<div id="fancybox-outer"></div>').append('<div class="fancybox-bg" id="fancybox-bg-n"></div><div class="fancybox-bg" id="fancybox-bg-ne"></div><div class="fancybox-bg" id="fancybox-bg-e"></div><div class="fancybox-bg" id="fancybox-bg-se"></div><div class="fancybox-bg" id="fancybox-bg-s"></div><div class="fancybox-bg" id="fancybox-bg-sw"></div><div class="fancybox-bg" id="fancybox-bg-w"></div><div class="fancybox-bg" id="fancybox-bg-nw"></div>').appendTo(M);
        d.append(m = B('<div id="fancybox-content"></div>'), J = B('<a id="fancybox-close"></a>'), A = B('<div id="fancybox-title"></div>'), O = B('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'), z = B('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>'));
        J.click(B.fancybox.close);
        T.click(B.fancybox.cancel);
        O.click(function(V) {
            V.preventDefault();
            B.fancybox.prev()
        });
        z.click(function(V) {
            V.preventDefault();
            B.fancybox.next()
        });
        if (B.fn.mousewheel) {
            M.bind("mousewheel.fb", function(V, W) {
                if (P) {
                    V.preventDefault()
                } else {
                    if (B(V.target).get(0).clientHeight == 0 || B(V.target).get(0).scrollHeight === B(V.target).get(0).clientHeight) {
                        V.preventDefault();
                        B.fancybox[W > 0 ? "prev" : "next"]()
                    }
                }
            })
        }
        if (!B.support.opacity) {
            M.addClass("fancybox-ie")
        }
        if (S) {
            T.addClass("fancybox-ie6");
            M.addClass("fancybox-ie6");
            B('<iframe id="fancybox-hide-sel-frame" src="' + (/^https/i.test(window.location.href || "") ? "javascript:void(false)" : "about:blank") + '" scrolling="no" border="0" frameborder="0" tabindex="-1"></iframe>').prependTo(d)
        }
    };
    B.fn.fancybox.defaults = {
        padding: 10,
        margin: 40,
        opacity: false,
        modal: false,
        cyclic: false,
        scrolling: "auto",
        width: 560,
        height: 340,
        autoScale: true,
        autoDimensions: true,
        centerOnScroll: false,
        ajax: {},
        swf: {
            wmode: "transparent"
        },
        hideOnOverlayClick: true,
        hideOnContentClick: false,
        overlayShow: true,
        overlayOpacity: 0.7,
        overlayColor: "#777",
        titleShow: true,
        titlePosition: "float",
        titleFormat: null,
        titleFromAlt: false,
        transitionIn: "fade",
        transitionOut: "fade",
        speedIn: 300,
        speedOut: 300,
        changeSpeed: 300,
        changeFade: "fast",
        easingIn: "swing",
        easingOut: "swing",
        showCloseButton: true,
        showNavArrows: true,
        enableEscapeButton: true,
        enableKeyboardNav: true,
        onStart: function() {},
        onCancel: function() {},
        onComplete: function() {},
        onCleanup: function() {},
        onClosed: function() {},
        onError: function() {}
    };
    B(document).ready(function() {
        B.fancybox.init()
    })
})(jQuery);;
jQuery.easing.jswing = jQuery.easing.swing;
jQuery.extend(jQuery.easing, {
    def: "easeOutQuad",
    swing: function(e, f, a, h, g) {
        return jQuery.easing[jQuery.easing.def](e, f, a, h, g)
    },
    easeInQuad: function(e, f, a, h, g) {
        return h * (f /= g) * f + a
    },
    easeOutQuad: function(e, f, a, h, g) {
        return -h * (f /= g) * (f - 2) + a
    },
    easeInOutQuad: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f + a
        }
        return -h / 2 * ((--f) * (f - 2) - 1) + a
    },
    easeInCubic: function(e, f, a, h, g) {
        return h * (f /= g) * f * f + a
    },
    easeOutCubic: function(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f + 1) + a
    },
    easeInOutCubic: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f + a
        }
        return h / 2 * ((f -= 2) * f * f + 2) + a
    },
    easeInQuart: function(e, f, a, h, g) {
        return h * (f /= g) * f * f * f + a
    },
    easeOutQuart: function(e, f, a, h, g) {
        return -h * ((f = f / g - 1) * f * f * f - 1) + a
    },
    easeInOutQuart: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f + a
        }
        return -h / 2 * ((f -= 2) * f * f * f - 2) + a
    },
    easeInQuint: function(e, f, a, h, g) {
        return h * (f /= g) * f * f * f * f + a
    },
    easeOutQuint: function(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f * f * f + 1) + a
    },
    easeInOutQuint: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f * f + a
        }
        return h / 2 * ((f -= 2) * f * f * f * f + 2) + a
    },
    easeInSine: function(e, f, a, h, g) {
        return -h * Math.cos(f / g * (Math.PI / 2)) + h + a
    },
    easeOutSine: function(e, f, a, h, g) {
        return h * Math.sin(f / g * (Math.PI / 2)) + a
    },
    easeInOutSine: function(e, f, a, h, g) {
        return -h / 2 * (Math.cos(Math.PI * f / g) - 1) + a
    },
    easeInExpo: function(e, f, a, h, g) {
        return (f == 0) ? a : h * Math.pow(2, 10 * (f / g - 1)) + a
    },
    easeOutExpo: function(e, f, a, h, g) {
        return (f == g) ? a + h : h * (-Math.pow(2, -10 * f / g) + 1) + a
    },
    easeInOutExpo: function(e, f, a, h, g) {
        if (f == 0) {
            return a
        }
        if (f == g) {
            return a + h
        }
        if ((f /= g / 2) < 1) {
            return h / 2 * Math.pow(2, 10 * (f - 1)) + a
        }
        return h / 2 * (-Math.pow(2, -10 * --f) + 2) + a
    },
    easeInCirc: function(e, f, a, h, g) {
        return -h * (Math.sqrt(1 - (f /= g) * f) - 1) + a
    },
    easeOutCirc: function(e, f, a, h, g) {
        return h * Math.sqrt(1 - (f = f / g - 1) * f) + a
    },
    easeInOutCirc: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return -h / 2 * (Math.sqrt(1 - f * f) - 1) + a
        }
        return h / 2 * (Math.sqrt(1 - (f -= 2) * f) + 1) + a
    },
    easeInElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k) == 1) {
            return e + l
        }
        if (!j) {
            j = k * 0.3
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        return -(g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e
    },
    easeOutElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k) == 1) {
            return e + l
        }
        if (!j) {
            j = k * 0.3
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        return g * Math.pow(2, -10 * h) * Math.sin((h * k - i) * (2 * Math.PI) / j) + l + e
    },
    easeInOutElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k / 2) == 2) {
            return e + l
        }
        if (!j) {
            j = k * (0.3 * 1.5)
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        if (h < 1) {
            return -0.5 * (g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e
        }
        return g * Math.pow(2, -10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j) * 0.5 + l + e
    },
    easeInBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        return i * (f /= h) * f * ((g + 1) * f - g) + a
    },
    easeOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        return i * ((f = f / h - 1) * f * ((g + 1) * f + g) + 1) + a
    },
    easeInOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        if ((f /= h / 2) < 1) {
            return i / 2 * (f * f * (((g *= (1.525)) + 1) * f - g)) + a
        }
        return i / 2 * ((f -= 2) * f * (((g *= (1.525)) + 1) * f + g) + 2) + a
    },
    easeInBounce: function(e, f, a, h, g) {
        return h - jQuery.easing.easeOutBounce(e, g - f, 0, h, g) + a
    },
    easeOutBounce: function(e, f, a, h, g) {
        if ((f /= g) < (1 / 2.75)) {
            return h * (7.5625 * f * f) + a
        } else {
            if (f < (2 / 2.75)) {
                return h * (7.5625 * (f -= (1.5 / 2.75)) * f + 0.75) + a
            } else {
                if (f < (2.5 / 2.75)) {
                    return h * (7.5625 * (f -= (2.25 / 2.75)) * f + 0.9375) + a
                } else {
                    return h * (7.5625 * (f -= (2.625 / 2.75)) * f + 0.984375) + a
                }
            }
        }
    },
    easeInOutBounce: function(e, f, a, h, g) {
        if (f < g / 2) {
            return jQuery.easing.easeInBounce(e, f * 2, 0, h, g) * 0.5 + a
        }
        return jQuery.easing.easeOutBounce(e, f * 2 - g, 0, h, g) * 0.5 + h * 0.5 + a
    }
});;
(function(a) {
    function d(b) {
        var c = b || window.event,
            d = [].slice.call(arguments, 1),
            e = 0,
            f = !0,
            g = 0,
            h = 0;
        return b = a.event.fix(c), b.type = "mousewheel", c.wheelDelta && (e = c.wheelDelta / 120), c.detail && (e = -c.detail / 3), h = e, c.axis !== undefined && c.axis === c.HORIZONTAL_AXIS && (h = 0, g = -1 * e), c.wheelDeltaY !== undefined && (h = c.wheelDeltaY / 120), c.wheelDeltaX !== undefined && (g = -1 * c.wheelDeltaX / 120), d.unshift(b, e, g, h), (a.event.dispatch || a.event.handle).apply(this, d)
    }
    var b = ["DOMMouseScroll", "mousewheel"];
    if (a.event.fixHooks)
        for (var c = b.length; c;) a.event.fixHooks[b[--c]] = a.event.mouseHooks;
    a.event.special.mousewheel = {
        setup: function() {
            if (this.addEventListener)
                for (var a = b.length; a;) this.addEventListener(b[--a], d, !1);
            else this.onmousewheel = d
        },
        teardown: function() {
            if (this.removeEventListener)
                for (var a = b.length; a;) this.removeEventListener(b[--a], d, !1);
            else this.onmousewheel = null
        }
    }, a.fn.extend({
        mousewheel: function(a) {
            return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
        },
        unmousewheel: function(a) {
            return this.unbind("mousewheel", a)
        }
    })
})(jQuery)
jQuery(function() {
    initPopups();
});

function initPopups() {
    jQuery('.container3').contentPopup({
        mode: 'hover'
    });
};
(function($) {
    function ContentPopup(opt) {
        this.options = $.extend({
            holder: null,
            popup: '.popup',
            btnOpen: '.open',
            btnClose: '.close',
            openClass: 'popup-active',
            clickEvent: 'click',
            mode: 'click',
            hideOnClickLink: true,
            hideOnClickOutside: true,
            delay: 50
        }, opt);
        if (this.options.holder) {
            this.holder = $(this.options.holder);
            this.init();
        }
    }
    ContentPopup.prototype = {
        init: function() {
            this.findElements();
            this.attachEvents();
        },
        findElements: function() {
            this.popup = this.holder.find(this.options.popup);
            this.btnOpen = this.holder.find(this.options.btnOpen);
            this.btnClose = this.holder.find(this.options.btnClose);
        },
        attachEvents: function() {
            var self = this;
            this.clickMode = isTouchDevice || (self.options.mode === self.options.clickEvent);
            if (this.clickMode) {
                this.btnOpen.bind(self.options.clickEvent, function(e) {
                    if (self.holder.hasClass(self.options.openClass)) {
                        if (self.options.hideOnClickLink) {
                            self.hidePopup();
                        }
                    } else {
                        self.showPopup();
                    }
                    e.preventDefault();
                });
                this.outsideClickHandler = this.bind(this.outsideClickHandler, this);
            } else {
                var timer, delayedFunc = function(func) {
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        func.call(self);
                    }, self.options.delay);
                };
                this.btnOpen.bind('mouseover', function() {
                    delayedFunc(self.showPopup);
                }).bind('mouseout', function() {
                    delayedFunc(self.hidePopup);
                });
                this.popup.bind('mouseover', function() {
                    delayedFunc(self.showPopup);
                }).bind('mouseout', function() {
                    delayedFunc(self.hidePopup);
                });
            }
            this.btnClose.bind(self.options.clickEvent, function(e) {
                self.hidePopup();
                e.preventDefault();
            });
        },
        outsideClickHandler: function(e) {
            var currentNode = (e.changedTouches ? e.changedTouches[0] : e).target;
            if (!$(currentNode).parents().filter(this.holder).length) {
                this.hidePopup();
            }
        },
        showPopup: function() {
            this.holder.addClass(this.options.openClass);
            this.popup.css({
                display: 'block'
            });
            if (this.clickMode && this.options.hideOnClickOutside && !this.outsideHandlerActive) {
                this.outsideHandlerActive = true;
                $(document).bind('click touchstart', this.outsideClickHandler);
            }
        },
        hidePopup: function() {
            this.holder.removeClass(this.options.openClass);
            this.popup.css({
                display: 'none'
            });
            if (this.clickMode && this.options.hideOnClickOutside && this.outsideHandlerActive) {
                this.outsideHandlerActive = false;
                $(document).unbind('click touchstart', this.outsideClickHandler);
            }
        },
        bind: function(f, scope, forceArgs) {
            return function() {
                return f.apply(scope, forceArgs ? [forceArgs] : arguments);
            };
        }
    };
    var isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    $.fn.contentPopup = function(opt) {
        return this.each(function() {
            new ContentPopup($.extend(opt, {
                holder: this
            }));
        });
    };
}(jQuery));
jQuery(function() {
    initOpenClose();
});

function initOpenClose() {
    jQuery('div.nav-holder').openClose({
        addClassBeforeAnimation: false,
        activeClass: 'expanded',
        opener: 'a.opener',
        slider: 'ul.nav',
        animSpeed: 500,
        effect: 'slide'
    });
};
(function($) {
    function OpenClose(options) {
        this.options = $.extend({
            addClassBeforeAnimation: true,
            hideOnClickOutside: false,
            activeClass: 'active',
            opener: '.opener',
            slider: '.slide',
            animSpeed: 400,
            effect: 'fade',
            event: 'click'
        }, options);
        this.init();
    }
    OpenClose.prototype = {
        init: function() {
            if (this.options.holder) {
                this.findElements();
                this.attachEvents();
                this.makeCallback('onInit');
            }
        },
        findElements: function() {
            this.holder = $(this.options.holder);
            this.opener = this.holder.find(this.options.opener);
            this.slider = this.holder.find(this.options.slider);
            if (!this.holder.hasClass(this.options.activeClass)) {
                this.slider.addClass(slideHiddenClass);
            }
        },
        attachEvents: function() {
            var self = this;
            this.eventHandler = function(e) {
                e.preventDefault();
                if (self.slider.hasClass(slideHiddenClass)) {
                    self.showSlide();
                } else {
                    self.hideSlide();
                }
            };
            self.opener.bind(self.options.event, this.eventHandler);
            if (self.options.event === 'over') {
                self.opener.bind('mouseenter', function() {
                    self.holder.removeClass(self.options.activeClass);
                    self.opener.trigger(self.options.event);
                });
                self.holder.bind('mouseleave', function() {
                    self.holder.addClass(self.options.activeClass);
                    self.opener.trigger(self.options.event);
                });
            }
            self.outsideClickHandler = function(e) {
                if (self.options.hideOnClickOutside) {
                    var target = $(e.target);
                    if (!target.is(self.holder) && !target.closest(self.holder).length) {
                        self.hideSlide();
                    }
                }
            };
        },
        showSlide: function() {
            var self = this;
            if (self.options.addClassBeforeAnimation) {
                self.holder.addClass(self.options.activeClass);
            }
            self.slider.removeClass(slideHiddenClass);
            $(document).bind('click', self.outsideClickHandler);
            self.makeCallback('animStart', true);
            toggleEffects[self.options.effect].show({
                box: self.slider,
                speed: self.options.animSpeed,
                complete: function() {
                    if (!self.options.addClassBeforeAnimation) {
                        self.holder.addClass(self.options.activeClass);
                    }
                    self.makeCallback('animEnd', true);
                }
            });
        },
        hideSlide: function() {
            var self = this;
            if (self.options.addClassBeforeAnimation) {
                self.holder.removeClass(self.options.activeClass);
            }
            $(document).unbind('click', self.outsideClickHandler);
            self.makeCallback('animStart', false);
            toggleEffects[self.options.effect].hide({
                box: self.slider,
                speed: self.options.animSpeed,
                complete: function() {
                    if (!self.options.addClassBeforeAnimation) {
                        self.holder.removeClass(self.options.activeClass);
                    }
                    self.slider.addClass(slideHiddenClass);
                    self.makeCallback('animEnd', false);
                }
            });
        },
        destroy: function() {
            this.slider.removeClass(slideHiddenClass).css({
                display: ''
            });
            this.opener.unbind(this.options.event, this.eventHandler);
            this.holder.removeClass(this.options.activeClass).removeData('OpenClose');
            $(document).unbind('click', this.outsideClickHandler);
        },
        makeCallback: function(name) {
            if (typeof this.options[name] === 'function') {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                this.options[name].apply(this, args);
            }
        }
    };
    var slideHiddenClass = 'js-slide-hidden';
    $(function() {
        var tabStyleSheet = $('<style type="text/css">')[0];
        var tabStyleRule = '.' + slideHiddenClass;
        tabStyleRule += '{position:absolute !important;left:-9999px !important;top:-9999px !important;display:block !important}';
        if (tabStyleSheet.styleSheet) {
            tabStyleSheet.styleSheet.cssText = tabStyleRule;
        } else {
            tabStyleSheet.appendChild(document.createTextNode(tabStyleRule));
        }
        $('head').append(tabStyleSheet);
    });
    var toggleEffects = {
        slide: {
            show: function(o) {
                o.box.stop(true).hide().slideDown(o.speed, o.complete);
            },
            hide: function(o) {
                o.box.stop(true).slideUp(o.speed, o.complete);
            }
        },
        fade: {
            show: function(o) {
                o.box.stop(true).hide().fadeIn(o.speed, o.complete);
            },
            hide: function(o) {
                o.box.stop(true).fadeOut(o.speed, o.complete);
            }
        },
        none: {
            show: function(o) {
                o.box.hide().show(0, o.complete);
            },
            hide: function(o) {
                o.box.hide(0, o.complete);
            }
        }
    };
    $.fn.openClose = function(opt) {
        return this.each(function() {
            jQuery(this).data('OpenClose', new OpenClose($.extend(opt, {
                holder: this
            })));
        });
    };
}(jQuery));
jQuery(function() {
    initSameHeight();
});

function initSameHeight() {
    jQuery('.boxes-rg').sameHeight({
        elements: '>*',
        flexible: true
    });
    jQuery('.whom-holder').sameHeight({
        elements: '.whom-title',
        flexible: true,
        multiLine: true
    });
    jQuery('.mwhom-holder').sameHeight({
        elements: '.mwhom-title',
        flexible: true,
        multiLine: true
    });
};
(function($) {
    $.fn.sameHeight = function(opt) {
        var options = $.extend({
            skipClass: 'same-height-ignore',
            leftEdgeClass: 'same-height-left',
            rightEdgeClass: 'same-height-right',
            elements: '>*',
            flexible: false,
            multiLine: false,
            useMinHeight: false,
            biggestHeight: false
        }, opt);
        return this.each(function() {
            var holder = $(this),
                postResizeTimer, ignoreResize;
            var elements = holder.find(options.elements).not('.' + options.skipClass);
            if (!elements.length) return;

            function doResize() {
                elements.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', '');
                if (options.multiLine) {
                    resizeElementsByRows(elements, options);
                } else {
                    resizeElements(elements, holder, options);
                }
            }
            doResize();
            var delayedResizeHandler = function() {
                if (!ignoreResize) {
                    ignoreResize = true;
                    doResize();
                    clearTimeout(postResizeTimer);
                    postResizeTimer = setTimeout(function() {
                        doResize();
                        setTimeout(function() {
                            ignoreResize = false;
                        }, 10);
                    }, 100);
                }
            };
            if (options.flexible) {
                $(window).bind('resize orientationchange fontresize', delayedResizeHandler);
            }
            $(window).bind('load', delayedResizeHandler);
        });
    };
    var supportMinHeight = typeof document.documentElement.style.maxHeight !== 'undefined';

    function resizeElementsByRows(boxes, options) {
        var currentRow = $(),
            maxHeight, maxCalcHeight = 0,
            firstOffset = boxes.eq(0).offset().top;
        boxes.each(function(ind) {
            var curItem = $(this);
            if (curItem.offset().top === firstOffset) {
                currentRow = currentRow.add(this);
            } else {
                maxHeight = getMaxHeight(currentRow);
                maxCalcHeight = Math.max(maxCalcHeight, resizeElements(currentRow, maxHeight, options));
                currentRow = curItem;
                firstOffset = curItem.offset().top;
            }
        });
        if (currentRow.length) {
            maxHeight = getMaxHeight(currentRow);
            maxCalcHeight = Math.max(maxCalcHeight, resizeElements(currentRow, maxHeight, options));
        }
        if (options.biggestHeight) {
            boxes.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', maxCalcHeight);
        }
    }

    function getMaxHeight(boxes) {
        var maxHeight = 0;
        boxes.each(function() {
            maxHeight = Math.max(maxHeight, $(this).outerHeight());
        });
        return maxHeight;
    }

    function resizeElements(boxes, parent, options) {
        var calcHeight;
        var parentHeight = typeof parent === 'number' ? parent : parent.height();
        boxes.removeClass(options.leftEdgeClass).removeClass(options.rightEdgeClass).each(function(i) {
            var element = $(this);
            var depthDiffHeight = 0;
            var isBorderBox = element.css('boxSizing') === 'border-box';
            if (typeof parent !== 'number') {
                element.parents().each(function() {
                    var tmpParent = $(this);
                    if (parent.is(this)) {
                        return false;
                    } else {
                        depthDiffHeight += tmpParent.outerHeight() - tmpParent.height();
                    }
                });
            }
            calcHeight = parentHeight - depthDiffHeight;
            calcHeight -= isBorderBox ? 0 : element.outerHeight() - element.height();
            if (calcHeight > 0) {
                element.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', calcHeight);
            }
        });
        boxes.filter(':first').addClass(options.leftEdgeClass);
        boxes.filter(':last').addClass(options.rightEdgeClass);
        return calcHeight;
    }
}(jQuery));
jQuery.onFontResize = (function($) {
    $(function() {
        var randomID = 'font-resize-frame-' + Math.floor(Math.random() * 1000);
        var resizeFrame = $('<iframe>').attr('id', randomID).addClass('font-resize-helper');
        resizeFrame.css({
            width: '100em',
            height: '10px',
            position: 'absolute',
            borderWidth: 0,
            top: '-9999px',
            left: '-9999px'
        }).appendTo('body');
        if (window.attachEvent && !window.addEventListener) {
            resizeFrame.bind('resize', function() {
                $.onFontResize.trigger(resizeFrame[0].offsetWidth / 100);
            });
        } else {
            var doc = resizeFrame[0].contentWindow.document;
            doc.open();
            doc.write('<scri' + 'pt>window.onload = function(){var em = parent.jQuery("#' + randomID + '")[0];window.onresize = function(){if(parent.jQuery.onFontResize){parent.jQuery.onFontResize.trigger(em.offsetWidth / 100);}}};</scri' + 'pt>');
            doc.close();
        }
        jQuery.onFontResize.initialSize = resizeFrame[0].offsetWidth / 100;
    });
    return {
        trigger: function(em) {
            $(window).trigger("fontresize", [em]);
        }
    };
}(jQuery));
$(function() {
    $('a.btn-y').simpleLightbox({
        faderOpacity: 0.5,
        faderBackground: '#fff',
        closeLink: 'a.close'
    });
});
jQuery.fn.simpleLightbox = function(_options) {
    var _options = jQuery.extend({
        lightboxContentBlock: '.lightbox',
        faderOpacity: 0.5,
        faderBackground: '#ffffff',
        closeLink: 'a.close-btn',
        href: true,
        onClick: null
    }, _options);
    return this.each(function(i, _this) {
        var _this = jQuery(_this);
        if (!_options.href) _this.lightboxContentBlock = _options.lightboxContentBlock;
        else _this.lightboxContentBlock = _this.attr('href');
        if (_this.lightboxContentBlock != '' && _this.lightboxContentBlock.length > 1) {
            _this.faderOpacity = _options.faderOpacity;
            _this.faderBackground = _options.faderBackground;
            _this.closeLink = _options.closeLink;
            var _fader;
            var _lightbox = $(_this.lightboxContentBlock);
            if (!jQuery('div.lightbox-fader').length) _fader = $('body').append('<div class="lightbox-fader"></div>');
            _fader = jQuery('div.lightbox-fader');
            _lightbox.css({
                'zIndex': 991
            });
            _fader.css({
                opacity: _this.faderOpacity,
                backgroundColor: _this.faderBackground,
                display: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 990,
                textIndent: -9999
            }).text('$nbsp');
            _lightbox.shownFlag = false;
            _this.click(function() {
                if (jQuery.isFunction(_options.onClick)) {
                    _options.onClick.apply(_this);
                }
                _lightbox.shownFlag = true;
                _lightbox.hide();
                jQuery.fn.simpleLightbox.positionLightbox(_lightbox);
                _fader.fadeIn(300, function() {
                    _lightbox.fadeIn(400);
                    jQuery.fn.simpleLightbox.positionLightbox(_lightbox);
                });
                return false;
            });
            jQuery(_this.closeLink).click(function() {
                _lightbox.fadeOut(400, function() {
                    _fader.fadeOut(300);
                    _scroll = false;
                });
                return false;
            });
            _fader.click(function() {
                _lightbox.fadeOut(400, function() {
                    _fader.fadeOut(300);
                });
                return false;
            });
            var _scroll = false;
            jQuery.fn.simpleLightbox.positionLightbox = function(_lbox) {
                if (!_lbox.shownFlag) return false;
                var _height = 0;
                var _width = 0;
                var _minWidth = $('body > div:eq(0)').outerWidth();
                if (window.innerHeight) {
                    _height = window.innerHeight;
                    _width = window.innerWidth;
                } else {
                    _height = document.documentElement.clientHeight;
                    _width = document.documentElement.clientWidth;
                }
                var _thisHeight = _lbox.outerHeight();
                var _page = $('body');
                if (_lbox.length) {
                    if (_width < _minWidth) {
                        _fader.css('width', _minWidth);
                    } else {
                        _fader.css('width', '100%');
                    }
                    if (_height > _page.innerHeight()) _fader.css('height', _height);
                    else _fader.css('height', _page.innerHeight());
                    if (_height > _thisHeight) {
                        if ($.browser.msie && $.browser.version < 7) {
                            _lbox.css({
                                position: 'absolute',
                                top: (document.documentElement.scrollTop + (_height - _thisHeight) / 2) + "px"
                            });
                        } else {
                            _lbox.css({
                                position: 'fixed',
                                top: ((_height - _lbox.outerHeight()) / 2) + "px"
                            });
                        }
                    } else {
                        var _fh = parseInt(_fader.css('height'));
                        if (!_scroll) {
                            if (_fh - _thisHeight > parseInt($(document).scrollTop())) {
                                _fh = parseInt($(document).scrollTop())
                                _scroll = _fh;
                            } else {
                                _scroll = _fh - _thisHeight;
                            }
                        }
                        _lbox.css({
                            position: 'absolute',
                            top: _scroll
                        });
                    }
                    if (_width > _lbox.outerWidth()) _lbox.css({
                        left: ((_width - _lbox.outerWidth()) / 2) + "px"
                    });
                    else _lbox.css({
                        position: 'absolute',
                        left: 0
                    });
                }
            }
            jQuery(window).resize(function() {
                if (_lightbox.is(':visible')) jQuery.fn.simpleLightbox.positionLightbox(_lightbox);
            });
            jQuery(window).scroll(function() {
                if (_lightbox.is(':visible')) jQuery.fn.simpleLightbox.positionLightbox(_lightbox);
            });
            jQuery.fn.simpleLightbox.positionLightbox(_lightbox);
            $(document).keydown(function(e) {
                if (!e) evt = window.event;
                if (e.keyCode == 27) {
                    _lightbox.fadeOut(400, function() {
                        _fader.fadeOut(300);
                    });
                }
            });
        }
    });
}
$(document).ready(function() {
    gallery1 = $('.visual').gallery({
        duration: 600,
        listOfSlides: '.img-holder>li',
        changeHeight: true,
        noCicle: false,
        autoSlideShow: false,
        event: 'click',
        switcher: '.visual-list>li',
        effect: 'fade'
    });
});
(function($) {
    $.fn.gallery = function(options) {
        return new Gallery(this.get(0), options);
    };

    function Gallery(context, options) {
        this.init(context, options);
    };
    Gallery.prototype = {
        options: {},
        init: function(context, options) {
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
                eval('this.list.css(' + this.anim + ')');
            } else {
                this.rew = this.count;
                this.list.css({
                    opacity: 0
                }).removeClass('active').eq(this.active).addClass('active').css({
                    opacity: 1
                }).css('opacity', 'auto');
                this.switcher.removeClass('active').eq(this.active).addClass('active');
            }
            this.initEvent(this, this.nextBtn, true);
            this.initEvent(this, this.prevBtn, false);
            if (this.options.disableBtn) this.initDisableBtn();
            if (this.options.autoRotation) this.runTimer(this);
            if (this.options.switcher) this.initEventSwitcher(this, this.switcher);
        },
        initDisableBtn: function() {
            this.prevBtn.removeClass('prev-' + this.options.disableBtn);
            this.nextBtn.removeClass('next-' + this.options.disableBtn);
            if (this.active == 0 || this.count + 1 == this.wrapHolderW) this.prevBtn.addClass('prev-' + this.options.disableBtn);
            if (this.active == 0 && this.count == 1 || this.count + 1 == this.wrapHolderW) this.nextBtn.addClass('next-' + this.options.disableBtn);
            if (this.active == this.rew) this.nextBtn.addClass('next-' + this.options.disableBtn);
        },
        installDirections: function(temp) {
            this.wrapHolderW = Math.ceil(temp / this.woh);
            if (((this.wrapHolderW - 1) * this.woh + this.woh / 2) > temp) this.wrapHolderWwrapHolderW--;
        },
        fadeElement: function() {
            if ($.browser.msie && this.options.IE) {
                this.list.eq(this.last).css({
                    opacity: 0
                });
                this.list.removeClass('active').eq(this.active).addClass('active').css({
                    opacity: 'auto'
                });
            } else {
                this.list.eq(this.last).animate({
                    opacity: 0
                }, {
                    queue: false,
                    duration: this.options.duration
                });
                this.list.removeClass('active').eq(this.active).addClass('active').animate({
                    opacity: 1
                }, {
                    queue: false,
                    duration: this.options.duration,
                    complete: function() {
                        $(this).css('opacity', 'auto');
                    }
                });
            }
            if (this.options.switcher) this.switcher.removeClass('active').eq(this.active).addClass('active');
            this.last = this.active;
        },
        scrollElement: function() {
            eval('this.list.animate(' + this.anim + ', {queue:false, duration: this.options.duration});');
            if (this.options.switcher) this.switcher.removeClass('active').eq(this.active / this.options.slideElement).addClass('active');
        },
        runTimer: function($this) {
            if ($this._t) clearTimeout($this._t);
            $this._t = setInterval(function() {
                $this.toPrepare($this, true);
            }, this.options.autoRotation);
        },
        initEventSwitcher: function($this, el) {
            el.bind($this.options.event, function() {
                $this.active = $this.switcher.index($(this)) * $this.options.slideElement;
                if ($this._t) clearTimeout($this._t);
                if ($this.options.disableBtn) $this.initDisableBtn();
                if (!$this.options.effect) $this.scrollElement();
                else $this.fadeElement();
                if ($this.options.autoRotation) $this.runTimer($this);
                return false;
            });
        },
        initEvent: function($this, addEventEl, dir) {
            addEventEl.bind($this.options.event, function() {
                if ($this._t) clearTimeout($this._t);
                $this.toPrepare($this, dir);
                if ($this.options.autoRotation) $this.runTimer($this);
                return false;
            });
        },
        toPrepare: function($this, side) {
            if (($this.active == $this.rew) && $this.options.circle && side) $this.active = -$this.options.slideElement;
            if (($this.active == 0) && $this.options.circle && !side) $this.active = $this.rew + $this.options.slideElement;
            for (var i = 0; i < $this.options.slideElement; i++) {
                if (side) {
                    if ($this.active + 1 <= $this.rew) $this.active++;
                } else {
                    if ($this.active - 1 >= 0) $this.active--;
                }
            };
            if (this.options.disableBtn) this.initDisableBtn();
            if (!$this.options.effect) $this.scrollElement();
            else $this.fadeElement();
        },
        stop: function() {
            if (this._t) clearTimeout(this._t);
        },
        play: function() {
            if (this._t) clearTimeout(this._t);
            if (this.options.autoRotation) this.runTimer(this);
        }
    }
}(jQuery));
$(function() {
    $(".pxg1").pxgradient({
        step: 1,
        colors: ["#fff", "#fff", "#fff", "#d0d1d3", "#d0d1d3", "#d0d1d3"],
        dir: "y"
    });
});
(function($) {
    $('head').append('<style type="text/css">.sn-pxg .pxg-set{width:inherit;user-select:none;-moz-user-select:none;-webkit-user-select:none;}.sn-pxg span.pxg-source{width:inherit;position:relative;display:inline-block;z-index:2;}.sn-pxg U.pxg-set,.sn-pxg U.pxg-set S,.sn-pxg U.pxg-set S B{width:inherit;left:0;right:0;top:0;bottom:0;height:inherit;width:inherit;position:absolute;display:inline-block;text-decoration:none;font-weight:inherit;}.sn-pxg U.pxg-set S{overflow:hidden;}.sn-pxg U.pxg-set{text-decoration:none;z-index:1;display:inline-block;position:relative;}</style>')
    $.fn.pxgradient = function(options) {
        var options = $.extend({
            step: 10,
            colors: ["#ffcc00", "#cc0000", "#000000"],
            dir: "y"
        }, options);
        options.RGBcolors = [];
        for (var i = 0; i < options.colors.length; i++) {
            options.RGBcolors[i] = hex2Rgb(options.colors[i]);
        }
        return this.each(function(i, e) {
            var pxg = $(e);
            if (!pxg.hasClass("sn-pxg")) {
                var pxg_source = pxg.html();
                pxg.html('<span class="pxg-source" style="visibility: hidden;">' + pxg_source + '</span>').append('<u class="pxg-set"></u>');
                var pxg_set = pxg.find(".pxg-set");
                var pxg_text = pxg.find(".pxg-source");
                var pxg_w = pxg_text.innerWidth();
                var pxg_h = pxg_text.innerHeight();
                pxg_text.hide();
                pxg.addClass("sn-pxg");
                if (options.dir == "x") {
                    var blocksize = pxg_w;
                } else if (options.dir == "y") {
                    var blocksize = pxg_h;
                }
                var fullsteps = Math.floor(blocksize / options.step);
                var allsteps = fullsteps;
                var laststep = (blocksize - (fullsteps * options.step));
                if (laststep > 0) {
                    allsteps++;
                }
                pxg_set.css({
                    width: pxg_w,
                    height: pxg_h
                });
                var offleft = 0;
                var pxg_set_html = '';
                if (options.dir == "x") {
                    for (var i = 0; i < allsteps; i++) {
                        var color = getColor(offleft, blocksize);
                        pxg_set_html += '<s style="height:' + pxg_h + 'px;width:' + options.step + 'px;left:' + offleft + 'px;color:' + color + '"><b style="left:-' + offleft + 'px;width:' + pxg_w + 'px;height:' + pxg_h + 'px;">' + pxg_source + '</b></s>';
                        offleft = offleft + options.step;
                    }
                } else if (options.dir == "y") {
                    for (var i = 0; i < allsteps; i++) {
                        var color = getColor(offleft, blocksize);
                        pxg_set_html += '<s style="width:' + pxg_w + 'px;height:' + options.step + 'px;top:' + offleft + 'px;color:' + color + '"><b style="top:-' + offleft + 'px;height:' + pxg_w + 'px;height:' + pxg_h + 'px;">' + pxg_source + '</b></s>';
                        offleft = offleft + options.step;
                    }
                }
                pxg_set.append(pxg_set_html);
            }
        });

        function hex2Rgb(hex) {
            if ('#' == hex.substr(0, 1)) {
                hex = hex.substr(1);
            }
            if (3 == hex.length) {
                hex = hex.substr(0, 1) + hex.substr(0, 1) + hex.substr(1, 1) + hex.substr(1, 1) + hex.substr(2, 1) + hex.substr(2, 1);
            }
            return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
        }

        function rgb2Hex(rgb) {
            var s = '0123456789abcdef';
            return '#' + s.charAt(parseInt(rgb[0] / 16)) + s.charAt(rgb[0] % 16) + s.charAt(parseInt(rgb[1] / 16)) + s.charAt(rgb[1] % 16) + s.charAt(parseInt(rgb[2] / 16)) + s.charAt(rgb[2] % 16);
        }

        function getColor(off, blocksize) {
            var fLeft = (off > 0) ? (off / blocksize) : 0;
            for (var i = 0; i < options.colors.length; i++) {
                fStopPosition = (i / (options.colors.length - 1));
                fLastPosition = (i > 0) ? ((i - 1) / (options.colors.length - 1)) : 0;
                if (fLeft == fStopPosition) {
                    return options.colors[i];
                } else if (fLeft < fStopPosition) {
                    fCurrentStop = (fLeft - fLastPosition) / (fStopPosition - fLastPosition);
                    return getMidColor(options.RGBcolors[i - 1], options.RGBcolors[i], fCurrentStop);
                }
            }
            return options.colors[options.colors.length - 1];
        }

        function getMidColor(aStart, aEnd, fMidStop) {
            var aRGBColor = [];
            for (var i = 0; i < 3; i++) {
                aRGBColor[i] = aStart[i] + Math.round((aEnd[i] - aStart[i]) * fMidStop)
            }
            return rgb2Hex(aRGBColor)
        }
    }
})(jQuery);
jQuery(function() {
    initFitVids();
});

function initFitVids() {
    jQuery('.video-box').fitVids();
    jQuery('.video1').fitVids();
    jQuery('.video-s').fitVids();
    jQuery('.video-fl').fitVids();
    jQuery('.video-holder .video').fitVids();
};
(function(a) {
    a.fn.fitVids = function(b) {
        var c = {
            customSelector: null
        };
        if (!document.getElementById("fit-vids-style")) {
            var f = document.createElement("div"),
                d = document.getElementsByTagName("base")[0] || document.getElementsByTagName("script")[0],
                e = "&shy;<style>.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}</style>";
            f.className = "fit-vids-style";
            f.id = "fit-vids-style";
            f.style.display = "none";
            f.innerHTML = e;
            d.parentNode.insertBefore(f, d)
        }
        if (b) {
            a.extend(c, b)
        }
        return this.each(function() {
            var g = ["iframe[src*='player.vimeo.com']", "iframe[src*='youtube.com']", "iframe[src*='youtube-nocookie.com']", "iframe[src*='kickstarter.com'][src*='video.html']", "object", "embed"];
            if (c.customSelector) {
                g.push(c.customSelector)
            }
            var h = a(this).find(g.join(","));
            h = h.not("object object");
            h.each(function() {
                var m = a(this);
                if (this.tagName.toLowerCase() === "embed" && m.parent("object").length || m.parent(".fluid-width-video-wrapper").length) {
                    return
                }
                var i = (this.tagName.toLowerCase() === "object" || (m.attr("height") && !isNaN(parseInt(m.attr("height"), 10)))) ? parseInt(m.attr("height"), 10) : m.height(),
                    j = !isNaN(parseInt(m.attr("width"), 10)) ? parseInt(m.attr("width"), 10) : m.width(),
                    k = i / j;
                if (!m.attr("id")) {
                    var l = "fitvid" + Math.floor(Math.random() * 999999);
                    m.attr("id", l)
                }
                m.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top", (k * 100) + "%");
                m.removeAttr("height").removeAttr("width")
            })
        })
    }
})(window.jQuery || window.Zepto);