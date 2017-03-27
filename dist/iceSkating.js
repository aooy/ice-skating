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
	var id = option.containerId.substr(1),
	    swipeRatio = option.swipeRatio || 0.1,
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
		touchRatio: option.touchRatio || 0.6,
		direction: option.direction || 'x',
		swipeRatio: swipeRatio,
		animationDuration: option.animationDuration || 300,
		fastClickTime: option.fastClickTime || 300,
		limitDisX: swipeRatio * childWidth,
		limitDisY: swipeRatio * childHeight,
		clickCallback: option.clickCallback || {},
		autoplayDelay: option.autoplayDelay || 2000
	};

	var ic = this;
	ic.store = store[id];

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
		console.log('touchstart')
	};

	ic.touchMove = function(e){
		if(e.target !== state.target || state.touchEnd || !state.touchStart) return;
		console.log('touchmove')
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
		console.log('touchend',state)
		state.touchEnd = true;
		if(!state.touchStart || state.animating) return;
		var fastClick ;
		if(fastClick = (e.timeStamp - state.startTime) < state.currStore.fastClickTime && !state.touchMove){
			console.log('算点击')
			var i = state.currStore.index;
			if((i = state.currStore.clickCallback[i]) && typeof i === 'function') i();
		}
		if(!state.touchMove) return;
		if(fastClick || (Math.abs(state.diffX) < state.currStore.limitDisX && Math.abs(state.diffY) < state.currStore.limitDisY)){
		   console.log('200ms,未到界限')
		   ic.recover(state.currStore.translateX, state.currStore.translateY, 0);
		}else{
			console.log('touchEnd')
			if(state.diffX > 0 || state.diffY > 0) {
				console.log('上一页')
				ic.moveTo(state.currStore.index - 1);
			}else{
				console.log('下一页')
				ic.moveTo(state.currStore.index + 1);
			}	
		}
	};

	ic.clearState = function(){
		console.log('清理state')
		state = Object.create(null);
	};

	ic.moveTo = function(index){
		var currStore = state.currStore || ic.store;
		if(index < currStore.childLength && index > -1){
			ic.setIndex(index);
			if(currStore.direction === 'x'){	
				ic.recover(-index * currStore.childWidth, 0, 0);
				currStore.translateX = -index * currStore.childWidth;
			}else{
				ic.recover(0 , -index * currStore.childHeight, 0);
				currStore.translateY = -index * currStore.childHeight;
			}
		}else {
			ic.recover(currStore.translateX , currStore.translateY, 0);
		}
	};

	ic.setIndex = function(index){
		var currStore = state.currStore || ic.store;
		currStore.index = index;
	};

	ic.recover = function(x, y, z){
		var store = state.currStore || ic.store;
		state.animating = true;
		ic.transitionDuration(store.animationDuration);
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
		var ele = state.currentTarget || container;
		var elStyle = ele.style;
		elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
	};

	ic.transitionDuration = function(time){
		var ele = state.currentTarget || container;
		var elStyle = ele.style;
		elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = time + 'ms';
	};

	ic.transitionDurationEndFn = function(){
		console.log('transitionDurationEnd')
		ic.transitionDuration(0);
		ic.clearState();
		if(store.autoPlay) ic.autoPlay();
	};
	ic.autoPlay = function(){
		setTimeout(function(){
			ic.moveTo();
		},ic.store.autoplayDelay)
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