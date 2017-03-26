(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global)));
}(this, (function (exports) { 
'use strict';

var docTouch = false;
var store = Object.create(null);
var state = Object.create(null);
function iceSkating(option){
	if (!(this instanceof iceSkating)) return new iceSkating(option);

	var container = document.querySelector(option.containerId);
	var defaults = {
		touchRatio: 0.6,
		direction: 'x',
		swipeRatio: 0.1,
		animationDuration: 300
	};
	var id = option.containerId.substr(1),
	    swipeRatio = option.swipeRatio || defaults.swipeRatio,
	 	childWidth = container.children[0].offsetWidth,
		childHeight = container.children[0].offsetHeight;

	store[id] = {
		children: container.children,
		childLength: container.children.length,
		childWidth: childWidth,
		childHeight: childHeight,
		index: 0,
		translateX: 0,
		translateY: 0,
		touchRatio: option.touchRatio || defaults.touchRatio,
		direction: option.direction || defaults.direction,
		swipeRatio: swipeRatio,
		animationDuration: option.animationDuration || defaults.animationDuration,
		limitDisX: swipeRatio * childWidth,
		limitDisY: swipeRatio * childHeight
	};

	var ic = this;

	ic.touchStart = function(e){
		if (!ic.support.touch && 'which' in e && e.which === 3  || state.animating) return;
		e.preventDefault();
        e.stopPropagation();
		state.startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        state.startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
		state.startTime = e.timeStamp;
		state.currentTarget = e.currentTarget;
		state.target = e.target;
		state.currStore = store[e.currentTarget.id];
		state.touchEnd = state.touchMove = false;
		state.touchStart = true;
		state.diffY = state.diffY = 0;

		console.log('touchstart',state)
	};

	ic.touchMove = function(e){
		if(e.target !== state.target || state.touchEnd || !state.touchStart) return;
		state.touchMove = true;
		var currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        var currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

		if(state.currStore.direction === 'x'){
			state.diffX = Math.round((currentX - state.startX) * state.currStore.touchRatio);
			ic.translate(state.diffX + state.currStore.translateX, 0, 0);
        }else{
        	state.diffY = Math.round((currentY - state.startY) * state.currStore.touchRatio);
        	ic.translate(0, state.diffY + state.currStore.translateY, 0);
        }
	};

	ic.touchEnd = function(e){
		state.touchEnd = true;
		if(!state.touchStart || !state.touchMove) return;
		if((e.timeStamp - state.startTime) < 200){
			console.log('200ms')
		   ic.recover(state.currStore.translateX, state.currStore.translateY, 0);
		}else{
			console.log('touchEnd')
			var index = state.currStore.index;
			if(Math.abs(state.diffX) < state.currStore.limitDisX && Math.abs(state.diffY) < state.currStore.limitDisY) {
				console.log('未到界限')
				ic.recover(state.currStore.translateX, state.currStore.translateY, 0);
			}else{
				if(state.diffX > 0 || state.diffY > 0) {
					console.log('上一页')
					ic.moveTo('preSibling');
				}else{
					console.log('下一页')
					ic.moveTo('nextSibiling');
				}
			}			
		}
	};

	ic.clearState = function(){
		state = Object.create(null);
	};

	ic.moveTo = function(type){
		var index = type === 'nextSibiling' ? state.currStore.index + 1 : state.currStore.index - 1;
		var currStore = state.currStore;
		if(index < state.currStore.childLength && index > -1){
			ic.setIndex(index);
			if(state.currStore.direction === 'x'){	
				ic.recover(-index * state.currStore.childWidth, 0, 0);
				currStore.translateX = -index * currStore.childWidth;
			}else{
				ic.recover(0 , -index * state.currStore.childHeight, 0);
				currStore.translateY = -index * currStore.childHeight;
			}
		}else {
			ic.recover(state.currStore.translateX , state.currStore.translateY, 0);
		}
	};
	ic.setIndex = function(index){
		state.currStore.index = index;
	};

	ic.recover = function(x, y, z){
		state.animating = true;
		ic.transitionDuration(state.currStore.animationDuration);
		ic.translate(x, y, z);
	};

	ic.translate = function(x, y, z){
		if (ic.support.transforms3d){
			ic.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
		} else {
			ic.transform('translate(' + x + 'px, ' + y + 'px)');
		}
	};

	ic.transform = function(transform){
		var elStyle = state.currentTarget.style;
		elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
	};

	ic.transitionDuration = function(time){
		var elStyle = state.currentTarget.style;
		elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = time + 'ms';
	};

	ic.transitionDurationEndFn = function(){
		console.log('transitionDurationEnd')
		ic.transitionDuration(0);
		ic.clearState();
	};

	ic.initEvent = function(){
		var events = ic.support.touch ? ['touchstart', 'touchmove', 'touchend']:['mousedown','mousemove','mouseup'];
		var transitionEndEvents = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
        for (var i = 0; i < transitionEndEvents.length; i++) {
            ic.addEvent(container, transitionEndEvents[i], ic.transitionDurationEndFn, false);
        } 
		ic.addEvent(container, events[0], ic.touchStart);
		if(!docTouch){
		ic.addEvent(document, events[1], ic.touchMove, false);
		ic.addEvent(document, events[2], ic.touchEnd, false);
			docTouch = true;
		}
	};
	ic.initEvent();
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
        })()
	}
};

exports.iceSkating = iceSkating;

})));