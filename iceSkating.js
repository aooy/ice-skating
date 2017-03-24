(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.myswiper = global.myswiper || {})));
}(this, (function (exports) { 
'use strict';

function iceSkating(option){
	if (!(this instanceof iceSkating)) return new iceSkating(option);
	var default = {};
	var ic = this;
	ic.store = {};
	ic.touchStart = function(e){
		ic.store.startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        ic.store.startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
	};
	ic.touchMove = function(e){
		var currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        var currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
	};
	ic.touchEnd = function(e){
		ic.store.endX = e.type === 'touchend' ? e.targetTouches[0].pageX : e.pageX;
        ic.store.endY = e.type === 'touchend' ? e.targetTouches[0].pageY : e.pageY;
	};
}
	

iceSkating.prototype = {
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

exports.a = {};
//Object.defineProperty(exports, '__esModule', { value: true });
})));