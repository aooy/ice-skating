(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global)));
}(this, (function (exports) { 
'use strict';

function isDef (s) { return s !== undefined; }
function isNumber (n) { return typeof n === 'number'; }
function isBoolean (b) { return typeof b === 'boolean'; }

var isInit = false;
var state = Object.create(null);

function iceSkating(option){
	if (!(this instanceof iceSkating)) return new iceSkating(option);

	var ic = this;
	if(!ic.support.transition) return;

	var container = document.querySelector(option.containerId);
	
	var id = option.containerId.substr(1),
	    critical = isDef(option.critical) && isNumber (option.critical) ? option.critical : 0.1,
	    childWidth = container.children[0].offsetWidth,
	    childHeight = container.children[0].offsetHeight;

	ic.store = {	
		id: id,
		container: container,
		childLength: container.children.length,
		childWidth: childWidth,
		childHeight: childHeight,
		index: 0,
		translateX: 0,
		translateY: 0,
		touchRatio: isDef(option.touchRatio) && isNumber (option.touchRatio) ? option.touchRatio : 1,
		direction: option.direction === 'y' ? 'y' : 'x',
		critical: critical,
		animationDuration: isDef(option.animationDuration) && isNumber (option.animationDuration) ? option.animationDuration : 300,
		fastClickTime: isDef(option.fastClickTime) && isNumber (option.fastClickTime) ? option.fastClickTime : 300,
		limitDisX: critical * childWidth,
		limitDisY: critical * childHeight,
		clickCallback: option.clickCallback,
		iceEndCallBack: option.iceEndCallBack,
		autoPlayID: null,
		autoPlay: isDef (option.autoPlay) && isBoolean (option.autoPlay) ? option.autoPlay : false,
		autoplayDelay: isDef (option.autoplayDelay) && isNumber (option.autoplayDelay) ? option.autoplayDelay : 3000,
		preventClicks: isDef (option.preventClicks) && isBoolean (option.preventClicks) ? option.preventClicks : true
	};

	var touchStart = function(e){
		if (!ic.support.touch && 'which' in e && e.which === 3) return;
		state.startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        state.startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
		state.startTime = e.timeStamp;
		state.currentTarget = e.currentTarget;
		state.id = e.currentTarget.id;
		state.target = e.target;
		state.currStore = ic.store;
		state.touchEnd = state.touchMove = false;
		state.touchStart = true;
		state.diffX = state.diffY = 0;
		state.animatingX = state.animatingY = 0;
	};

	var touchMove = function(e){
		if(e.target !== state.target || state.touchEnd || !state.touchStart) return;
		state.touchMove = true;
		var currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        var currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
        var currStore = state.currStore;
        if(currStore.animating){
        	var animationTranslate = getTranslate(state.currentTarget);
        	state.animatingX = animationTranslate.x - currStore.translateX;
        	state.animatingY = animationTranslate.y - currStore.translateY;
        	currStore.animating = false;
        	removeTransitionDuration(currStore.container);
        }
        if(currStore.autoPlayID !== null){
        	clearTimeout(currStore.autoPlayID);
        	currStore.autoPlayID = null;
        }
		if(currStore.direction === 'x'){
			state.diffX = Math.round((currentX - state.startX) * currStore.touchRatio);
			translate(currStore.container, state.animatingX + state.diffX + state.currStore.translateX, 0, 0);
        }else{
        	state.diffY = Math.round((currentY - state.startY) * state.currStore.touchRatio);
        	translate(currStore.container, 0, state.animatingY + state.diffY + state.currStore.translateY, 0);
        }
	};

	var touchEnd = function(e){
		state.touchEnd = true;
		if(!state.touchStart) return;
		var fastClick ;
		var currStore = state.currStore;
		if(fastClick = (e.timeStamp - state.startTime) < currStore.fastClickTime && !state.touchMove && typeof currStore.clickCallback === 'function'){
			currStore.clickCallback();
		}
		if(!state.touchMove) return;
		if(fastClick || (Math.abs(state.diffX) < currStore.limitDisX && Math.abs(state.diffY) < currStore.limitDisY)){
		   if(state.diffX === 0 && state.diffY === 0 && currStore.autoPlay) autoPlay(currStore);
		   recover(currStore, currStore.translateX, currStore.translateY, 0);
		}else{
			if(state.diffX > 0 || state.diffY > 0) {
				moveTo(currStore, currStore.index - 1);
			}else{
				moveTo(currStore, currStore.index + 1);
			}	
		}
	};

	var moveTo = function(store, index){
		var currStore = store;
		if(index < currStore.childLength && index > -1){
			setIndex(currStore, index);
			if(currStore.direction === 'x'){	
				recover(currStore, -index * currStore.childWidth, 0, 0);
				currStore.translateX = -index * currStore.childWidth;
			}else{
				recover(currStore, 0 , -index * currStore.childHeight, 0);
				currStore.translateY = -index * currStore.childHeight;
			}
		}else {
			recover(currStore, currStore.translateX , currStore.translateY, 0);
		}
	};

	var setIndex = function(store, index){
		store.index = index;
	};

	var recover = function(store, x, y, z){
		store.animating = true;
		transitionDuration(store.container, store.animationDuration);
		translate(store.container, x, y, z);
	};

	var translate = function(ele, x, y, z){
		if (ic.support.transforms3d){
			transform(ele, 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
		} else {
			transform(ele, 'translate(' + x + 'px, ' + y + 'px)');
		}
	};

	var transform = function(ele, transform){
		var elStyle = ele.style;
		elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
	};

	var transitionDuration = function(ele,time){
		var elStyle = ele.style;
		elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = time + 'ms';
	};

	var removeTransitionDuration = function(ele){
		var elStyle = ele.style;
		elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = '';
	};

	var transitionDurationEndFn = function(){
		ic.store.animating = false;
		if(typeof ic.store.iceEndCallBack === 'function')  ic.store.iceEndCallBack();
		transitionDuration(container, 0);
		if(ic.store.id === state.id) state = Object.create(null);
		if(ic.store.autoPlay) autoPlay(ic.store);
	};

	var getTranslate = function(el){
		var curStyle = window.getComputedStyle(el);
		var curTransform = curStyle.transform || curStyle.webkitTransform;
		var x,y; x = y = 0;
		curTransform = curTransform.split(', ');
		if (curTransform.length === 6) {
			x = parseInt(curTransform[4], 10);
			y = parseInt(curTransform[5], 10);
		}
        return {'x': x,'y': y};
	};

	var autoPlay = function(store){
		store.autoPlayID = setTimeout(function(){
			var index = store.index;
			++index;
			if(index === store.childLength){
	            index = 0;
	        }
			moveTo(store, index);
		},store.autoplayDelay);
		
	};

	ic.moveToIndex = function(index){
		var currStore = ic.store;
		if(currStore.index === index) return;
		if(currStore.autoPlayID){
        	clearTimeout(currStore.autoPlayID);
        	currStore.autoPlayID = null;
        }
		moveTo(currStore, index);
	};

	ic.getIndex = function(){
		return ic.store.index;
	};

	ic.preventClicks = function(e){
		e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
	};
	var initEvent = function(){
		var events = ic.support.touch ? ['touchstart', 'touchmove', 'touchend']:['mousedown','mousemove','mouseup'];
		var transitionEndEvents = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
        for (var i = 0; i < transitionEndEvents.length; i++) {
            ic.addEvent(container, transitionEndEvents[i], transitionDurationEndFn, false);
        } 
		ic.addEvent(container, events[0], touchStart, false);
		if(ic.store.preventClicks) ic.addEvent(container, 'click', ic.preventClicks, true);
		if(!isInit){
			ic.addEvent(document, events[1], touchMove, false);
			ic.addEvent(document, events[2], touchEnd, false);
			isInit = true;
		}
	};
	initEvent();
	if(ic.store.autoPlay) autoPlay(ic.store);
}

iceSkating.prototype = {
	addEvent: function(target, type, fn, capture){
		target.addEventListener(type, fn, capture);
	},
	support: {
		touch: (function(){
			return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
		})(),
		transforms3d : (function () {
            var div = document.createElement('div').style;
            return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
        })(),
        transition : (function () {
            var div = document.createElement('div').style;
            return ('webkitTransition' in div || 'MozTransition' in div || 'OTransition' in div || 'MsTransition' in div || 'transition' in div);
        })()
	}
};

exports.iceSkating = iceSkating;

})));