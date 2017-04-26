(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
Copyright luojia@luojia.me
LGPL license
*/

function Object2HTML(obj, func) {
	var ele = void 0,
	    o = void 0,
	    e = void 0;
	if (typeof obj === 'string') return document.createTextNode(obj); //text node
	if ('_' in obj === false) return; //if it dont have a _ prop to specify a tag
	if (typeof obj._ !== 'string' || obj._ == '') return;
	ele = document.createElement(obj._);
	//attributes
	if (_typeof(obj.attr) === 'object') {
		for (o in obj.attr) {
			ele.setAttribute(o, obj.attr[o]);
		}
	}
	//properties
	if (_typeof(obj.prop) === 'object') {
		for (o in obj.prop) {
			ele[o] = obj.prop[o];
		}
	}
	//events
	if (_typeof(obj.event) === 'object') {
		for (o in obj.event) {
			ele.addEventListener(o, obj.event[o]);
		}
	}
	//childNodes
	if (_typeof(obj.child) === 'object' && obj.child.length > 0) {
		obj.child.forEach(function (o) {
			e = o instanceof Node ? o : Object2HTML(o, func);
			e instanceof Node && ele.appendChild(e);
		});
	}
	func && func(ele);
	return ele;
}

exports.default = Object2HTML;
exports.Object2HTML = Object2HTML;

},{}],2:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
;
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
        module.exports = factory();
    } else {
        root.ResizeSensor = factory();
    }
})(undefined, function () {

    // Make sure it does not throw in a SSR (Server Side Rendering) situation
    if (typeof window === "undefined") {
        return null;
    }
    // Only used for the dirty checking, so the event callback count is limited to max 1 call per fps per sensor.
    // In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
    // would generate too many unnecessary events.
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
        return window.setTimeout(fn, 20);
    };

    /**
     * Iterate over each of the provided element(s).
     *
     * @param {HTMLElement|HTMLElement[]} elements
     * @param {Function}                  callback
     */
    function forEachElement(elements, callback) {
        var elementsType = Object.prototype.toString.call(elements);
        var isCollectionTyped = '[object Array]' === elementsType || '[object NodeList]' === elementsType || '[object HTMLCollection]' === elementsType || '[object Object]' === elementsType || 'undefined' !== typeof jQuery && elements instanceof jQuery //jquery
        || 'undefined' !== typeof Elements && elements instanceof Elements //mootools
        ;
        var i = 0,
            j = elements.length;
        if (isCollectionTyped) {
            for (; i < j; i++) {
                callback(elements[i]);
            }
        } else {
            callback(elements);
        }
    }

    /**
     * Class for dimension change detection.
     *
     * @param {Element|Element[]|Elements|jQuery} element
     * @param {Function} callback
     *
     * @constructor
     */
    var ResizeSensor = function ResizeSensor(element, callback) {
        /**
         *
         * @constructor
         */
        function EventQueue() {
            var q = [];
            this.add = function (ev) {
                q.push(ev);
            };

            var i, j;
            this.call = function () {
                for (i = 0, j = q.length; i < j; i++) {
                    q[i].call();
                }
            };

            this.remove = function (ev) {
                var newQueue = [];
                for (i = 0, j = q.length; i < j; i++) {
                    if (q[i] !== ev) newQueue.push(q[i]);
                }
                q = newQueue;
            };

            this.length = function () {
                return q.length;
            };
        }

        /**
         * @param {HTMLElement} element
         * @param {String}      prop
         * @returns {String|Number}
         */
        function getComputedStyle(element, prop) {
            if (element.currentStyle) {
                return element.currentStyle[prop];
            }
            if (window.getComputedStyle) {
                return window.getComputedStyle(element, null).getPropertyValue(prop);
            }

            return element.style[prop];
        }

        /**
         *
         * @param {HTMLElement} element
         * @param {Function}    resized
         */
        function attachResizeEvent(element, resized) {
            if (element.resizedAttached) {
                element.resizedAttached.add(resized);
                return;
            }

            element.resizedAttached = new EventQueue();
            element.resizedAttached.add(resized);

            element.resizeSensor = document.createElement('div');
            element.resizeSensor.className = 'resize-sensor';
            var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;';
            var styleChild = 'position: absolute; left: 0; top: 0; transition: 0s;';

            element.resizeSensor.style.cssText = style;
            element.resizeSensor.innerHTML = '<div class="resize-sensor-expand" style="' + style + '">' + '<div style="' + styleChild + '"></div>' + '</div>' + '<div class="resize-sensor-shrink" style="' + style + '">' + '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' + '</div>';
            element.appendChild(element.resizeSensor);

            if (getComputedStyle(element, 'position') == 'static') {
                element.style.position = 'relative';
            }

            var expand = element.resizeSensor.childNodes[0];
            var expandChild = expand.childNodes[0];
            var shrink = element.resizeSensor.childNodes[1];
            var dirty, rafId, newWidth, newHeight;
            var lastWidth = element.offsetWidth;
            var lastHeight = element.offsetHeight;

            var reset = function reset() {
                expandChild.style.width = '100000px';
                expandChild.style.height = '100000px';

                expand.scrollLeft = 100000;
                expand.scrollTop = 100000;

                shrink.scrollLeft = 100000;
                shrink.scrollTop = 100000;
            };

            reset();

            var onResized = function onResized() {
                rafId = 0;

                if (!dirty) return;

                lastWidth = newWidth;
                lastHeight = newHeight;

                if (element.resizedAttached) {
                    element.resizedAttached.call();
                }
            };

            var onScroll = function onScroll() {
                newWidth = element.offsetWidth;
                newHeight = element.offsetHeight;
                dirty = newWidth != lastWidth || newHeight != lastHeight;

                if (dirty && !rafId) {
                    rafId = requestAnimationFrame(onResized);
                }

                reset();
            };

            var addEvent = function addEvent(el, name, cb) {
                if (el.attachEvent) {
                    el.attachEvent('on' + name, cb);
                } else {
                    el.addEventListener(name, cb);
                }
            };

            addEvent(expand, 'scroll', onScroll);
            addEvent(shrink, 'scroll', onScroll);
        }

        forEachElement(element, function (elem) {
            attachResizeEvent(elem, callback);
        });

        this.detach = function (ev) {
            ResizeSensor.detach(element, ev);
        };
    };

    ResizeSensor.detach = function (element, ev) {
        forEachElement(element, function (elem) {
            if (elem.resizedAttached && typeof ev == "function") {
                elem.resizedAttached.remove(ev);
                if (elem.resizedAttached.length()) return;
            }
            if (elem.resizeSensor) {
                if (elem.contains(elem.resizeSensor)) {
                    elem.removeChild(elem.resizeSensor);
                }
                delete elem.resizeSensor;
                delete elem.resizedAttached;
            }
        });
    };

    return ResizeSensor;
});

},{}],3:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ResizeSensor = exports.DanmakuFrameModule = exports.DanmakuFrame = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ResizeSensor = require('../lib/ResizeSensor.js');

var _ResizeSensor2 = _interopRequireDefault(_ResizeSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DanmakuFrame = function () {
	function DanmakuFrame(container) {
		var _this = this;

		_classCallCheck(this, DanmakuFrame);

		this.container = container || document.createElement('div');
		this.rate = 1;
		this.timeBase = 0;
		this.media = null;
		this.fps = 0;
		this.working = false;
		this.modules = {}; //constructed module list
		this.moduleList = [];
		this.width = 0;
		this.height = 0;
		var style = document.createElement("style");
		document.head.appendChild(style);
		this.styleSheet = style.sheet;

		for (var m in DanmakuFrame.moduleList) {
			//init all modules
			this.initModule(m);
		}

		setTimeout(function () {
			//container size sensor
			_this.container.ResizeSensor = new _ResizeSensor2.default(_this.container, function () {
				_this.resize();
			});
			_this.resize();
		}, 0);
		this.draw = this.draw.bind(this);
	}

	_createClass(DanmakuFrame, [{
		key: 'enable',
		value: function enable(name) {
			var module = this.modules[name];
			if (!module) return this.initModule(name);
			module.enabled = true;
			module.enable && module.enable();
			return true;
		}
	}, {
		key: 'disable',
		value: function disable(name) {
			var module = this.modules[name];
			if (!module) return false;
			module.enabled = false;
			module.disable && module.disable();
			return true;
		}
	}, {
		key: 'initModule',
		value: function initModule(name) {
			var mod = DanmakuFrame.moduleList[name];
			if (!mod) throw 'Module [' + name + '] does not exist.';
			var module = new mod(this);
			if (module instanceof DanmakuFrameModule === false) throw 'Constructor of ' + name + ' is not extended from DanmakuFrameModule';
			module.enabled = true;
			this.modules[name] = module;
			this.moduleList.push(name);
			console.debug('Mod Inited: ' + name);
			return true;
		}
	}, {
		key: 'draw',
		value: function draw(force) {
			if (!this.working) return;
			this.moduleFunction('draw', force);
			if (this.fps === 0) {
				requestAnimationFrame(this.draw);
			} else {
				setTimeout(this.draw, 1000 / this.fps);
			}
		}
	}, {
		key: 'load',
		value: function load(danmakuObj) {
			this.moduleFunction('load', danmakuObj);
		}
	}, {
		key: 'loadList',
		value: function loadList(danmakuArray) {
			this.moduleFunction('loadList', danmakuArray);
		}
	}, {
		key: 'unload',
		value: function unload(danmakuObj) {
			this.moduleFunction('unload', danmakuObj);
		}
	}, {
		key: 'start',
		value: function start() {
			if (this.working) return;
			this.working = true;
			this.moduleFunction('start');
			this.draw(true);
		}
	}, {
		key: 'pause',
		value: function pause() {
			this.working = false;
			this.moduleFunction('pause');
		}
	}, {
		key: 'resize',
		value: function resize() {
			this.width = this.container.offsetWidth;
			this.height = this.container.offsetHeight;
			this.moduleFunction('resize');
		}
	}, {
		key: 'moduleFunction',
		value: function moduleFunction(name, arg) {
			for (var i = 0, m; i < this.moduleList.length; i++) {
				m = this.modules[this.moduleList[i]];
				if (m[name]) m[name](arg);
			}
		}
	}, {
		key: 'setMedia',
		value: function setMedia(media) {
			var _this2 = this;

			this.media = media;
			addEvents(media, {
				playing: function playing() {
					_this2.start();
				},
				pause: function pause() {
					_this2.pause();
				},
				ratechange: function ratechange() {
					_this2.rate = _this2.media.playbackRate;
				}
			});
			this.moduleFunction('media', media);
		}
	}, {
		key: 'time',
		set: function set(t) {
			//current media time (ms)
			this.media || (this.timeBase = Date.now() - t);
			this.moduleFunction('time', t); //let all mods know when the time be set
		},
		get: function get() {
			return this.media ? this.media.currentTime * 1000 | 0 : Date.now() - this.timeBase;
		}
	}], [{
		key: 'addModule',
		value: function addModule(name, module) {
			if (name in this.moduleList) {
				console.warn('The module "' + name + '" has already been added.');
				return;
			}
			this.moduleList[name] = module;
		}
	}]);

	return DanmakuFrame;
}();

DanmakuFrame.moduleList = {};

var DanmakuFrameModule = function DanmakuFrameModule(frame) {
	_classCallCheck(this, DanmakuFrameModule);

	this.frame = frame;
	this.enabled = false;
};

function addEvents(target) {
	var events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var _loop = function _loop(e) {
		e.split(/\,/g).forEach(function (e2) {
			return target.addEventListener(e2, events[e]);
		});
	};

	for (var e in events) {
		_loop(e);
	}
}

exports.DanmakuFrame = DanmakuFrame;
exports.DanmakuFrameModule = DanmakuFrameModule;
exports.ResizeSensor = _ResizeSensor2.default;

},{"../lib/ResizeSensor.js":2}],4:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (f) {
	if (typeof define === "function" && define.amd) {
		define(f);
	} else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
		module.exports = f();
	} else {
		(0, eval)('this').Mat = f();
	}
})(function () {
	var global = (0, eval)('this');
	var TypedArray = global.Float32Array && global.Float32Array.prototype;

	function _createClass2(Constructor) {
		var Matrix = function () {
			function Matrix() {
				_classCallCheck(this, Matrix);
			}

			_createClass(Matrix, [{
				key: "length",
				get: function get() {
					return this._len;
				}
			}], [{
				key: "leftMultiply",
				value: function leftMultiply(m) {
					return this.set(Mat.multiply(m, this, Mat(m.row, this.column)));
				}
			}, {
				key: "rightMultiply",
				value: function rightMultiply(m) {
					return this.set(Mat.multiply(this, m, Mat(this.row, m, column)));
				}
			}, {
				key: "fill",
				value: function fill(n) {
					arguments.length || (n = 0);
					for (var i = this.length; i--;) {
						this[i] = n;
					}return this;
				}
			}, {
				key: "set",
				value: function set(arr, offset) {
					offset || (offset = 0);
					for (var i = arr.length + offset <= this.length ? arr.length : this.length - offset; i--;) {
						this[offset + i] = arr[i];
					}return this;
				}
			}, {
				key: "put",
				value: function put(m, row, column) {
					Mat.put(this, m, row || 0, column || 0);
					return this;
				}
			}, {
				key: "rotate2d",
				value: function rotate2d(t) {
					return this.set(Mat.rotate2d(this, t, Mat.Matrixes.T3));
				}
			}, {
				key: "translate2d",
				value: function translate2d(x, y) {
					return this.set(Mat.translate2d(this, x, y, Mat.Matrixes.T3));
				}
			}, {
				key: "scale2d",
				value: function scale2d(x, y) {
					return this.set(Mat.scale2d(this, x, y, Mat.Matrixes.T3));
				}
			}, {
				key: "rotate3d",
				value: function rotate3d(tx, ty, tz) {
					return this.set(Mat.rotate3d(this, tx, ty, tz, Mat.Matrixes.T4));
				}
			}, {
				key: "scale3d",
				value: function scale3d(x, y, z) {
					return this.set(Mat.scale3d(this, x, y, z, Mat.Matrixes.T4));
				}
			}, {
				key: "translate3d",
				value: function translate3d(x, y, z) {
					return this.set(Mat.translate3d(this, x, y, z, Mat.Matrixes.T4));
				}
			}, {
				key: "rotateX",
				value: function rotateX(t) {
					return this.set(Mat.rotateX(this, t, Mat.Matrixes.T4));
				}
			}, {
				key: "rotateY",
				value: function rotateY(t) {
					return this.set(Mat.rotateY(this, t, Mat.Matrixes.T4));
				}
			}, {
				key: "rotateZ",
				value: function rotateZ(t) {
					return this.set(Mat.rotateZ(this, t, Mat.Matrixes.T4));
				}
			}, {
				key: "clone",
				value: function clone() {
					return Mat(this.row, this.column, this);
				}
			}, {
				key: "toString",
				value: function toString() {
					if (this.length === 0) return '';
					for (var i = 0, lines = [], tmp = []; i < this.length; i++) {
						if (i && i % this.column === 0) {
							lines.push(tmp.join('\t'));
							tmp.length = 0;
						}
						tmp.push(this[i] || 0);
					}
					lines.push(tmp.join('	'));
					return lines.join('\n');
				}
			}]);

			return Matrix;
		}();

		var staticMethods = function () {
			function staticMethods() {
				_classCallCheck(this, staticMethods);
			}

			_createClass(staticMethods, null, [{
				key: "Identity",

				//static methods
				value: function Identity(n) {
					//return a new Identity Matrix
					var m = Mat(n, n, 0);
					for (var i = n; i--;) {
						m[i * n + i] = 1;
					}return m;
				}
			}, {
				key: "Perspective",
				value: function Perspective(fovy, aspect, znear, zfar, result) {
					var y1 = znear * Math.tan(fovy * Math.PI / 360.0),
					    x1 = y1 * aspect,
					    m = result || Mat(4, 4, 0);
					m[0] = 2 * znear / (x1 + x1);
					m[5] = 2 * znear / (y1 + y1);
					m[10] = -(zfar + znear) / (zfar - znear);
					m[14] = -2 * zfar * znear / (zfar - znear);
					m[11] = -1;
					if (result) m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[12] = m[13] = m[15] = 0;
					return m;
				}
			}, {
				key: "multiply",
				value: function multiply(a, b, result) {
					if (a.column !== b.row) throw 'wrong matrix';
					var row = a.row,
					    column = Math.min(a.column, b.column),
					    r = result || Mat(row, column),
					    c = void 0,
					    i = void 0,
					    ind = void 0;
					for (var l = row; l--;) {
						for (c = column; c--;) {
							r[ind = l * r.column + c] = 0;
							for (i = a.column; i--;) {
								r[ind] += a[l * a.column + i] * b[c + i * b.column];
							}
						}
					}
					return r;
				}
			}, {
				key: "multiplyString",
				value: function multiplyString(a, b, array) {
					var ignoreZero = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
					//work out the equation for every elements,only for debug and only works with Array matrixes
					if (a.column !== b.row) throw 'wrong matrix';
					var r = array || Mat(a.row, b.column),
					    l,
					    c,
					    i,
					    ind;
					for (l = a.row; l--;) {
						for (c = b.column; c--;) {
							r[ind = l * b.column + c] = '';
							for (i = 0; i < a.column; i++) {
								if (ignoreZero && (a[l * a.column + i] == 0 || b[c + i * b.column] == 0)) continue;
								r[ind] += (i && r[ind] ? '+' : '') + '(' + a[l * a.column + i] + ')*(' + b[c + i * b.column] + ')';
							}
						}
					}
					return r;
				}
			}, {
				key: "add",
				value: function add(a, b, result) {
					if (a.column !== b.column || a.row !== b.row) throw 'wrong matrix';
					var r = result || Mat(a.row, b.column);
					for (var i = a.length; i--;) {
						r[i] = a[i] + b[i];
					}return r;
				}
			}, {
				key: "minus",
				value: function minus(a, b, result) {
					if (a.column !== b.column || a.row !== b.row) throw 'wrong matrix';
					var r = result || Mat(a.row, b.column);
					for (var i = a.length; i--;) {
						r[i] = a[i] - b[i];
					}return r;
				}
			}, {
				key: "rotate2d",
				value: function rotate2d(m, t, result) {
					var Mr = Mat.Matrixes.rotate2d;
					Mr[0] = Mr[4] = Math.cos(t);
					Mr[1] = -(Mr[3] = Math.sin(t));
					return Mat.multiply(Mr, m, result || Mat(3, 3));
				}
			}, {
				key: "scale2d",
				value: function scale2d(m, x, y, result) {
					var Mr = Mat.Matrixes.scale2d;
					Mr[0] = x;
					Mr[4] = y;
					return Mat.multiply(Mr, m, result || Mat(3, 3));
				}
			}, {
				key: "translate2d",
				value: function translate2d(m, x, y, result) {
					var Mr = Mat.Matrixes.translate2d;
					Mr[2] = x;
					Mr[5] = y;
					return Mat.multiply(Mr, m, result || Mat(3, 3));
				}
			}, {
				key: "rotate3d",
				value: function rotate3d(m, tx, ty, tz, result) {
					var Xc = Math.cos(tx),
					    Xs = Math.sin(tx),
					    Yc = Math.cos(ty),
					    Ys = Math.sin(ty),
					    Zc = Math.cos(tz),
					    Zs = Math.sin(tz),
					    Mr = Mat.Matrixes.rotate3d;
					Mr[0] = Zc * Yc;
					Mr[1] = Zc * Ys * Xs - Zs * Xc;
					Mr[2] = Zc * Ys * Xc + Zs * Xs;
					Mr[4] = Zs * Yc;
					Mr[5] = Zs * Ys * Xs + Zc * Xc;
					Mr[6] = Zs * Ys * Xc - Zc * Xs;
					Mr[8] = -Ys;
					Mr[9] = Yc * Xs;
					Mr[10] = Yc * Xc;
					return Mat.multiply(Mr, m, result || Mat(4, 4));
				}
			}, {
				key: "rotateX",
				value: function rotateX(m, t, result) {
					var Mr = Mat.Matrixes.rotateX;
					Mr[10] = Mr[5] = Math.cos(t);
					Mr[6] = -(Mr[9] = Math.sin(t));
					return Mat.multiply(Mr, m, result || Mat(4, 4));
				}
			}, {
				key: "rotateY",
				value: function rotateY(m, t, result) {
					var Mr = Mat.Matrixes.rotateY;
					Mr[10] = Mr[0] = Math.cos(t);
					Mr[8] = -(Mr[2] = Math.sin(t));
					return Mat.multiply(Mr, m, result || Mat(4, 4));
				}
			}, {
				key: "rotateZ",
				value: function rotateZ(m, t, result) {
					var Mr = Mat.Matrixes.rotateZ;
					Mr[5] = Mr[0] = Math.cos(t);
					Mr[1] = -(Mr[4] = Math.sin(t));
					return Mat.multiply(Mr, m, result || Mat(4, 4));
				}
			}, {
				key: "scale3d",
				value: function scale3d(m, x, y, z, result) {
					var Mr = Mat.Matrixes.scale3d;
					Mr[0] = x;
					Mr[5] = y;
					Mr[10] = z;
					return Mat.multiply(Mr, m, result || Mat(4, 4));
				}
			}, {
				key: "translate3d",
				value: function translate3d(m, x, y, z, result) {
					var Mr = Mat.Matrixes.translate3d;
					Mr[12] = x;
					Mr[13] = y;
					Mr[14] = z;
					return Mat.multiply(Mr, m, result || Mat(4, 4));
				}
			}, {
				key: "put",
				value: function put(m, sub, row, column) {
					var c = void 0,
					    ind = void 0,
					    i = void 0;
					row || (row = 0);
					column || (column = 0);
					for (var l = sub.row; l--;) {
						if (l + row >= m.row) continue;
						for (c = sub.column; c--;) {
							if (c + column >= m.column) continue;
							m[(l + row) * m.column + c + column] = sub[l * sub.column + c];
						}
					}
				}
			}, {
				key: "createClass",
				value: function createClass(Constructor) {
					return _createClass2(Constructor);
				}
			}]);

			return staticMethods;
		}();

		var testArray = new Constructor(1);
		Object.defineProperty(Matrix, '_instanceofTypedArray', { value: !!(TypedArray && TypedArray.isPrototypeOf(testArray)) });
		testArray = null;

		Object.setPrototypeOf(Matrix, Constructor.prototype);
		function Mat(l, c, fill) {
			var M = new Constructor(l * c);
			Object.setPrototypeOf(M, Matrix);
			Object.defineProperty(M, 'length', { value: l * c });
			Object.defineProperty(M, 'row', { value: l });
			Object.defineProperty(M, 'column', { value: c });
			if (arguments.length >= 3) {
				if (Matrix._instanceofTypedArray && fill === 0) {} else if (typeof fill === 'number') {
					M.fill(fill);
				} else if (fill.length) {
					M.set(fill);
				}
			}
			return M;
		}
		Object.setPrototypeOf(Mat, staticMethods);
		Mat.Matrixes = { //do not modify these matrixes manually and dont use them
			I2: Mat.Identity(2),
			I3: Mat.Identity(3),
			I4: Mat.Identity(4),
			T3: Mat(3, 3, 0),
			T4: Mat(4, 4, 0),
			rotate2d: Mat.Identity(3),
			translate2d: Mat.Identity(3),
			scale2d: Mat.Identity(3),
			translate3d: Mat.Identity(4),
			rotate3d: Mat.Identity(4),
			rotateX: Mat.Identity(4),
			rotateY: Mat.Identity(4),
			rotateZ: Mat.Identity(4),
			scale3d: Mat.Identity(4)
		};
		return Mat;
	}
	return _createClass2(global.Float32Array ? Float32Array : Array);
});

},{}],5:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (_typeof(this) !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function () {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new this.constructor(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = typeof setImmediate === 'function' && function (fn) {
    setImmediate(fn);
  } || function (fn) {
    setTimeoutFunc(fn, 0);
  };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }
})(undefined);

},{}],6:[function(require,module,exports){
(function (process,global){
"use strict";

(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
        // Callback can either be a function or a string
        if (typeof callback !== "function") {
            callback = new Function("" + callback);
        }
        // Copy function arguments
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i + 1];
        }
        // Store and register the task
        var task = { callback: callback, args: args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
            case 0:
                callback();
                break;
            case 1:
                callback(args[0]);
                break;
            case 2:
                callback(args[0], args[1]);
                break;
            case 3:
                callback(args[0], args[1], args[2]);
                break;
            default:
                callback.apply(undefined, args);
                break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function registerImmediate(handle) {
            process.nextTick(function () {
                runIfPresent(handle);
            });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function () {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function onGlobalMessage(event) {
            if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function registerImmediate(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function registerImmediate(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function registerImmediate(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function registerImmediate(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();
    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();
    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();
    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();
    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
})(typeof self === "undefined" ? typeof global === "undefined" ? undefined : global : self);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":12}],7:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license

danmaku-frame text2d mod
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('../lib/setImmediate/setImmediate.js');

var _promise = require('../lib/promise/promise.js');

var _promise2 = _interopRequireDefault(_promise);

var _text2d = require('./text2d.js');

var _text2d2 = _interopRequireDefault(_text2d);

var _text3d = require('./text3d.js');

var _text3d2 = _interopRequireDefault(_text3d);

var _textCanvas = require('./textCanvas.js');

var _textCanvas2 = _interopRequireDefault(_textCanvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

if (!window.Promise) window.Promise = _promise2.default;

/*
danmaku obj struct
{
	_:'text',
	time:(number)msec time,
	text:(string),
	style:(object)to be combined whit default style,
	mode:(number)
}

danmaku mode
	0:right
	1:left
	2:bottom
	3:top
*/

function init(DanmakuFrame, DanmakuFrameModule) {
	var defProp = Object.defineProperty;
	var requestIdleCallback = window.requestIdleCallback || setImmediate;
	var useImageBitmap = false;

	var TextDanmaku = function (_DanmakuFrameModule) {
		_inherits(TextDanmaku, _DanmakuFrameModule);

		function TextDanmaku(frame) {
			_classCallCheck(this, TextDanmaku);

			var _this = _possibleConstructorReturn(this, (TextDanmaku.__proto__ || Object.getPrototypeOf(TextDanmaku)).call(this, frame));

			_this.list = []; //danmaku object array
			_this.indexMark = 0; //to record the index of last danmaku in the list
			_this.tunnel = new tunnelManager();
			_this.paused = true;
			_this.randomText = 'danmaku_text_' + (Math.random() * 999999 | 0);
			_this.defaultStyle = { //these styles can be overwrote by the 'font' property of danmaku object
				fontStyle: null,
				fontWeight: 300,
				fontVariant: null,
				color: "#fff",
				lineHeight: null, //when this style is was not a number,the number will be the same as fontSize
				fontSize: 24,
				fontFamily: "Arial",
				strokeWidth: 1, //outline width
				strokeColor: "#888",
				shadowBlur: 5,
				textAlign: 'start', //left right center start end
				shadowColor: "#000",
				shadowOffsetX: 0,
				shadowOffsetY: 0,
				fill: true };
			frame.styleSheet.insertRule('.' + _this.randomText + '_fullfill{top:0;left:0;width:100%;height:100%;position:absolute;}', 0);

			defProp(_this, 'renderMode', { configurable: true });
			defProp(_this, 'activeRenderMode', { configurable: true, value: null });
			var con = _this.container = document.createElement('div');
			con.classList.add(_this.randomText + '_fullfill');
			frame.container.appendChild(con);

			//init modes
			_this.text2d = new _text2d2.default(_this);
			_this.text3d = new _text3d2.default(_this);
			_this.textCanvas = new _textCanvas2.default(_this);

			_this.textCanvasContainer.hidden = _this.canvas.hidden = _this.canvas3d.hidden = true;
			_this.modes = {
				1: _this.textCanvas,
				2: _this.text2d,
				3: _this.text3d
			};
			_this.GraphCache = []; //COL text graph cache
			_this.DanmakuText = [];

			//opt time record
			_this.cacheCleanTime = 0;
			_this.danmakuMoveTime = 0;
			_this.danmakuCheckTime = 0;

			_this.danmakuCheckSwitch = true;
			_this.options = {
				allowLines: false, //allow multi-line danmaku
				screenLimit: 0, //the most number of danmaku on the screen
				clearWhenTimeReset: true, //clear danmaku on screen when the time is reset
				speed: 6.5
			};
			addEvents(document, {
				visibilitychange: function visibilitychange(e) {
					if (document.hidden) {
						_this.pause();
					} else {
						_this.reCheckIndexMark();
						if (_this.frame.working) _this.start();else {
							_this.draw(true);
						}
					}
				}
			});
			_this._checkNewDanmaku = _this._checkNewDanmaku.bind(_this);
			_this._cleanCache = _this._cleanCache.bind(_this);
			setInterval(_this._cleanCache, 5000); //set an interval for cache cleaning
			_this.setRenderMode(1);
			return _this;
		}

		_createClass(TextDanmaku, [{
			key: 'setRenderMode',
			value: function setRenderMode(n) {
				if (this.renderMode === n || !(n in this.modes) || !this.modes[n].supported) return;
				this.clear();
				this.activeRenderMode && this.activeRenderMode.disable();
				this.modes[n].enable();
				defProp(this, 'activeRenderMode', { value: this.modes[n] });
				defProp(this, 'renderMode', { value: n });
				this.activeRenderMode.resize();
			}
		}, {
			key: 'media',
			value: function media(_media) {
				var _this2 = this;

				addEvents(_media, {
					seeked: function seeked() {
						_this2.start();
						_this2.time();
						_this2._clearCanvas();
					},
					seeking: function seeking() {
						return _this2.pause();
					},
					stalled: function stalled() {
						return _this2.pause();
					}
				});
			}
		}, {
			key: 'start',
			value: function start() {
				this.paused = false;
				this.activeRenderMode.start();
			}
		}, {
			key: 'pause',
			value: function pause() {
				this.paused = true;
				this.activeRenderMode.pause();
			}
		}, {
			key: 'load',
			value: function load(d) {
				if (!d || d._ !== 'text') {
					return false;
				}
				if (typeof d.text !== 'string') {
					console.error('wrong danmaku object:', d);
					return false;
				}
				var t = d.time,
				    ind = void 0,
				    arr = this.list;
				ind = dichotomy(arr, d.time, 0, arr.length - 1, false);
				arr.splice(ind, 0, d);
				if (ind < this.indexMark) this.indexMark++;
				//round d.style.fontSize to prevent Iifinity loop in tunnel
				d.style.fontSize = d.style.fontSize + 0.5 | 0;
				if (d.style.fontSize === NaN || d.style.fontSize === Infinity || d.style.fontSize === 0) d.style.fontSize = this.defaultStyle.fontstyle.fontSize;
				if (typeof d.mode !== 'number') d.mode = 0;
				return d;
			}
		}, {
			key: 'loadList',
			value: function loadList(danmakuArray) {
				var _this3 = this;

				danmakuArray.forEach(function (d) {
					return _this3.load(d);
				});
			}
		}, {
			key: 'unload',
			value: function unload(d) {
				if (!d || d._ !== 'text') return false;
				var i = this.list.indexOf(d);
				if (i < 0) return false;
				this.list.splice(i, 1);
				if (i < this.indexMark) this.indexMark--;
				return true;
			}
		}, {
			key: '_checkNewDanmaku',
			value: function _checkNewDanmaku() {
				var d = void 0,
				    time = this.frame.time,
				    hidden = document.hidden;
				if (this.danmakuCheckTime === time) return;
				if (this.list.length) for (; this.indexMark < this.list.length && (d = this.list[this.indexMark]) && d.time <= time; this.indexMark++) {
					//add new danmaku
					if (this.options.screenLimit > 0 && this.DanmakuText.length >= this.options.screenLimit || hidden) {
						continue;
					} //continue if the number of danmaku on screen has up to limit or doc is not visible
					this._addNewDanmaku(d);
				}
				this.danmakuCheckTime = time;
			}
		}, {
			key: '_addNewDanmaku',
			value: function _addNewDanmaku(d) {
				var cHeight = this.height,
				    cWidth = this.width;
				var t = this.GraphCache.length ? this.GraphCache.shift() : new TextGraph();
				t.danmaku = d;
				t.drawn = false;
				t.text = this.options.allowLines ? d.text : d.text.replace(/\n/g, ' ');
				t.time = d.time;
				Object.setPrototypeOf(t.font, this.defaultStyle);
				Object.assign(t.font, d.style);
				if (d.style.color) {
					if (t.font.color && t.font.color[0] !== '#') {
						t.font.color = '#' + d.style.color;
					}
				}

				if (d.mode > 1) t.font.textAlign = 'center';
				t.prepare(this.renderMode === 3 ? false : true);
				//find tunnel number
				var tnum = this.tunnel.getTunnel(t, cHeight);
				//calc margin
				var margin = (tnum < 0 ? 0 : tnum) % cHeight;
				switch (d.mode) {
					case 0:case 1:case 3:
						{
							t.style.y = margin;break;
						}
					case 2:
						{
							t.style.y = cHeight - margin - t.style.height - 1;
						}
				}
				switch (d.mode) {
					case 0:
						{
							t.style.x = cWidth;break;
						}
					case 1:
						{
							t.style.x = -t.style.width;break;
						}
					case 2:case 3:
						{
							t.style.x = (cWidth - t.style.width) / 2;
						}
				}
				this.DanmakuText.push(t);
				this.activeRenderMode.newDanmaku(t);
			}
		}, {
			key: '_calcSideDanmakuPosition',
			value: function _calcSideDanmakuPosition(t, T, cWidth) {
				var R = !t.danmaku.mode,
				    style = t.style;
				return (R ? cWidth : -style.width) + (R ? -1 : 1) * this.frame.rate * (style.width + 1024) * (T - t.time) * this.options.speed / 60000;
			}
		}, {
			key: '_calcDanmakusPosition',
			value: function _calcDanmakusPosition(force) {
				var T = this.frame.time;
				if (!force && (this.danmakuMoveTime === T || this.paused)) return;
				var cWidth = this.width;
				var R = void 0,
				    i = void 0,
				    t = void 0,
				    style = void 0,
				    X = void 0,
				    rate = this.frame.rate;
				this.danmakuMoveTime = T;
				for (i = this.DanmakuText.length; i--;) {
					t = this.DanmakuText[i];
					if (t.time > T) {
						this.removeText(t);
						continue;
					}
					style = t.style;

					switch (t.danmaku.mode) {
						case 0:case 1:
							{
								R = !t.danmaku.mode;
								style.x = X = this._calcSideDanmakuPosition(t, T, cWidth);
								if (t.tunnelNumber >= 0 && (R && X + style.width + 10 < cWidth || !R && X > 10)) {
									this.tunnel.removeMark(t);
								} else if (R && X < -style.width - 10 || !R && X > cWidth + style.width + 10) {
									//go out the canvas
									this.removeText(t);
									continue;
								}
								break;
							}
						case 2:case 3:
							{
								if (T - t.time > this.options.speed * 1000 / rate) {
									this.removeText(t);
								}
							}
					}
				}
			}
		}, {
			key: '_cleanCache',
			value: function _cleanCache(force) {
				//clean text object cache
				var now = Date.now();
				if (this.GraphCache.length > 30 || force) {
					//save 20 cached danmaku
					for (var ti = 0; ti < this.GraphCache.length; ti++) {
						if (force || now - this.GraphCache[ti].removeTime > 10000) {
							//delete cache which has not used for 10s
							this.activeRenderMode.deleteTextObject(this.GraphCache[ti]);
							this.GraphCache.splice(ti, 1);
						} else {
							break;
						}
					}
				}
			}
		}, {
			key: 'draw',
			value: function draw(force) {
				if (!force && this.paused || !this.enabled) return;
				this._calcDanmakusPosition(force);
				this.activeRenderMode.draw(force);
				requestIdleCallback(this._checkNewDanmaku);
			}
		}, {
			key: 'removeText',
			value: function removeText(t) {
				//remove the danmaku from screen
				var ind = this.DanmakuText.indexOf(t);
				if (ind >= 0) this.DanmakuText.splice(ind, 1);
				this.tunnel.removeMark(t);
				t._bitmap = t.danmaku = null;
				t.removeTime = Date.now();
				this.GraphCache.push(t);
				this.activeRenderMode.remove(t);
			}
		}, {
			key: 'resize',
			value: function resize() {
				if (this.activeRenderMode) this.activeRenderMode.resize();
				this.draw(true);
			}
		}, {
			key: '_clearCanvas',
			value: function _clearCanvas(forceFull) {
				this.activeRenderMode && this.activeRenderMode.clear(forceFull);
			}
		}, {
			key: 'clear',
			value: function clear() {
				//clear danmaku on the screen
				for (var i = this.DanmakuText.length, T; i--;) {
					T = this.DanmakuText[i];
					if (T.danmaku) this.removeText(T);
				}
				this.tunnel.reset();
				this._clearCanvas(true);
			}
		}, {
			key: 'reCheckIndexMark',
			value: function reCheckIndexMark() {
				var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.frame.time;

				this.indexMark = dichotomy(this.list, t, 0, this.list.length - 1, true);
			}
		}, {
			key: 'time',
			value: function time() {
				var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.frame.time;
				//reset time,you should invoke it when the media has seeked to another time
				this.reCheckIndexMark(t);
				if (this.options.clearWhenTimeReset) {
					this.clear();
				} else {
					this.resetTimeOfDanmakuOnScreen();
				}
			}
		}, {
			key: 'resetTimeOfDanmakuOnScreen',
			value: function resetTimeOfDanmakuOnScreen(cTime) {
				var _this4 = this;

				//cause the position of the danmaku is based on time
				//and if you don't want these danmaku on the screen to disappear after seeking,their time should be reset
				if (cTime === undefined) cTime = this.frame.time;
				this.DanmakuText.forEach(function (t) {
					if (!t.danmaku) return;
					t.time = cTime - (_this4.danmakuMoveTime - t.time);
				});
			}
		}, {
			key: 'danmakuAt',
			value: function danmakuAt(x, y) {
				//return a list of danmaku which covers this position
				var list = [];
				if (!this.enabled) return list;
				this.DanmakuText.forEach(function (t) {
					if (!t.danmaku) return;
					if (t.style.x <= x && t.style.x + t.style.width >= x && t.style.y <= y && t.style.y + t.style.height >= y) list.push(t.danmaku);
				});
				return list;
			}
		}, {
			key: 'enable',
			value: function enable() {
				//enable the plugin
				this.textCanvasContainer.hidden = false;
			}
		}, {
			key: 'disable',
			value: function disable() {
				//disable the plugin
				this.textCanvasContainer.hidden = true;
				this.pause();
				this.clear();
			}
		}, {
			key: 'useImageBitmap',
			set: function set(v) {
				useImageBitmap = typeof createImageBitmap === 'function' ? v : false;
			},
			get: function get() {
				return useImageBitmap;
			}
		}, {
			key: 'width',
			get: function get() {
				return this.frame.width;
			}
		}, {
			key: 'height',
			get: function get() {
				return this.frame.height;
			}
		}]);

		return TextDanmaku;
	}(DanmakuFrameModule);

	var TextGraph = function () {
		//code copied from CanvasObjLibrary
		function TextGraph() {
			var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

			_classCallCheck(this, TextGraph);

			this._fontString = '';
			this._renderList = null;
			this.style = {};
			this.font = {};
			this.text = text;
			this._renderToCache = this._renderToCache.bind(this);
			defProp(this, '_cache', { configurable: true });
		}

		_createClass(TextGraph, [{
			key: 'prepare',
			value: function prepare() {
				var async = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
				//prepare text details
				if (!this._cache) {
					defProp(this, '_cache', { value: document.createElement("canvas") });
				}
				var ta = [];
				this.font.fontStyle && ta.push(this.font.fontStyle);
				this.font.fontVariant && ta.push(this.font.fontVariant);
				this.font.fontWeight && ta.push(this.font.fontWeight);
				ta.push(this.font.fontSize + 'px');
				this.font.fontFamily && ta.push(this.font.fontFamily);
				this._fontString = ta.join(' ');

				var imgobj = this._cache,
				    ct = imgobj.ctx2d || (imgobj.ctx2d = imgobj.getContext("2d"));
				ct.font = this._fontString;
				this._renderList = this.text.split(/\n/g);
				this.estimatePadding = Math.max(this.font.shadowBlur + 5 + Math.max(Math.abs(this.font.shadowOffsetY), Math.abs(this.font.shadowOffsetX)), this.font.strokeWidth + 3);
				var w = 0,
				    tw = void 0,
				    lh = typeof this.font.lineHeigh === 'number' ? this.font.lineHeigh : this.font.fontSize;
				for (var i = this._renderList.length; i--;) {
					tw = ct.measureText(this._renderList[i]).width;
					tw > w && (w = tw); //max
				}
				imgobj.width = (this.style.width = w) + this.estimatePadding * 2;
				imgobj.height = (this.style.height = this._renderList.length * lh) + (lh < this.font.fontSize ? this.font.fontSize * 2 : 0) + this.estimatePadding * 2;

				ct.translate(this.estimatePadding, this.estimatePadding);
				if (async) {
					requestIdleCallback(this._renderToCache);
				} else {
					this._renderToCache();
				}
			}
		}, {
			key: '_renderToCache',
			value: function _renderToCache() {
				var _this5 = this;

				if (!this.danmaku) return;
				this.render(this._cache.ctx2d);
				if (useImageBitmap) {
					//use ImageBitmap
					if (this._bitmap) {
						this._bitmap.close();
						this._bitmap = null;
					}
					createImageBitmap(this._cache).then(function (bitmap) {
						_this5._bitmap = bitmap;
					});
				}
			}
		}, {
			key: 'render',
			value: function render(ct) {
				//render text
				if (!this._renderList) return;
				ct.save();
				if (this.danmaku.highlight) {
					ct.fillStyle = 'rgba(255,255,255,0.3)';
					ct.beginPath();
					ct.rect(0, 0, this.style.width, this.style.height);
					ct.fill();
				}
				ct.font = this._fontString; //set font
				ct.textBaseline = 'top';
				ct.lineWidth = this.font.strokeWidth;
				ct.fillStyle = this.font.color;
				ct.strokeStyle = this.font.strokeColor;
				ct.shadowBlur = this.font.shadowBlur;
				ct.shadowColor = this.font.shadowColor;
				ct.shadowOffsetX = this.font.shadowOffsetX;
				ct.shadowOffsetY = this.font.shadowOffsetY;
				ct.textAlign = this.font.textAlign;
				var lh = typeof this.font.lineHeigh === 'number' ? this.font.lineHeigh : this.font.fontSize,
				    x = void 0;
				switch (this.font.textAlign) {
					case 'left':case 'start':
						{
							x = 0;break;
						}
					case 'center':
						{
							x = this.style.width / 2;break;
						}
					case 'right':case 'end':
						{
							x = this.style.width;
						}
				}

				for (var i = this._renderList.length; i--;) {
					this.font.strokeWidth && ct.strokeText(this._renderList[i], x, lh * i);
					this.font.fill && ct.fillText(this._renderList[i], x, lh * i);
				}
				ct.restore();
			}
		}]);

		return TextGraph;
	}();

	var tunnelManager = function () {
		function tunnelManager() {
			_classCallCheck(this, tunnelManager);

			this.reset();
		}

		_createClass(tunnelManager, [{
			key: 'reset',
			value: function reset() {
				this.right = {};
				this.left = {};
				this.bottom = {};
				this.top = {};
			}
		}, {
			key: 'getTunnel',
			value: function getTunnel(tobj, cHeight) {
				//get the tunnel index that can contain the danmaku of the sizes
				var tunnel = this.tunnel(tobj.danmaku.mode),
				    size = tobj.style.height,
				    ti = 0,
				    tnum = -1;
				if (typeof size !== 'number' || size <= 0) {
					console.error('Incorrect size:' + size);
					size = 24;
				}
				if (size > cHeight) return 0;

				while (tnum < 0) {
					for (var t = ti + size - 1; ti <= t;) {
						if (tunnel[ti]) {
							//used
							ti += tunnel[ti].tunnelHeight;
							break;
						} else if (ti !== 0 && ti % (cHeight - 1) === 0) {
							//new page
							ti++;
							break;
						} else if (ti === t) {
							//get
							tnum = ti - size + 1;
							break;
						} else {
							ti++;
						}
					}
				}
				tobj.tunnelNumber = tnum;
				tobj.tunnelHeight = tobj.style.y + size > cHeight ? 1 : size;
				this.addMark(tobj);
				return tnum;
			}
		}, {
			key: 'addMark',
			value: function addMark(tobj) {
				var t = this.tunnel(tobj.danmaku.mode);
				if (!t[tobj.tunnelNumber]) t[tobj.tunnelNumber] = tobj;
			}
		}, {
			key: 'removeMark',
			value: function removeMark(tobj) {
				var t = void 0,
				    tun = tobj.tunnelNumber;
				if (tun >= 0 && (t = this.tunnel(tobj.danmaku.mode))[tun] === tobj) {
					delete t[tun];
					tobj.tunnelNumber = -1;
				}
			}
		}, {
			key: 'tunnel',
			value: function tunnel(id) {
				return this[tunnels[id]];
			}
		}]);

		return tunnelManager;
	}();

	var tunnels = ['right', 'left', 'bottom', 'top'];

	function dichotomy(arr, t, start, end) {
		var position = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

		if (arr.length === 0) return 0;
		var m = start,
		    s = start,
		    e = end;
		while (start <= end) {
			//dichotomy
			m = start + end >> 1;
			if (t <= arr[m].time) end = m - 1;else {
				start = m + 1;
			}
		}
		if (position) {
			//find to top
			while (start > 0 && arr[start - 1].time === t) {
				start--;
			}
		} else {
			//find to end
			while (start <= e && arr[start].time === t) {
				start++;
			}
		}
		return start;
	}

	DanmakuFrame.addModule('TextDanmaku', TextDanmaku);
};

function addEvents(target) {
	var events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var _loop = function _loop(e) {
		e.split(/\,/g).forEach(function (e2) {
			return target.addEventListener(e2, events[e]);
		});
	};

	for (var e in events) {
		_loop(e);
	}
}
function limitIn(num, min, max) {
	//limit the number in a range
	return num < min ? min : num > max ? max : num;
}
function emptyFunc() {}
exports.default = init;

},{"../lib/promise/promise.js":5,"../lib/setImmediate/setImmediate.js":6,"./text2d.js":8,"./text3d.js":9,"./textCanvas.js":10}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _textModuleTemplate = require('./textModuleTemplate.js');

var _textModuleTemplate2 = _interopRequireDefault(_textModuleTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               Copyright luojia@luojia.me
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               LGPL license
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


var Text2d = function (_Template) {
	_inherits(Text2d, _Template);

	function Text2d(dText) {
		_classCallCheck(this, Text2d);

		var _this = _possibleConstructorReturn(this, (Text2d.__proto__ || Object.getPrototypeOf(Text2d)).call(this, dText));

		_this.supported = false;
		dText.canvas = document.createElement('canvas'); //the canvas
		dText.canvas.classList.add(dText.randomText + '_fullfill');
		dText.canvas.id = dText.randomText + '_text2d';
		dText.context2d = dText.canvas.getContext('2d'); //the canvas contex
		if (!dText.context2d) {
			console.warn('text 2d not supported');
			return _possibleConstructorReturn(_this);
		}
		dText.container.appendChild(dText.canvas);
		_this.supported = true;
		return _this;
	}

	_createClass(Text2d, [{
		key: 'draw',
		value: function draw(force) {
			var ctx = this.dText.context2d,
			    cW = ctx.canvas.width,
			    dT = this.dText.DanmakuText,
			    i = dT.length,
			    t = void 0;
			ctx.globalCompositeOperation = 'destination-over';
			this.clear(force);
			for (; i--;) {
				(t = dT[i]).drawn || (t.drawn = true);
				if (cW >= t._cache.width) {
					ctx.drawImage(t._bitmap || t._cache, t.style.x - t.estimatePadding, t.style.y - t.estimatePadding);
				} else if (t.style.x - t.estimatePadding >= 0) {
					ctx.drawImage(t._bitmap || t._cache, 0, 0, cW, t._cache.height, t.style.x - t.estimatePadding, t.style.y - t.estimatePadding, cW, t._cache.height);
				} else {
					if (t.style.x - t.estimatePadding + t._cache.width <= cW) {
						ctx.drawImage(t._bitmap || t._cache, t.estimatePadding - t.style.x, 0, t.style.x - t.estimatePadding + t._cache.width, t._cache.height, 0, t.style.y - t.estimatePadding, t.style.x - t.estimatePadding + t._cache.width, t._cache.height);
					} else {
						ctx.drawImage(t._bitmap || t._cache, t.estimatePadding - t.style.x, 0, cW, t._cache.height, 0, t.style.y - t.estimatePadding, cW, t._cache.height);
					}
				}
			}
		}
	}, {
		key: 'clear',
		value: function clear(force) {
			var ctx = this.dText.context2d;
			if (force || this._evaluateIfFullClearMode()) {
				ctx.clearRect(0, 0, this.dText.canvas.width, this.dText.canvas.height);
				return;
			}
			for (var i = this.dText.DanmakuText.length, t; i--;) {
				t = this.dText.DanmakuText[i];
				if (t.drawn) {
					ctx.clearRect(t.style.x - t.estimatePadding, t.style.y - t.estimatePadding, t._cache.width, t._cache.height);
				}
			}
		}
	}, {
		key: '_evaluateIfFullClearMode',
		value: function _evaluateIfFullClearMode() {
			if (this.dText.DanmakuText.length > 3) return true;
			var l = this.dText.GraphCache[this.dText.GraphCache.length - 1];
			if (l && l.drawn) {
				l.drawn = false;
				return true;
			}
			return false;
		}
	}, {
		key: 'resize',
		value: function resize() {
			var C = this.dText.canvas;
			C.width = this.dText.width;
			C.height = this.dText.height;
		}
	}, {
		key: 'enable',
		value: function enable() {
			this.dText.useImageBitmap = !(this.dText.canvas.hidden = false);
		}
	}, {
		key: 'disable',
		value: function disable() {
			this.dText.canvas.hidden = true;
		}
	}]);

	return Text2d;
}(_textModuleTemplate2.default);

exports.default = Text2d;

},{"./textModuleTemplate.js":11}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Mat = require('../lib/Mat/Mat.js');

var _Mat2 = _interopRequireDefault(_Mat);

var _textModuleTemplate = require('./textModuleTemplate.js');

var _textModuleTemplate2 = _interopRequireDefault(_textModuleTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               Copyright luojia@luojia.me
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               LGPL license
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


var requestIdleCallback = window.requestIdleCallback || setImmediate;

var Text3d = function (_Template) {
	_inherits(Text3d, _Template);

	function Text3d(dText) {
		_classCallCheck(this, Text3d);

		var _this = _possibleConstructorReturn(this, (Text3d.__proto__ || Object.getPrototypeOf(Text3d)).call(this, dText));

		_this.supported = false;
		dText.canvas3d = document.createElement('canvas'); //the canvas
		dText.canvas3d.classList.add(dText.randomText + '_fullfill');
		dText.canvas3d.id = dText.randomText + '_text3d';
		dText.context3d = dText.canvas3d.getContext('webgl'); //the canvas3d context
		if (!dText.context3d) dText.context3d = dText.canvas3d.getContext('expeimental-webgl');

		if (!dText.context3d) {
			console.warn('text 3d not supported');
			return _possibleConstructorReturn(_this);
		}
		_this.supported = true;
		dText.container.appendChild(dText.canvas3d);
		var gl = _this.gl = dText.context3d,
		    canvas = dText.canvas3d;
		//init webgl

		//shader
		var shaders = {
			danmakuFrag: [gl.FRAGMENT_SHADER, '\nvarying lowp vec2 vDanmakuTexCoord;\nuniform sampler2D uSampler;\n\nvoid main(void) {\n\tgl_FragColor = texture2D(uSampler,vDanmakuTexCoord);\n}'],
			danmakuVert: [gl.VERTEX_SHADER, '\nattribute vec2 aVertexPosition;\nattribute vec2 aDanmakuTexCoord;\n\nuniform mat4 u2dCoordinate;\nuniform vec2 uDanmakuPos;\n\nvarying lowp vec2 vDanmakuTexCoord;\n\nvoid main(void) {\n\tgl_Position = u2dCoordinate * vec4(aVertexPosition+uDanmakuPos,0,1);\n\tvDanmakuTexCoord = aDanmakuTexCoord;\n}']
		};
		function shader(name) {
			var s = gl.createShader(shaders[name][0]);
			gl.shaderSource(s, shaders[name][1]);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
				throw "An error occurred compiling the shaders: " + gl.getShaderInfoLog(s);
			}
			return s;
		}
		var fragmentShader = shader("danmakuFrag");
		var vertexShader = shader("danmakuVert");
		var shaderProgram = _this.shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error("Unable to initialize the shader program.");
		}
		gl.useProgram(shaderProgram);

		//scene
		gl.clearColor(0, 0, 0, 0.0);
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		_this.maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

		_this.uSampler = gl.getUniformLocation(shaderProgram, "uSampler");
		_this.u2dCoord = gl.getUniformLocation(shaderProgram, "u2dCoordinate");
		_this.uDanmakuPos = gl.getUniformLocation(shaderProgram, "uDanmakuPos");
		_this.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		_this.atextureCoord = gl.getAttribLocation(shaderProgram, "aDanmakuTexCoord");

		gl.enableVertexAttribArray(_this.aVertexPosition);
		gl.enableVertexAttribArray(_this.atextureCoord);

		_this.commonTexCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _this.commonTexCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, commonTextureCoord, gl.STATIC_DRAW);
		gl.vertexAttribPointer(_this.atextureCoord, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(_this.uSampler, 0);
		return _this;
	}

	_createClass(Text3d, [{
		key: 'draw',
		value: function draw(force) {
			var gl = this.gl,
			    l = this.dText.DanmakuText.length;
			for (var i = 0, t; i < l; i++) {
				t = this.dText.DanmakuText[i];
				if (!t || !t.glDanmaku) continue;
				gl.uniform2f(this.uDanmakuPos, t.style.x - t.estimatePadding, t.style.y - t.estimatePadding);

				gl.bindBuffer(gl.ARRAY_BUFFER, t.verticesBuffer);
				gl.vertexAttribPointer(this.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

				gl.bindTexture(gl.TEXTURE_2D, t.texture);

				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			}
			gl.flush();
		}
	}, {
		key: 'clear',
		value: function clear() {
			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		}
	}, {
		key: 'deleteTextObject',
		value: function deleteTextObject(t) {
			var gl = this.gl;
			if (t.texture) gl.deleteTexture(t.texture);
			if (t.verticesBuffer) gl.deleteBuffer(t.verticesBuffer);
			if (t.textureCoordBuffer) gl.deleteBuffer(t.textureCoordBuffer);
		}
	}, {
		key: 'resize',
		value: function resize(w, h) {
			var gl = this.gl,
			    C = this.dText.canvas3d;
			C.width = this.dText.width;
			C.height = this.dText.height;
			gl.viewport(0, 0, C.width, C.height);
			//to 2d canvas
			gl.uniformMatrix4fv(this.u2dCoord, false, _Mat2.default.Identity(4).translate3d(-1, 1, 0).scale3d(2 / C.width, -2 / C.height, 0));
		}
	}, {
		key: 'enable',
		value: function enable() {
			this.dText.useImageBitmap = this.dText.canvas3d.hidden = false;
		}
	}, {
		key: 'disable',
		value: function disable() {
			this.dText._cleanCache(true);
			this.dText.canvas3d.hidden = true;
		}
	}, {
		key: 'newDanmaku',
		value: function newDanmaku(t) {
			var gl = this.gl;
			t.glDanmaku = false;
			if (t._cache.height > this.maxTexSize || t._cache.width > this.maxTexSize) {
				//ignore too large danmaku image
				console.warn('Ignore a danmaku width too large size', t.danmaku);
				return;
			}
			var tex = void 0;
			if (!(tex = t.texture)) {
				tex = t.texture = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, tex);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}

			requestIdleCallback(function () {
				gl.bindTexture(gl.TEXTURE_2D, tex);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t._cache);
				t.glDanmaku = true;
			});

			//vert
			t.verticesBuffer || (t.verticesBuffer = gl.createBuffer());
			gl.bindBuffer(gl.ARRAY_BUFFER, t.verticesBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, t._cache.width, 0, 0, t._cache.height, t._cache.width, t._cache.height]), gl.STATIC_DRAW);
		}
	}]);

	return Text3d;
}(_textModuleTemplate2.default);

var commonTextureCoord = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]);

exports.default = Text3d;

},{"../lib/Mat/Mat.js":4,"./textModuleTemplate.js":11}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _textModuleTemplate = require('./textModuleTemplate.js');

var _textModuleTemplate2 = _interopRequireDefault(_textModuleTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               Copyright luojia@luojia.me
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               LGPL license
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


var TextCanvas = function (_Template) {
	_inherits(TextCanvas, _Template);

	function TextCanvas(dText) {
		_classCallCheck(this, TextCanvas);

		var _this = _possibleConstructorReturn(this, (TextCanvas.__proto__ || Object.getPrototypeOf(TextCanvas)).call(this, dText));

		_this.supported = dText.text2d.supported;
		if (!_this.supported) return _possibleConstructorReturn(_this);
		dText.frame.styleSheet.insertRule('#' + dText.randomText + '_textCanvasContainer canvas{will-change:transform;top:0;left:0;position:absolute;}', 0);
		dText.frame.styleSheet.insertRule('#' + dText.randomText + '_textCanvasContainer.moving canvas{transition:transform 500s linear;}', 0);
		dText.frame.styleSheet.insertRule('#' + dText.randomText + '_textCanvasContainer{will-change:transform;pointer-events:none;overflow:hidden;}', 0);

		dText.textCanvasContainer = document.createElement('div'); //for text canvas
		dText.textCanvasContainer.classList.add(dText.randomText + '_fullfill');
		dText.textCanvasContainer.id = dText.randomText + '_textCanvasContainer';
		dText.container.appendChild(dText.textCanvasContainer);
		document.addEventListener('visibilitychange', function (e) {
			if (dText.renderMode === 1 && !document.hidden) {
				_this.resetPos();
			}
		});
		return _this;
	}

	_createClass(TextCanvas, [{
		key: 'pause',
		value: function pause() {
			var T = this.dText.frame.time;
			this.dText.textCanvasContainer.classList.remove('moving');
			for (var dT = this.dText, i = dT.DanmakuText.length, t; i--;) {
				if ((t = dT.DanmakuText[i]).danmaku.mode >= 2) continue;
				var X = this.dText._calcSideDanmakuPosition(t, T, this.dText.width);
				t._cache.style.transform = 'translate3d(' + ((X - t.estimatePadding) * 10 | 0) / 10 + 'px,' + (t.style.y - t.estimatePadding) + 'px,0)';
			}
		}
	}, {
		key: 'start',
		value: function start() {
			var T = this.dText.frame.time;
			this.dText.textCanvasContainer.classList.add('moving');
			for (var dT = this.dText, i = dT.DanmakuText.length, t; i--;) {
				if ((t = dT.DanmakuText[i]).danmaku.mode < 2) this._move(t, T);
			}
		}
	}, {
		key: '_move',
		value: function _move(t) {
			var _this2 = this;

			var T = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.dText.frame.time;

			requestAnimationFrame(function () {
				if (!t.danmaku) return;
				var X = _this2.dText._calcSideDanmakuPosition(t, T + 500000, _this2.dText.width);
				t._cache.style.transform = 'translate3d(' + ((X - t.estimatePadding) * 10 | 0) / 10 + 'px,' + (t.style.y - t.estimatePadding) + 'px,0)';
			});
		}
	}, {
		key: 'resetPos',
		value: function resetPos() {
			var _this3 = this;

			this.pause();
			if (!this.dText.paused) setImmediate(function () {
				_this3.start();
			});
		}
	}, {
		key: 'resize',
		value: function resize() {
			this.resetPos();
		}
	}, {
		key: 'remove',
		value: function remove(t) {
			this.dText.textCanvasContainer.removeChild(t._cache);
		}
	}, {
		key: 'enable',
		value: function enable() {
			this.dText.textCanvasContainer.hidden = false;
		}
	}, {
		key: 'disable',
		value: function disable() {
			this.dText.textCanvasContainer.hidden = true;
		}
	}, {
		key: 'newDanmaku',
		value: function newDanmaku(t) {
			t._cache.style.transform = 'translate3d(' + ((t.style.x - t.estimatePadding) * 10 | 0) / 10 + 'px,' + (t.style.y - t.estimatePadding) + 'px,0)';
			this.dText.textCanvasContainer.appendChild(t._cache);
			if (t.danmaku.mode < 2) this._move(t);
		}
	}]);

	return TextCanvas;
}(_textModuleTemplate2.default);

exports.default = TextCanvas;

},{"./textModuleTemplate.js":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
Copyright luojia@luojia.me
LGPL license

*/
var textModuleTemplate = function () {
	function textModuleTemplate(dText) {
		_classCallCheck(this, textModuleTemplate);

		this.dText = dText;
	}

	_createClass(textModuleTemplate, [{
		key: "draw",
		value: function draw() {}
	}, {
		key: "pause",
		value: function pause() {}
	}, {
		key: "start",
		value: function start() {}
	}, {
		key: "clear",
		value: function clear() {}
	}, {
		key: "resize",
		value: function resize() {}
	}, {
		key: "remove",
		value: function remove() {}
	}, {
		key: "enable",
		value: function enable() {}
	}, {
		key: "disable",
		value: function disable() {}
	}, {
		key: "newDanmaku",
		value: function newDanmaku() {}
	}, {
		key: "deleteTextObject",
		value: function deleteTextObject() {}
	}]);

	return textModuleTemplate;
}();

exports.default = textModuleTemplate;

},{}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ResizeSensor = exports.toArray = exports.limitIn = exports.setAttrs = exports.padTime = exports.formatTime = exports.isFullscreen = exports.exitFullscreen = exports.requestFullscreen = exports.addEvents = exports.NyaPlayerCore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _danmakuFrame = require('../lib/danmaku-frame/src/danmaku-frame.js');

var _danmakuText = require('../lib/danmaku-text/src/danmaku-text.js');

var _danmakuText2 = _interopRequireDefault(_danmakuText);

var _Object2HTML = require('../lib/Object2HTML/Object2HTML.js');

var _Object2HTML2 = _interopRequireDefault(_Object2HTML);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(0, _danmakuText2.default)(_danmakuFrame.DanmakuFrame, _danmakuFrame.DanmakuFrameModule); //init TextDanmaku mod


//default options
var NyaPOptions = {
	muted: false,
	volume: 1,
	loop: false,
	textStyle: {},
	danmakuOption: {}
};

var NyaPEventEmitter = function () {
	function NyaPEventEmitter() {
		_classCallCheck(this, NyaPEventEmitter);

		this._events = {};
	}

	_createClass(NyaPEventEmitter, [{
		key: 'emit',
		value: function emit(e, arg) {
			this._resolve(e, arg);
		}
	}, {
		key: '_resolve',
		value: function _resolve(e, arg) {
			var _this = this;

			if (e in this._events) {
				var hs = this._events[e];
				try {
					hs.forEach(function (h) {
						h.call(_this, e, arg);
					});
				} catch (e) {
					console.error(e);
				}
			}
		}
	}, {
		key: 'on',
		value: function on(e, handle) {
			if (!(handle instanceof Function)) return;
			if (!(e in this._events)) this._events[e] = [];
			this._events[e].push(handle);
		}
	}, {
		key: 'removeEvent',
		value: function removeEvent(e, handle) {
			if (!(e in this._events)) return;
			if (arguments.length === 1) {
				delete this._events[e];return;
			}
			var ind = void 0;
			if (ind = this._events[e].indexOf(handle) >= 0) this._events[e].splice(ind, 1);
			if (this._events[e].length === 0) delete this._events[e];
		}
	}]);

	return NyaPEventEmitter;
}();

var NyaPlayerCore = function (_NyaPEventEmitter) {
	_inherits(NyaPlayerCore, _NyaPEventEmitter);

	function NyaPlayerCore(opt) {
		_classCallCheck(this, NyaPlayerCore);

		var _this2 = _possibleConstructorReturn(this, (NyaPlayerCore.__proto__ || Object.getPrototypeOf(NyaPlayerCore)).call(this));

		opt = _this2.opt = Object.assign({}, NyaPOptions, opt);
		_this2._ = {}; //for private variables
		var video = _this2._.video = (0, _Object2HTML2.default)({ _: 'video', attr: { id: 'main_video' } });
		_this2.videoFrame = (0, _Object2HTML2.default)({ _: 'div', attr: { id: 'video_frame' }, child: [video] });
		_this2.danmakuFrame = new _danmakuFrame.DanmakuFrame(_this2.videoFrame);
		_this2.danmakuFrame.setMedia(video);
		_this2.danmakuFrame.enable('TextDanmaku');
		_this2.setDanmakuOptions(opt.danmakuOption);
		_this2.setDanmakuOptions(opt.textStyle);

		//options
		setTimeout(function (a) {
			['src', 'muted', 'volume', 'loop'].forEach(function (o) {
				//dont change the order
				opt[o] !== undefined && (_this2.video[o] = opt[o]);
			});
		}, 0);

		//define events
		{
			(function () {
				//video:_loopChange
				var LoopDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'loop');
				Object.defineProperty(video, 'loop', {
					get: LoopDesc.get,
					set: function set(bool) {
						if (bool === this.loop) return;
						this.dispatchEvent(Object.assign(new Event('_loopChange'), { value: bool }));
						LoopDesc.set.call(this, bool);
					}
				});
			})();
		}

		_this2.emit('coreLoad');
		//this.danmakuFrame.container
		return _this2;
	}

	_createClass(NyaPlayerCore, [{
		key: 'play',
		value: function play() {
			this.video.paused && this.video.play();
		}
	}, {
		key: 'pause',
		value: function pause() {
			this.video.paused || this.video.pause();
		}
	}, {
		key: 'playToggle',
		value: function playToggle() {
			this[this.video.paused ? 'play' : 'pause']();
		}
	}, {
		key: 'loadDanmaku',
		value: function loadDanmaku(obj) {
			this.danmakuFrame.load(obj);
		}
	}, {
		key: 'loadDanmakuList',
		value: function loadDanmakuList(obj) {
			this.danmakuFrame.loadList(obj);
		}
	}, {
		key: 'removeDanmaku',
		value: function removeDanmaku(obj) {
			this.danmakuFrame.unload(obj);
		}
	}, {
		key: 'danmakuToggle',
		value: function danmakuToggle() {
			var bool = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.danmakuFrame.working;

			this.danmakuFrame[bool ? 'strat' : 'stop']();
		}
	}, {
		key: 'setDefaultTextStyle',
		value: function setDefaultTextStyle(opt) {
			if (opt) for (var n in opt) {
				this.TextDanmaku.defaultStyle[n] = opt[n];
			}
		}
	}, {
		key: 'setDanmakuOptions',
		value: function setDanmakuOptions(opt) {
			if (opt) for (var n in opt) {
				this.TextDanmaku.options[n] = opt[n];
			}
		}
	}, {
		key: 'player',
		get: function get() {
			return this._.player;
		}
	}, {
		key: 'video',
		get: function get() {
			return this._.video;
		}
	}, {
		key: 'src',
		get: function get() {
			return this.video.src;
		},
		set: function set(s) {
			this.video.src = s;
		}
	}, {
		key: 'TextDanmaku',
		get: function get() {
			return this.danmakuFrame.modules.TextDanmaku;
		}
	}, {
		key: 'videoSize',
		get: function get() {
			return [this.video.videoWidth, this.video.videoHeight];
		}
	}]);

	return NyaPlayerCore;
}(NyaPEventEmitter);

//other functions

function addEvents(target) {
	var events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var _loop = function _loop(e) {
		e.split(/\,/g).forEach(function (e2) {
			return target.addEventListener(e2, events[e]);
		});
	};

	for (var e in events) {
		_loop(e);
	}
}
function requestFullscreen(d) {
	try {
		(d.requestFullscreen || d.msRequestFullscreen || d.mozRequestFullScreen || d.webkitRequestFullscreen).call(d);
	} catch (e) {
		console.error(e);
		alert(_('Failed to change to fullscreen mode'));
	}
}
function exitFullscreen() {
	var d = document;
	(d.exitFullscreen || d.msExitFullscreen || d.mozCancelFullScreen || d.webkitCancelFullScreen).call(d);
}
function isFullscreen() {
	var d = document;
	return !!(d.fullscreen || d.mozFullScreen || d.webkitIsFullScreen || d.msFullscreenElement);
}
function formatTime(sec, total) {
	var r = void 0,
	    s = sec | 0,
	    h = s / 3600 | 0;
	if (total >= 3600) s = s % 3600;
	r = [padTime(s / 60 | 0), padTime(s % 60)];
	total >= 3600 && r.unshift(h);
	return r.join(':');
}
function padTime(n) {
	//pad number to 2 chars
	return n > 9 && n || '0' + n;
}
function setAttrs(ele, obj) {
	//set multi attrs to a Element
	for (var a in obj) {
		ele.setAttribute(a, obj[a]);
	}
}
function limitIn(num, min, max) {
	//limit the number in a range
	return num < min ? min : num > max ? max : num;
}
function toArray(obj) {
	return [].concat(_toConsumableArray(obj));
}

//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) String.prototype.startsWith = function (searchString) {
	var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	return this.substr(position, searchString.length) === searchString;
};

exports.default = NyaPlayerCore;
exports.NyaPlayerCore = NyaPlayerCore;
exports.addEvents = addEvents;
exports.requestFullscreen = requestFullscreen;
exports.exitFullscreen = exitFullscreen;
exports.isFullscreen = isFullscreen;
exports.formatTime = formatTime;
exports.padTime = padTime;
exports.setAttrs = setAttrs;
exports.limitIn = limitIn;
exports.toArray = toArray;
exports.ResizeSensor = _danmakuFrame.ResizeSensor;

},{"../lib/Object2HTML/Object2HTML.js":1,"../lib/danmaku-frame/src/danmaku-frame.js":3,"../lib/danmaku-text/src/danmaku-text.js":7}],14:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

var _i18n = require('./i18n.js');

var _NyaPCore = require('./NyaPCore.js');

var _Object2HTML = require('../lib/Object2HTML/Object2HTML.js');

var _ResizeSensor = require('../lib/danmaku-frame/lib/ResizeSensor.js');

var _ResizeSensor2 = _interopRequireDefault(_ResizeSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = _i18n.i18n._;

//touch player

var TouchNyaP = function (_NyaPlayerCore) {
	_inherits(TouchNyaP, _NyaPlayerCore);

	function TouchNyaP(opt) {
		_classCallCheck(this, TouchNyaP);

		var _this = _possibleConstructorReturn(this, (TouchNyaP.__proto__ || Object.getPrototypeOf(TouchNyaP)).call(this, opt));

		_this._player = (0, _Object2HTML.Object2HTML)({
			_: 'div', attr: { 'class': 'NyaP_Mini' }
		});
		return _this;
	}

	return TouchNyaP;
}(_NyaPCore.NyaPlayerCore);

window.TouchNyaP = TouchNyaP;

},{"../lib/Object2HTML/Object2HTML.js":1,"../lib/danmaku-frame/lib/ResizeSensor.js":2,"./NyaPCore.js":13,"./i18n.js":15}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
Copyright luojia@luojia.me
LGPL license
*/
var i18n = {
	lang: null,
	langs: {},
	_: function _(str) {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		var s = i18n.lang && i18n.langs[i18n.lang][str] || str;
		args.length && args.forEach(function (arg, ind) {
			s = s.replace('$' + ind, arg);
		});
		return s;
	}
};

i18n.langs['zh-CN'] = {
	'play': '播放',
	'loop': '循环',
	'Send': '发送',
	'pause': '暂停',
	'muted': '静音',
	'settings': '设置',
	'full page(P)': '全页模式(P)',
	'full screen(F)': '全屏模式(F)',
	'volume($0)([shift]+↑↓)': '音量($0)([shift]+↑↓)',
	'hex color': 'Hex颜色',
	'danmaku input(Enter)': '弹幕输入框(回车)',
	'Input danmaku here': '在这里输入弹幕',
	'Failed to change to fullscreen mode': '无法切换到全屏模式'
};

//automatically select a language

if (!navigator.languages) {
	navigator.languages = [navigator.language];
}

var _arr = [].concat(_toConsumableArray(navigator.languages));

for (var _i = 0; _i < _arr.length; _i++) {
	var lang = _arr[_i];
	if (i18n.langs[lang]) {
		i18n.lang = lang;
		break;
	}
	var code = lang.match(/^\w+/)[0];
	for (var cod in i18n.langs) {
		if (cod.startsWith(code)) {
			i18n.lang = cod;
			break;
		}
	}
	if (i18n.lang) break;
}
console.debug('Language:' + i18n.lang);

exports.i18n = i18n;

},{}]},{},[14])

//# sourceMappingURL=NyaPTouch.es2015.js.map