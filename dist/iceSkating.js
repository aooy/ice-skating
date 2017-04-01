(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global)));
}(this, (function (exports) { 
'use strict';

var docTouch = false;
var mainStore = Object.create(null);
var state = Object.create(null);
function iceSkating(option){
	if (!(this instanceof iceSkating)) return new iceSkating(option);

	var ic = this;
	if(!ic.support.transition) return;

	var container = document.querySelector(option.containerId);
	
	var id = option.containerId.substr(1),
	    criticalSwipe = option.criticalSwipe || 0.1,
	    childWidth = container.children[0].offsetWidth,
	    childHeight = container.children[0].offsetHeight;

	ic.store = mainStore[id] = {
		id: id,
		container: container,
		childLength: container.children.length,
		childWidth: childWidth,
		childHeight: childHeight,
		index: 0,
		translateX: 0,
		translateY: 0,
		touchRatio: option.touchRatio || 1,
		direction: option.direction || 'x',
		criticalSwipe: criticalSwipe,
		animationDuration: option.animationDuration || 300,
		fastClickTime: option.fastClickTime || 300,
		limitDisX: criticalSwipe * childWidth,
		limitDisY: criticalSwipe * childHeight,
		clickCallback: option.clickCallback,
		iceEndCallBack: option.iceEndCallBack,
		autoPlayID: null,
		autoPlay: option.autoPlay || false,
		autoplayDelay: option.autoplayDelay || 3000
	};

	var touchStart = function(e){
		if (!ic.support.touch && 'which' in e && e.which === 3) return;
		e.preventDefault();
        e.stopPropagation();
		state.startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        state.startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
		state.startTime = e.timeStamp;
		state.currentTarget = e.currentTarget;
		state.id = e.currentTarget.id;
		state.target = e.target;
		state.currStore = mainStore[e.currentTarget.id];
		state.touchEnd = state.touchMove = false;
		state.touchStart = true;
		state.diffY = state.diffY = 0;
		state.animatingX = state.animatingY = 0;
		console.log('touchstart')
	};

	var touchMove = function(e){
		if(e.target !== state.target || state.touchEnd || !state.touchStart) return;
		console.log('touchmove')
		state.touchMove = true;
		var currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        var currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
        var currStore = state.currStore;
        if(currStore.animating){
        	console.log('正在动画中')
        	var animationTranslate = getTranslate(state.currentTarget);
        	state.animatingX = animationTranslate.x - currStore.translateX;
        	state.animatingY = animationTranslate.y - currStore.translateY;
        	currStore.animating = false;
        	removeTransitionDuration(currStore.container);
        }
        if(currStore.autoPlayID !== null){
        	console.log(currStore.id,'清除定时器')
        	clearTimeout(currStore.autoPlayID);
        	currStore.autoPlayID = null;
        }
		if(currStore.direction === 'x'){
			console.log('x方向')
			state.diffX = Math.round((currentX - state.startX) * currStore.touchRatio);
			translate(currStore.container, state.animatingX + state.diffX + state.currStore.translateX, 0, 0);
        }else{
        	state.diffY = Math.round((currentY - state.startY) * state.currStore.touchRatio);
        	translate(currStore.container, 0, state.animatingY + state.diffY + state.currStore.translateY, 0);
        }
	};

	var touchEnd = function(e){
		console.log('touchend')
		state.touchEnd = true;
		if(!state.touchStart) return;
		var fastClick ;
		var currStore = state.currStore;
		if(fastClick = (e.timeStamp - state.startTime) < currStore.fastClickTime && !state.touchMove && typeof currStore.clickCallback === 'function'){
			console.log('算点击')
			currStore.clickCallback();
		}
		if(!state.touchMove) return;
		if(fastClick || (Math.abs(state.diffX) < currStore.limitDisX && Math.abs(state.diffY) < currStore.limitDisY)){
		   console.log('200ms,未到界限',state.diffX)
		   if(state.diffX === 0 && state.diffY === 0 && currStore.autoPlay) autoPlay(currStore);
		   recover(currStore, currStore.translateX, currStore.translateY, 0);
		}else{
			console.log('touchEnd')
			if(state.diffX > 0 || state.diffY > 0) {
				console.log('上一页')
				moveTo(currStore, currStore.index - 1);
			}else{
				console.log('下一页')
				moveTo(currStore, currStore.index + 1);
			}	
		}
	};

	var moveTo = function(store, index){
		var currStore = store;
		console.log(currStore.id, 'moveTo')
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
		console.log('设置距离x:',x)
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
		if(time === 0){
			console.log('动画时间设为0')
		}
	};
	var removeTransitionDuration = function(ele){
		var elStyle = ele.style;
		elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = '';
	};
	var transitionDurationEndFn = function(){
		console.log(ic.store.id,'transitionDurationEnd')
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
		console.log(store.id,'轮播开始到',store.index)
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
        	console.log(currStore.id,'清除定时器')
        	clearTimeout(currStore.autoPlayID);
        	currStore.autoPlayID = null;
        }
		moveTo(currStore, index);
	};

	ic.getIndex = function(){
		return ic.store.index;
	};

	var initEvent = function(){
		var events = ic.support.touch ? ['touchstart', 'touchmove', 'touchend']:['mousedown','mousemove','mouseup'];
		var transitionEndEvents = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
        for (var i = 0; i < transitionEndEvents.length; i++) {
            ic.addEvent(container, transitionEndEvents[i], transitionDurationEndFn, false);
        } 
		ic.addEvent(container, events[0], touchStart, false);
		if(!docTouch){
			ic.addEvent(document, events[1], touchMove, false);
			ic.addEvent(document, events[2], touchEnd, false);
			docTouch = true;
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