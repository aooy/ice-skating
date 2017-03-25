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
		resistanceRatio: 0.4,
		direction: 'x',

	};
	var id = option.containerId.substr(1);
	store[id] = {
		option: option,
		children: container.children,
		childLength: container.children.length,
		childWidth: container.children[0].offsetWidth,
		childHeight: container.children[0].offsetHeight,
		index: 0
	};
	console.log(store)
	var ic = this;

	ic.touchStart = function(e){
		if (!ic.support.touch && 'which' in e && e.which === 3) return;
		
		state.startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        state.startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
		state.currentTarget = e.currentTarget;
		var currStore =  store[state.currentTarget.id];

		state.target = e.target;
		state.option = currStore.option;
		state.resistanceRatio = state.option.resistanceRatio || defaults.resistanceRatio;
		state.direction = state.option.direction || defaults.direction;
		state.index = currStore.index;
	};
	ic.touchMove = function(e){
		if(e.target !== state.target) return;
		var currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        var currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

		if(state.direction === 'x'){
			state.translateX = Math.round((currentX - state.startX) * state.resistanceRatio);
			ic.translate(state.translateX, 0, 0);
        }else if(state.direction === 'y'){
        	state.translateY = Math.round((currentY - state.startY) * state.resistanceRatio);
        	ic.translate(0, state.translateY, 0);
        }
	};
	ic.touchEnd = function(e){
        ic.translateEnd();
        state = Object.create(null);
	};
	ic.translateEnd = function(){
		console.log(state.translateX, state.translateY)
	},
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

	ic.transition = function(time){
		var elStyle = state.currentTarget.style;
		elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = time;
	};

	ic.initEvent = function(){
		var events = ic.support.touch?['touchstart', 'touchmove', 'touchend']:['mousedown','mousemove','mouseup'];

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
        })(),
        flexbox: (function () {
                var div = document.createElement('div').style;
                var styles = ('alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient').split(' ');
                for (var i = 0; i < styles.length; i++) {
                    if (styles[i] in div) return true;
                }
        })()
	}
};

exports.iceSkating = iceSkating;

})));