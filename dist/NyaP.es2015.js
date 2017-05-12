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
function _Obj(t) {
	return (typeof t === 'undefined' ? 'undefined' : _typeof(t)) == 'object';
}

function Object2HTML(obj, func) {
	var ele = void 0,
	    o = void 0,
	    e = void 0;
	if (typeof obj === 'string' || typeof obj === 'number') return document.createTextNode(obj); //text node
	if (obj === null || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || '_' in obj === false || typeof obj._ !== 'string' || obj._ == '') return; //if it dont have a _ prop to specify a tag
	ele = document.createElement(obj._);
	//attributes
	if (_Obj(obj.attr)) for (o in obj.attr) {
		ele.setAttribute(o, obj.attr[o]);
	} //properties
	if (_Obj(obj.prop)) for (o in obj.prop) {
		ele[o] = obj.prop[o];
	} //events
	if (_Obj(obj.event)) for (o in obj.event) {
		ele.addEventListener(o, obj.event[o]);
	} //childNodes
	if (_Obj(obj.child) && obj.child.length > 0) obj.child.forEach(function (o) {
		e = o instanceof Node ? o : Object2HTML(o, func);
		e instanceof Node && ele.appendChild(e);
	});
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
		_classCallCheck(this, DanmakuFrame);

		var F = this;
		F.container = container || document.createElement('div');
		F.rate = 1;
		F.timeBase = F.width = F.height = F.fps = 0;
		F.fpsTmp = 0;
		F.fpsRec = F.fps || 60;
		F.media = null;
		F.working = false;
		F.modules = {}; //constructed module list
		F.moduleList = [];
		var style = document.createElement("style");
		document.head.appendChild(style);
		F.styleSheet = style.sheet;

		for (var m in DanmakuFrame.moduleList) {
			//init all modules
			F.initModule(m);
		}

		setTimeout(function () {
			//container size sensor
			F.container.ResizeSensor = new _ResizeSensor2.default(F.container, function () {
				F.resize();
			});
			F.resize();
		}, 0);
		setInterval(function () {
			F.fpsRec = F.fpsTmp;
			F.fpsTmp = 0;
		}, 1000);
		F.draw = F.draw.bind(F);
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
		key: 'addStyle',
		value: function addStyle(s) {
			var _this = this;

			if (typeof s === 'string') s = [s];
			if (s instanceof Array === false) return;
			s.forEach(function (r) {
				return _this.styleSheet.insertRule(r, _this.styleSheet.cssRules.length);
			});
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
			var _this2 = this;

			if (!this.working) return;
			this.fpsTmp++;
			this.moduleFunction('draw', force);
			if (this.fps === 0) {
				requestAnimationFrame(function () {
					return _this2.draw();
				});
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
				if (m.enabled && m[name]) m[name](arg);
			}
		}
	}, {
		key: 'setMedia',
		value: function setMedia(media) {
			var _this3 = this;

			this.media = media;
			addEvents(media, {
				playing: function playing() {
					return _this3.start();
				},
				pause: function pause() {
					return _this3.pause();
				},
				ratechange: function ratechange() {
					return _this3.rate = _this3.media.playbackRate;
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

var _createClass2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

	function _createClass(Constructor) {
		var Matrix = function () {
			function Matrix(l, c) {
				var fill = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

				_classCallCheck(this, Matrix);

				this.array = new Constructor(l * c);
				Object.defineProperty(this.array, 'row', { value: l });
				Object.defineProperty(this.array, 'column', { value: c });
				if (arguments.length == 3) {
					if (Matrix._instanceofTypedArray && fill === 0) {} else if (typeof fill === 'number') {
						this.fill(fill);
					} else if (fill.length) {
						this.set(fill);
					}
				}
			}

			_createClass2(Matrix, [{
				key: "leftMultiply",
				value: function leftMultiply(m) {
					return this.set(Matrix.multiply(m, this, new Matrix(m.row, this.column)));
				}
			}, {
				key: "rightMultiply",
				value: function rightMultiply(m) {
					return this.set(Matrix.multiply(this, m, new Matrix(this.row, m, column)));
				}
			}, {
				key: "fill",
				value: function fill(n) {
					arguments.length || (n = 0);
					for (var i = this.length; i--;) {
						this.array[i] = n;
					}return this;
				}
			}, {
				key: "set",
				value: function set(arr, offset) {
					offset || (offset = 0);
					arr instanceof Matrix && (arr = arr.array);
					for (var i = arr.length + offset <= this.length ? arr.length : this.length - offset; i--;) {
						this.array[offset + i] = arr[i];
					}return this;
				}
			}, {
				key: "put",
				value: function put(m, row, column) {
					Matrix.put(this, m, row || 0, column || 0);
					return this;
				}
			}, {
				key: "rotate2d",
				value: function rotate2d(t) {
					return this.set(Matrix.rotate2d(this, t, Matrix.Matrixes.T3));
				}
			}, {
				key: "translate2d",
				value: function translate2d(x, y) {
					return this.set(Matrix.translate2d(this, x, y, Matrix.Matrixes.T3));
				}
			}, {
				key: "scale2d",
				value: function scale2d(x, y) {
					return this.set(Matrix.scale2d(this, x, y, Matrix.Matrixes.T3));
				}
			}, {
				key: "rotate3d",
				value: function rotate3d(tx, ty, tz) {
					return this.set(Matrix.rotate3d(this, tx, ty, tz, Matrix.Matrixes.T4));
				}
			}, {
				key: "scale3d",
				value: function scale3d(x, y, z) {
					return this.set(Matrix.scale3d(this, x, y, z, Matrix.Matrixes.T4));
				}
			}, {
				key: "translate3d",
				value: function translate3d(x, y, z) {
					return this.set(Matrix.translate3d(this, x, y, z, Matrix.Matrixes.T4));
				}
			}, {
				key: "rotateX",
				value: function rotateX(t) {
					return this.set(Matrix.rotateX(this, t, Matrix.Matrixes.T4));
				}
			}, {
				key: "rotateY",
				value: function rotateY(t) {
					return this.set(Matrix.rotateY(this, t, Matrix.Matrixes.T4));
				}
			}, {
				key: "rotateZ",
				value: function rotateZ(t) {
					return this.set(Matrix.rotateZ(this, t, Matrix.Matrixes.T4));
				}
			}, {
				key: "clone",
				value: function clone() {
					return new Matrix(this.row, this.column, this);
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
						tmp.push(this.array[i] || 0);
					}
					lines.push(tmp.join('	'));
					return lines.join('\n');
				}

				//static methods

			}, {
				key: "length",
				get: function get() {
					return this.array.length;
				}
			}, {
				key: "row",
				get: function get() {
					return this.array.row;
				}
			}, {
				key: "column",
				get: function get() {
					return this.array.column;
				}
			}], [{
				key: "Identity",
				value: function Identity(n) {
					//return a new Identity Matrix
					var m = new Matrix(n, n, 0);
					for (var i = n; i--;) {
						m.array[i * n + i] = 1;
					}return m;
				}
			}, {
				key: "Perspective",
				value: function Perspective(fovy, aspect, znear, zfar, result) {
					var y1 = znear * Math.tan(fovy * Math.PI / 360.0),
					    x1 = y1 * aspect,
					    m = result || new Matrix(4, 4, 0),
					    arr = m.array;

					arr[0] = 2 * znear / (x1 + x1);
					arr[5] = 2 * znear / (y1 + y1);
					arr[10] = -(zfar + znear) / (zfar - znear);
					arr[14] = -2 * zfar * znear / (zfar - znear);
					arr[11] = -1;
					if (result) arr[1] = arr[2] = arr[3] = arr[4] = arr[6] = arr[7] = arr[8] = arr[9] = arr[12] = arr[13] = arr[15] = 0;
					return m;
				}
			}, {
				key: "multiply",
				value: function multiply(a, b, result) {
					if (a.column !== b.row) throw 'wrong matrix';
					var row = a.row,
					    column = Math.min(a.column, b.column),
					    r = result || new Matrix(row, column),
					    c = void 0,
					    i = void 0,
					    ind = void 0;
					for (var l = row; l--;) {
						for (c = column; c--;) {
							r.array[ind = l * r.column + c] = 0;
							for (i = a.column; i--;) {
								r.array[ind] += a.array[l * a.column + i] * b.array[c + i * b.column];
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
					var r = array || new Matrix(a.row, b.column),
					    l,
					    c,
					    i,
					    ind;
					for (l = a.row; l--;) {
						for (c = b.column; c--;) {
							r.array[ind = l * b.column + c] = '';
							for (i = 0; i < a.column; i++) {
								if (ignoreZero && (a.array[l * a.column + i] == 0 || b.array[c + i * b.column] == 0)) continue;
								r.array[ind] += (i && r.array[ind] ? '+' : '') + '(' + a.array[l * a.column + i] + ')*(' + b.array[c + i * b.column] + ')';
							}
						}
					}
					return r;
				}
			}, {
				key: "add",
				value: function add(a, b, result) {
					if (a.column !== b.column || a.row !== b.row) throw 'wrong matrix';
					var r = result || new Matrix(a.row, b.column);
					for (var i = a.length; i--;) {
						r.array[i] = a.array[i] + b.array[i];
					}return r;
				}
			}, {
				key: "minus",
				value: function minus(a, b, result) {
					if (a.column !== b.column || a.row !== b.row) throw 'wrong matrix';
					var r = result || new Matrix(a.row, b.column);
					for (var i = a.length; i--;) {
						r.array[i] = a.array[i] - b.array[i];
					}return r;
				}
			}, {
				key: "rotate2d",
				value: function rotate2d(m, t, result) {
					var Mr = Matrix.Matrixes.rotate2d;
					Mr.array[0] = Mr.array[4] = Math.cos(t);
					Mr.array[1] = -(Mr.array[3] = Math.sin(t));
					return Matrix.multiply(Mr, m, result || new Matrix(3, 3));
				}
			}, {
				key: "scale2d",
				value: function scale2d(m, x, y, result) {
					var Mr = Matrix.Matrixes.scale2d;
					Mr.array[0] = x;
					Mr.array[4] = y;
					return Matrix.multiply(Mr, m, result || new Matrix(3, 3));
				}
			}, {
				key: "translate2d",
				value: function translate2d(m, x, y, result) {
					var Mr = Matrix.Matrixes.translate2d;
					Mr.array[2] = x;
					Mr.array[5] = y;
					return Matrix.multiply(Mr, m, result || new Matrix(3, 3));
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
					    Mr = Matrix.Matrixes.rotate3d;
					Mr.array[0] = Zc * Yc;
					Mr.array[1] = Zc * Ys * Xs - Zs * Xc;
					Mr.array[2] = Zc * Ys * Xc + Zs * Xs;
					Mr.array[4] = Zs * Yc;
					Mr.array[5] = Zs * Ys * Xs + Zc * Xc;
					Mr.array[6] = Zs * Ys * Xc - Zc * Xs;
					Mr.array[8] = -Ys;
					Mr.array[9] = Yc * Xs;
					Mr.array[10] = Yc * Xc;
					return Matrix.multiply(Mr, m, result || new Matrix(4, 4));
				}
			}, {
				key: "rotateX",
				value: function rotateX(m, t, result) {
					var Mr = Matrix.Matrixes.rotateX;
					Mr.array[10] = Mr.array[5] = Math.cos(t);
					Mr.array[6] = -(Mr.array[9] = Math.sin(t));
					return Matrix.multiply(Mr, m, result || new Matrix(4, 4));
				}
			}, {
				key: "rotateY",
				value: function rotateY(m, t, result) {
					var Mr = Matrix.Matrixes.rotateY;
					Mr.array[10] = Mr.array[0] = Math.cos(t);
					Mr.array[8] = -(Mr.array[2] = Math.sin(t));
					return Matrix.multiply(Mr, m, result || new Matrix(4, 4));
				}
			}, {
				key: "rotateZ",
				value: function rotateZ(m, t, result) {
					var Mr = Matrix.Matrixes.rotateZ;
					Mr.array[5] = Mr.array[0] = Math.cos(t);
					Mr.array[1] = -(Mr.array[4] = Math.sin(t));
					return Matrix.multiply(Mr, m, result || new Matrix(4, 4));
				}
			}, {
				key: "scale3d",
				value: function scale3d(m, x, y, z, result) {
					var Mr = Matrix.Matrixes.scale3d;
					Mr.array[0] = x;
					Mr.array[5] = y;
					Mr.array[10] = z;
					return Matrix.multiply(Mr, m, result || new Matrix(4, 4));
				}
			}, {
				key: "translate3d",
				value: function translate3d(m, x, y, z, result) {
					var Mr = Matrix.Matrixes.translate3d;
					Mr.array[12] = x;
					Mr.array[13] = y;
					Mr.array[14] = z;
					return Matrix.multiply(Mr, m, result || new Matrix(4, 4));
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
							m.array[(l + row) * m.column + c + column] = sub.array[l * sub.column + c];
						}
					}
				}
			}, {
				key: "createClass",
				value: function createClass(Constructor) {
					return _createClass(Constructor);
				}
			}]);

			return Matrix;
		}();

		var testArray = new Constructor(1);
		Object.defineProperty(Matrix, '_instanceofTypedArray', { value: !!(TypedArray && TypedArray.isPrototypeOf(testArray)) });
		testArray = null;

		Matrix.Matrixes = { //do not modify these matrixes manually and dont use them
			I2: Matrix.Identity(2),
			I3: Matrix.Identity(3),
			I4: Matrix.Identity(4),
			T3: new Matrix(3, 3, 0),
			T4: new Matrix(4, 4, 0),
			rotate2d: Matrix.Identity(3),
			translate2d: Matrix.Identity(3),
			scale2d: Matrix.Identity(3),
			translate3d: Matrix.Identity(4),
			rotate3d: Matrix.Identity(4),
			rotateX: Matrix.Identity(4),
			rotateY: Matrix.Identity(4),
			rotateZ: Matrix.Identity(4),
			scale3d: Matrix.Identity(4)
		};
		return Matrix;
	}
	return _createClass(global.Float32Array ? Float32Array : Array);
});

},{}],5:[function(require,module,exports){
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

},{"_process":11}],6:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license

danmaku-frame text2d mod
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('../lib/setImmediate/setImmediate.js');

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

			var D = _this;
			D.list = []; //danmaku object array
			D.indexMark = 0; //to record the index of last danmaku in the list
			D.tunnel = new tunnelManager();
			D.renderingDanmakuManager = new renderingDanmakuManager(D);
			D.paused = true;
			D.randomText = 'danmaku_text_' + (Math.random() * 999999 | 0);
			D.defaultStyle = { //these styles can be overwrote by the 'font' property of danmaku object
				fontStyle: null,
				fontWeight: 300,
				fontVariant: null,
				color: "#fff",
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

			frame.addStyle('.' + D.randomText + '_fullfill{top:0;left:0;width:100%;height:100%;position:absolute;}');

			defProp(D, 'rendererMode', { configurable: true });
			defProp(D, 'activeRendererMode', { configurable: true, value: null });
			var con = D.container = document.createElement('div');
			con.classList.add(D.randomText + '_fullfill');
			frame.container.appendChild(con);

			//init modes
			D.text2d = new _text2d2.default(D);
			D.text3d = new _text3d2.default(D);
			D.textCanvas = new _textCanvas2.default(D);

			D.textCanvasContainer.hidden = D.canvas.hidden = D.canvas3d.hidden = true;
			D.modes = {
				1: D.textCanvas,
				2: D.text2d,
				3: D.text3d
			};
			D.GraphCache = []; //text graph cache
			D.DanmakuText = [];

			//opt time record
			D.cacheCleanTime = 0;
			D.danmakuMoveTime = 0;
			D.danmakuCheckTime = 0;
			D.rendererModeAutoShiftTime = 0;

			D.danmakuCheckSwitch = true;
			D.options = {
				allowLines: false, //allow multi-line danmaku
				screenLimit: 0, //the most number of danmaku on the screen
				clearWhenTimeReset: true, //clear danmaku on screen when the time is reset
				speed: 6.5,
				autoShiftRenderingMode: true };
			addEvents(document, {
				visibilitychange: function visibilitychange(e) {
					D.danmakuCheckSwitch = !document.hidden;
					if (!document.hidden) D.recheckIndexMark();
				}
			});
			D._checkNewDanmaku = D._checkNewDanmaku.bind(D);
			D._cleanCache = D._cleanCache.bind(D);
			setInterval(D._cleanCache, 5000); //set an interval for cache cleaning

			D.setRendererMode(1);
			return _this;
		}

		_createClass(TextDanmaku, [{
			key: 'setRendererMode',
			value: function setRendererMode(n) {
				var D = this;
				if (D.rendererMode === n || !(n in D.modes) || !D.modes[n].supported) return false;
				D.activeRendererMode && D.activeRendererMode.disable();
				defProp(D, 'activeRendererMode', { value: D.modes[n] });
				defProp(D, 'rendererMode', { value: n });
				D.activeRendererMode.resize();
				D.activeRendererMode.enable();
				console.log('rendererMode:', D.rendererMode);
				return true;
			}
		}, {
			key: 'media',
			value: function media(_media) {
				var D = this;
				addEvents(_media, {
					seeked: function seeked() {
						D.start();
						D.time();
						D._clearScreen();
					},
					seeking: function seeking() {
						return D.pause();
					},
					stalled: function stalled() {
						return D.pause();
					}
				});
			}
		}, {
			key: 'start',
			value: function start() {
				this.paused = false;
				this.recheckIndexMark();
				this.activeRendererMode.start();
			}
		}, {
			key: 'pause',
			value: function pause() {
				this.paused = true;
				this.activeRendererMode.pause();
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
				if (_typeof(d.style) !== 'object') d.style = {};
				d.style.fontSize = d.style.fontSize ? d.style.fontSize + 0.5 | 0 : this.defaultStyle.fontSize;
				if (isNaN(d.style.fontSize) || d.style.fontSize === Infinity || d.style.fontSize === 0) d.style.fontSize = this.defaultStyle.fontSize;
				if (typeof d.mode !== 'number') d.mode = 0;
				return d;
			}
		}, {
			key: 'loadList',
			value: function loadList(danmakuArray) {
				var _this2 = this;

				danmakuArray.forEach(function (d) {
					return _this2.load(d);
				});
			}
		}, {
			key: 'unload',
			value: function unload(d) {
				if (!d || d._ !== 'text') return false;
				var D = this,
				    i = D.list.indexOf(d);
				if (i < 0) return false;
				D.list.splice(i, 1);
				if (i < D.indexMark) D.indexMark--;
				return true;
			}
		}, {
			key: '_checkNewDanmaku',
			value: function _checkNewDanmaku() {
				var D = this,
				    d = void 0,
				    time = D.frame.time;
				if (D.danmakuCheckTime === time || !D.danmakuCheckSwitch) return;
				if (D.list.length) for (; D.indexMark < D.list.length && (d = D.list[D.indexMark]) && d.time <= time; D.indexMark++) {
					//add new danmaku
					if (D.options.screenLimit > 0 && D.DanmakuText.length >= D.options.screenLimit) {
						continue;
					} //continue if the number of danmaku on screen has up to limit or doc is not visible
					D._addNewDanmaku(d);
				}
				D.danmakuCheckTime = time;
			}
		}, {
			key: '_addNewDanmaku',
			value: function _addNewDanmaku(d) {
				var D = this,
				    cHeight = D.height,
				    cWidth = D.width;
				var t = D.GraphCache.length ? D.GraphCache.shift() : new TextGraph();
				t.danmaku = d;
				t.drawn = false;
				t.text = D.options.allowLines ? d.text : d.text.replace(/\n/g, ' ');
				t.time = d.time;
				t.font = Object.create(D.defaultStyle);
				Object.assign(t.font, d.style);
				if (!t.font.lineHeight) t.font.lineHeight = t.font.fontSize + 2 || 1;
				if (d.style.color) {
					if (t.font.color && t.font.color[0] !== '#') {
						t.font.color = '#' + d.style.color;
					}
				}

				if (d.mode > 1) t.font.textAlign = 'center';
				t.prepare(D.rendererMode === 3 ? false : true);
				//find tunnel number
				var tnum = D.tunnel.getTunnel(t, cHeight);
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
				D.renderingDanmakuManager.add(t);
				D.activeRendererMode.newDanmaku(t);
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
				var D = this,
				    T = D.frame.time;
				if (!force && D.paused) return;
				var cWidth = D.width;
				var R = void 0,
				    i = void 0,
				    t = void 0,
				    style = void 0,
				    X = void 0,
				    rate = D.frame.rate;
				D.danmakuMoveTime = T;
				for (i = D.DanmakuText.length; i--;) {
					t = D.DanmakuText[i];
					if (t.time > T) {
						D.removeText(t);
						continue;
					}
					style = t.style;

					switch (t.danmaku.mode) {
						case 0:case 1:
							{
								R = !t.danmaku.mode;
								style.x = X = D._calcSideDanmakuPosition(t, T, cWidth);
								if (t.tunnelNumber >= 0 && (R && X + style.width + 10 < cWidth || !R && X > 10)) {
									D.tunnel.removeMark(t);
								} else if (R && X < -style.width - 20 || !R && X > cWidth + style.width + 20) {
									//go out the canvas
									D.removeText(t);
									continue;
								}
								break;
							}
						case 2:case 3:
							{
								if (T - t.time > D.options.speed * 1000 / rate) {
									D.removeText(t);
								}
							}
					}
				}
			}
		}, {
			key: '_cleanCache',
			value: function _cleanCache(force) {
				//clean text object cache
				var D = this,
				    now = Date.now();
				if (D.GraphCache.length > 30 || force) {
					//save 20 cached danmaku
					for (var ti = 0; ti < D.GraphCache.length; ti++) {
						if (force || now - D.GraphCache[ti].removeTime > 10000) {
							//delete cache which has not used for 10s
							D.activeRendererMode.deleteTextObject(D.GraphCache[ti]);
							D.GraphCache.splice(ti, 1);
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
				this.activeRendererMode.draw(force);
				requestIdleCallback(this._checkNewDanmaku);
			}
		}, {
			key: 'removeText',
			value: function removeText(t) {
				//remove the danmaku from screen
				this.renderingDanmakuManager.remove(t);
				this.tunnel.removeMark(t);
				t._bitmap = t.danmaku = null;
				t.removeTime = Date.now();
				this.GraphCache.push(t);
				this.activeRendererMode.remove(t);
			}
		}, {
			key: 'resize',
			value: function resize() {
				if (this.activeRendererMode) this.activeRendererMode.resize();
				this.draw(true);
			}
		}, {
			key: '_clearScreen',
			value: function _clearScreen(forceFull) {
				this.activeRendererMode && this.activeRendererMode.clear(forceFull);
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
				this._clearScreen(true);
			}
		}, {
			key: 'recheckIndexMark',
			value: function recheckIndexMark() {
				var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.frame.time;

				this.indexMark = dichotomy(this.list, t, 0, this.list.length - 1, true);
			}
		}, {
			key: 'time',
			value: function time() {
				var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.frame.time;
				//reset time,you should invoke it when the media has seeked to another time
				this.recheckIndexMark(t);
				if (this.options.clearWhenTimeReset) {
					this.clear();
				} else {
					this.resetTimeOfDanmakuOnScreen();
				}
			}
		}, {
			key: 'resetTimeOfDanmakuOnScreen',
			value: function resetTimeOfDanmakuOnScreen(cTime) {
				var _this3 = this;

				//cause the position of the danmaku is based on time
				//and if you don't want these danmaku on the screen to disappear after seeking,their time should be reset
				if (cTime === undefined) cTime = this.frame.time;
				this.DanmakuText.forEach(function (t) {
					if (!t.danmaku) return;
					t.time = cTime - (_this3.danmakuMoveTime - t.time);
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
				if (this.frame.working) this.start();
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

			var G = this;
			G._fontString = '';
			G._renderList = null;
			G.style = {};
			G.font = {};
			G.text = text;
			G._renderToCache = G._renderToCache.bind(G);
			defProp(G, '_cache', { configurable: true });
		}

		_createClass(TextGraph, [{
			key: 'prepare',
			value: function prepare() {
				var async = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
				//prepare text details
				var G = this;
				if (!G._cache) {
					defProp(G, '_cache', { value: document.createElement("canvas") });
				}
				var ta = [];
				G.font.fontStyle && ta.push(G.font.fontStyle);
				G.font.fontVariant && ta.push(G.font.fontVariant);
				G.font.fontWeight && ta.push(G.font.fontWeight);
				ta.push(G.font.fontSize + 'px');
				G.font.fontFamily && ta.push(G.font.fontFamily);
				G._fontString = ta.join(' ');

				var imgobj = G._cache,
				    ct = imgobj.ctx2d || (imgobj.ctx2d = imgobj.getContext("2d"));
				ct.font = G._fontString;
				G._renderList = G.text.split(/\n/g);
				G.estimatePadding = Math.max(G.font.shadowBlur + 5 + Math.max(Math.abs(G.font.shadowOffsetY), Math.abs(G.font.shadowOffsetX)), G.font.strokeWidth + 3);
				var w = 0,
				    tw = void 0,
				    lh = typeof G.font.lineHeight === 'number' ? G.font.lineHeight : G.font.fontSize;
				for (var i = G._renderList.length; i--;) {
					tw = ct.measureText(G._renderList[i]).width;
					tw > w && (w = tw); //max
				}
				imgobj.width = (G.style.width = w) + G.estimatePadding * 2;
				imgobj.height = (G.style.height = G._renderList.length * lh) + (lh < G.font.fontSize ? G.font.fontSize * 2 : 0) + G.estimatePadding * 2;

				ct.translate(G.estimatePadding, G.estimatePadding);
				if (async) {
					requestIdleCallback(G._renderToCache);
				} else {
					G._renderToCache();
				}
			}
		}, {
			key: '_renderToCache',
			value: function _renderToCache() {
				var G = this;
				if (!G.danmaku) return;
				G.render(G._cache.ctx2d);
				if (useImageBitmap) {
					//use ImageBitmap
					if (G._bitmap) {
						G._bitmap.close();
						G._bitmap = null;
					}
					createImageBitmap(G._cache).then(function (bitmap) {
						G._bitmap = bitmap;
					});
				}
			}
		}, {
			key: 'render',
			value: function render(ct) {
				//render text
				var G = this;
				if (!G._renderList) return;
				ct.save();
				if (G.danmaku.highlight) {
					ct.fillStyle = 'rgba(255,255,255,0.3)';
					ct.beginPath();
					ct.rect(0, 0, G.style.width, G.style.height);
					ct.fill();
				}
				ct.font = G._fontString; //set font
				ct.textBaseline = 'middle';
				ct.lineWidth = G.font.strokeWidth;
				ct.fillStyle = G.font.color;
				ct.strokeStyle = G.font.strokeColor;
				ct.shadowBlur = G.font.shadowBlur;
				ct.shadowColor = G.font.shadowColor;
				ct.shadowOffsetX = G.font.shadowOffsetX;
				ct.shadowOffsetY = G.font.shadowOffsetY;
				ct.textAlign = G.font.textAlign;
				var lh = typeof G.font.lineHeight === 'number' ? G.font.lineHeight : G.font.fontSize,
				    x = void 0;
				switch (G.font.textAlign) {
					case 'left':case 'start':
						{
							x = 0;break;
						}
					case 'center':
						{
							x = G.style.width / 2;break;
						}
					case 'right':case 'end':
						{
							x = G.style.width;
						}
				}
				for (var i = G._renderList.length; i--;) {
					G.font.strokeWidth && ct.strokeText(G._renderList[i], x, lh * (i + 0.5));
					G.font.fill && ct.fillText(G._renderList[i], x, lh * (i + 0.5));
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

	var renderingDanmakuManager = function () {
		function renderingDanmakuManager(dText) {
			_classCallCheck(this, renderingDanmakuManager);

			this.dText = dText;
		}

		_createClass(renderingDanmakuManager, [{
			key: 'add',
			value: function add(t) {
				this.dText.DanmakuText.push(t);
				this.rendererModeCheck();
			}
		}, {
			key: 'remove',
			value: function remove(t) {
				var ind = this.dText.DanmakuText.indexOf(t);
				if (ind >= 0) this.dText.DanmakuText.splice(ind, 1);
				this.rendererModeCheck();
			}
		}, {
			key: 'rendererModeCheck',
			value: function rendererModeCheck() {
				var D = this.dText;
				if (!this.dText.options.autoShiftRenderingMode || D.paused || Date.now() - D.rendererModeAutoShiftTime < 1000) return;
				if (D.rendererMode == 1 && (D.DanmakuText.length > 40 || D.frame.fpsRec < (D.frame.fps || 60) * 0.93)) {
					D.text2d.supported && D.setRendererMode(2);
				} else if (D.rendererMode == 2 && D.DanmakuText.length < 17) {
					D.textCanvas.supported && D.setRendererMode(1);
				}
				D.rendererModeAutoShiftTime = Date.now();
			}
		}]);

		return renderingDanmakuManager;
	}();

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

},{"../lib/setImmediate/setImmediate.js":5,"./text2d.js":7,"./text3d.js":8,"./textCanvas.js":9}],7:[function(require,module,exports){
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
		dText.context2d = dText.canvas.getContext('2d'); //the canvas contex
		if (!dText.context2d) {
			console.warn('text 2d not supported');
			return _possibleConstructorReturn(_this);
		}
		dText.canvas.classList.add(dText.randomText + '_fullfill');
		dText.canvas.id = dText.randomText + '_text2d';
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
					//danmaku that smaller than canvas width
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
			var D = this.dText;
			if (force || this._evaluateIfFullClearMode()) {
				D.context2d.clearRect(0, 0, D.canvas.width, D.canvas.height);
				return;
			}
			for (var i = D.DanmakuText.length, t; i--;) {
				t = D.DanmakuText[i];
				if (t.drawn) D.context2d.clearRect(t.style.x - t.estimatePadding, t.style.y - t.estimatePadding, t._cache.width, t._cache.height);
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
			var D = this.dText,
			    C = D.canvas;
			C.width = D.width;
			C.height = D.height;
		}
	}, {
		key: 'enable',
		value: function enable() {
			this.draw();
			this.dText.useImageBitmap = !(this.dText.canvas.hidden = false);
		}
	}, {
		key: 'disable',
		value: function disable() {
			this.dText.canvas.hidden = true;
			this.clear(true);
		}
	}]);

	return Text2d;
}(_textModuleTemplate2.default);

exports.default = Text2d;

},{"./textModuleTemplate.js":10}],8:[function(require,module,exports){
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
		var c3d = _this.c3d = dText.canvas3d = document.createElement('canvas');
		c3d.classList.add(dText.randomText + '_fullfill');
		c3d.id = dText.randomText + '_text3d';
		dText.context3d = c3d.getContext('webgl') || c3d.getContext('experimental-webgl'); //the canvas3d context

		if (!dText.context3d) {
			console.warn('text 3d not supported');
			return _possibleConstructorReturn(_this);
		}
		dText.container.appendChild(c3d);
		var gl = _this.gl = dText.context3d,
		    canvas = c3d;
		//init webgl

		//shader
		var shaders = {
			danmakuFrag: [gl.FRAGMENT_SHADER, '\n\t\t\t\tvarying lowp vec2 vDanmakuTexCoord;\n\t\t\t\tuniform sampler2D uSampler;\n\t\t\t\tvoid main(void) {\n\t\t\t\t\tgl_FragColor = texture2D(uSampler,vDanmakuTexCoord);\n\t\t\t\t}'],
			danmakuVert: [gl.VERTEX_SHADER, '\n\t\t\t\tattribute vec2 aVertexPosition;\n\t\t\t\tattribute vec2 aDanmakuTexCoord;\n\t\t\t\tuniform mat4 u2dCoordinate;\n\t\t\t\tuniform vec2 uDanmakuPos;\n\t\t\t\tvarying lowp vec2 vDanmakuTexCoord;\n\t\t\t\tvoid main(void) {\n\t\t\t\t\tgl_Position = u2dCoordinate * vec4(aVertexPosition+uDanmakuPos,0,1);\n\t\t\t\t\tvDanmakuTexCoord = aDanmakuTexCoord;\n\t\t\t\t}']
		};
		function shader(name) {
			var s = gl.createShader(shaders[name][0]);
			gl.shaderSource(s, shaders[name][1]);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw "An error occurred compiling the shaders: " + gl.getShaderInfoLog(s);
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
			return _possibleConstructorReturn(_this);
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

		_this.supported = true;
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
			    C = this.c3d;
			C.width = this.dText.width;
			C.height = this.dText.height;
			gl.viewport(0, 0, C.width, C.height);
			gl.uniformMatrix4fv(this.u2dCoord, false, new _Mat2.default.Identity(4).translate3d(-1, 1, 0).scale3d(2 / C.width, -2 / C.height, 0).array);
		}
	}, {
		key: 'enable',
		value: function enable() {
			var _this2 = this;

			this.dText.DanmakuText.forEach(function (t) {
				_this2.newDanmaku(t, false);
			});
			this.dText.useImageBitmap = this.c3d.hidden = false;
			requestAnimationFrame(function () {
				return _this2.draw();
			});
		}
	}, {
		key: 'disable',
		value: function disable() {
			this.clear();
			this.c3d.hidden = true;
		}
	}, {
		key: 'newDanmaku',
		value: function newDanmaku(t) {
			var async = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

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
			if (async) {
				requestIdleCallback(function () {
					gl.bindTexture(gl.TEXTURE_2D, tex);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t._cache);
					t.glDanmaku = true;
				});
			} else {
				gl.bindTexture(gl.TEXTURE_2D, tex);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t._cache);
				t.glDanmaku = true;
			}

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

},{"../lib/Mat/Mat.js":4,"./textModuleTemplate.js":10}],9:[function(require,module,exports){
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
		dText.frame.addStyle(['#' + dText.randomText + '_textCanvasContainer canvas{will-change:transform;top:0;left:0;position:absolute;}', '#' + dText.randomText + '_textCanvasContainer.moving canvas{transition:transform 500s linear;}', '#' + dText.randomText + '_textCanvasContainer{will-change:transform;pointer-events:none;overflow:hidden;}']);

		_this.container = dText.textCanvasContainer = document.createElement('div'); //for text canvas
		_this.container.classList.add(dText.randomText + '_fullfill');
		_this.container.id = dText.randomText + '_textCanvasContainer';
		dText.container.appendChild(_this.container);
		return _this;
	}

	_createClass(TextCanvas, [{
		key: '_toggle',
		value: function _toggle(s) {
			var _this2 = this;

			var D = this.dText,
			    T = D.frame.time;
			this.container.classList[s ? 'add' : 'remove']('moving');

			var _loop = function _loop(i, _t) {
				if ((_t = D.DanmakuText[i]).danmaku.mode >= 2) return 'continue';
				if (s) {
					requestAnimationFrame(function (a) {
						return _this2._move(_t, T + 500000);
					});
				} else {
					_this2._move(_t, T);
				}
				t = _t;
			};

			for (var i = D.DanmakuText.length, t; i--;) {
				var _ret = _loop(i, t);

				if (_ret === 'continue') continue;
			}
		}
	}, {
		key: 'pause',
		value: function pause() {
			this._toggle(false);
		}
	}, {
		key: 'start',
		value: function start() {
			this._toggle(true);
		}
	}, {
		key: '_move',
		value: function _move(t, T) {
			if (!t.danmaku) return;
			if (T === undefined) T = this.dText.frame.time + 500000;
			t._cache.style.transform = 'translate3d(' + ((this.dText._calcSideDanmakuPosition(t, T, this.dText.width) - t.estimatePadding) * 10 | 0) / 10 + 'px,' + (t.style.y - t.estimatePadding) + 'px,0)';
		}
	}, {
		key: 'resetPos',
		value: function resetPos() {
			var _this3 = this;

			this.pause();
			this.dText.paused || setImmediate(function () {
				return _this3.start();
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
			t._cache.parentNode && this.container.removeChild(t._cache);
		}
	}, {
		key: 'enable',
		value: function enable() {
			var _this4 = this;

			this.dText.DanmakuText.forEach(function (t) {
				_this4.newDanmaku(t);
			});
			this.container.hidden = false;
		}
	}, {
		key: 'disable',
		value: function disable() {
			this.container.hidden = true;
			this.container.innerHTML = '';
		}
	}, {
		key: 'newDanmaku',
		value: function newDanmaku(t) {
			var _this5 = this;

			t._cache.style.transform = 'translate3d(' + (t.style.x - t.estimatePadding) + 'px,' + (t.style.y - t.estimatePadding) + 'px,0)';
			this.container.appendChild(t._cache);
			if (t.danmaku.mode < 2 && !this.dText.paused) requestAnimationFrame(function () {
				return _this5._move(t);
			});
		}
	}]);

	return TextCanvas;
}(_textModuleTemplate2.default);

exports.default = TextCanvas;

},{"./textModuleTemplate.js":10}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _i18n = require('./i18n.js');

var _Object2HTML = require('../lib/Object2HTML/Object2HTML.js');

var _Object2HTML2 = _interopRequireDefault(_Object2HTML);

var _NyaPCore = require('./NyaPCore.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = _i18n.i18n._;

var colorChars = '0123456789abcdef';

//NyaP options
var NyaPOptions = {
	autoHideDanmakuInput: true, //hide danmakuinput after danmaku sending
	danmakuColors: ['fff', '6cf', 'ff0', 'f00', '0f0', '00f', 'f0f', '000'], //colors in the danmaku style pannel
	danmakuModes: [0, 3, 2, 1], //0:right	1:left	2:bottom	3:top
	defaultDanmakuColor: null, //a hex color(without #),when the color inputed is invalid,this color will be applied
	defaultDanmakuMode: 0, //right
	danmakuSend: function danmakuSend(d, callback) {
		callback(false);
	}, //the func for sending danmaku
	danmakuSizes: [20, 24, 36],
	defaultDanmakuSize: 24
};

//normal player

var NyaP = function (_NyaPlayerCore) {
	_inherits(NyaP, _NyaPlayerCore);

	function NyaP(opt) {
		_classCallCheck(this, NyaP);

		var _this = _possibleConstructorReturn(this, (NyaP.__proto__ || Object.getPrototypeOf(NyaP)).call(this, Object.assign({}, NyaPOptions, opt)));

		opt = _this.opt;
		var NP = _this,
		    $ = _this.$,
		    video = _this.video;
		_this._.playerMode = 'normal';
		video.controls = false;
		var icons = {
			play: [30, 30, '<path d="m10.063,8.856l9.873,6.143l-9.873,6.143v-12.287z" stroke-width="3" stroke-linejoin="round"/>'],
			addDanmaku: [30, 30, '<path style="fill-opacity:0!important;" stroke-width="1.4" d="m21.004,8.995c-0.513,-0.513 -1.135,-0.770 -1.864,-0.770l-8.281,0c-0.729,0 -1.350,0.256 -1.864,0.770c-0.513,0.513 -0.770,1.135 -0.770,1.864l0,8.281c0,0.721 0.256,1.341 0.770,1.858c0.513,0.517 1.135,0.776 1.864,0.776l8.281,0c0.729,0 1.350,-0.258 1.864,-0.776c0.513,-0.517 0.770,-1.136 0.770,-1.858l0,-8.281c0,-0.729 -0.257,-1.350 -0.770,-1.864z" stroke-linejoin="round"/>' + '<path d="m12.142,14.031l1.888,0l0,-1.888l1.937,0l0,1.888l1.888,0l0,1.937l-1.888,0l0,1.888l-1.937,0l0,-1.888l-1.888,0l0,-1.937z" stroke-width="1"/>'],
			danmakuToggle: [30, 30, '<path d="m8.569,10.455l0,0c0,-0.767 0.659,-1.389 1.473,-1.389l0.669,0l0,0l3.215,0l6.028,0c0.390,0 0.765,0.146 1.041,0.406c0.276,0.260 0.431,0.613 0.431,0.982l0,3.473l0,0l0,2.083l0,0c0,0.767 -0.659,1.389 -1.473,1.389l-6.028,0l-4.200,3.532l0.985,-3.532l-0.669,0c-0.813,0 -1.473,-0.621 -1.473,-1.389l0,0l0,-2.083l0,0l0,-3.473z"/>'],
			danmakuStyle: [30, 30, '<path style="fill-opacity:1!important" d="m21.781,9.872l-1.500,-1.530c-0.378,-0.385 -0.997,-0.391 -1.384,-0.012l-0.959,0.941l2.870,2.926l0.960,-0.940c0.385,-0.379 0.392,-0.998 0.013,-1.383zm-12.134,7.532l2.871,2.926l7.593,-7.448l-2.872,-2.927l-7.591,7.449l0.000,0.000zm-1.158,2.571l-0.549,1.974l1.984,-0.511l1.843,-0.474l-2.769,-2.824l-0.509,1.835z" stroke-width="0"/>'],
			fullPage: [30, 30, '<path stroke-linejoin="round" d="m11.166,9.761l-5.237,5.239l5.237,5.238l1.905,-1.905l-3.333,-3.333l3.332,-3.333l-1.904,-1.906zm7.665,0l-1.903,1.905l3.332,3.333l-3.332,3.332l1.903,1.905l5.238,-5.238l-5.238,-5.237z" stroke-width="1.3" />'],
			fullScreen: [30, 30, '<rect stroke-linejoin="round" height="11.169" width="17.655" y="9.415" x="6.172" stroke-width="1.5"/>' + '<path stroke-linejoin="round" d="m12.361,11.394l-3.604,3.605l3.605,3.605l1.311,-1.311l-2.294,-2.294l2.293,-2.294l-1.311,-1.311zm5.275,0l-1.310,1.311l2.293,2.294l-2.293,2.293l1.310,1.311l3.605,-3.605l-3.605,-3.605z"/>'],
			loop: [30, 30, '<path stroke-linejoin="round" stroke-width="1" d="m20.945,15.282c-0.204,-0.245 -0.504,-0.387 -0.823,-0.387c-0.583,0 -1.079,0.398 -1.205,0.969c-0.400,1.799 -2.027,3.106 -3.870,3.106c-2.188,0 -3.969,-1.780 -3.969,-3.969c0,-2.189 1.781,-3.969 3.969,-3.969c0.720,0 1.412,0.192 2.024,0.561l-0.334,0.338c-0.098,0.100 -0.127,0.250 -0.073,0.380c0.055,0.130 0.183,0.213 0.324,0.212l2.176,0.001c0.255,-0.002 0.467,-0.231 0.466,-0.482l-0.008,-2.183c-0.000,-0.144 -0.085,-0.272 -0.217,-0.325c-0.131,-0.052 -0.280,-0.022 -0.379,0.077l-0.329,0.334c-1.058,-0.765 -2.340,-1.182 -3.649,-1.182c-3.438,0 -6.236,2.797 -6.236,6.236c0,3.438 2.797,6.236 6.236,6.236c2.993,0 5.569,-2.133 6.126,-5.072c0.059,-0.314 -0.022,-0.635 -0.227,-0.882z"/>'],
			volume: [30, 30, '<ellipse id="volume_circle" style="fill-opacity:.6!important" ry="6" rx="6" cy="15" cx="15" stroke-dasharray="38 90" stroke-width="1.8"/>'],
			danmakuMode0: [30, 30, '<path style="fill-opacity:1!important" stroke-width="0" d="m14.981,17.821l-7.937,-2.821l7.937,-2.821l0,1.409l7.975,0l0,2.821l-7.975,0l0,1.409l0,0.002z"/>'],
			danmakuMode1: [30, 30, '<path style="fill-opacity:1!important" stroke-width="0" d="m15.019,12.178l7.937,2.821l-7.937,2.821l0,-1.409l-7.975,0l0,-2.821l7.975,0l0,-1.409l0,-0.002z"/>'],
			danmakuMode3: [30, 30, '<path stroke-width="3" d="m7.972,7.486l14.054,0"/>'],
			danmakuMode2: [30, 30, '<path stroke-width="3" d="m7.972,22.513l14.054,0"/>'],
			settings: [30, 30, '<path stroke="null" style="fill-opacity:1!important" d="m19.770,13.364l-0.223,-0.530c0.766,-1.732 0.715,-1.784 0.566,-1.934l-0.979,-0.956l-0.097,-0.081l-0.113,0c-0.059,0 -0.238,0 -1.727,0.675l-0.547,-0.220c-0.708,-1.755 -0.780,-1.755 -0.988,-1.755l-1.381,0c-0.207,0 -0.287,-0.000 -0.944,1.761l-0.545,0.221c-1.006,-0.424 -1.596,-0.639 -1.755,-0.639l-0.130,0.004l-1.053,1.032c-0.159,0.150 -0.215,0.203 0.594,1.909l-0.223,0.528c-1.793,0.693 -1.793,0.760 -1.793,0.972l0,1.354c0,0.212 0,0.287 1.799,0.932l0.223,0.528c-0.766,1.731 -0.714,1.783 -0.566,1.932l0.979,0.958l0.097,0.083l0.114,0c0.058,0 0.235,0 1.726,-0.676l0.547,0.222c0.708,1.755 0.780,1.754 0.988,1.754l1.381,0c0.211,0 0.286,0 0.945,-1.760l0.548,-0.221c1.004,0.424 1.593,0.640 1.751,0.640l0.131,-0.003l1.061,-1.039c0.151,-0.152 0.204,-0.204 -0.602,-1.903l0.221,-0.529c1.795,-0.694 1.795,-0.766 1.795,-0.974l0,-1.353c-0.000,-0.213 -0.000,-0.287 -1.801,-0.929zm-4.770,3.888c-1.266,0 -2.298,-1.011 -2.298,-2.254c0,-1.241 1.031,-2.252 2.298,-2.252c1.266,0 2.295,1.010 2.295,2.252c-0.000,1.242 -1.029,2.254 -2.295,2.254z"/>']
		};
		function icon(name, event) {
			var attr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			var ico = icons[name];
			return (0, _Object2HTML2.default)({ _: 'span', event: event, attr: attr, prop: { id: 'icon_span_' + name,
					innerHTML: '<svg height=' + ico[1] + ' width=' + ico[0] + ' id="icon_' + name + '"">' + ico[2] + '</svg>' } });
		}

		_this.loadingInfo(_('Creating player'));

		_this._.player = (0, _Object2HTML2.default)({
			_: 'div', attr: { 'class': 'NyaP', id: 'NyaP', tabindex: 0 }, child: [_this.videoFrame, { _: 'div', attr: { id: 'controls' }, child: [{ _: 'div', attr: { id: 'control' }, child: [{ _: 'span', attr: { id: 'control_left' }, child: [icon('play', { click: function click(e) {
								return _this.playToggle();
							} }, { title: _('play') })] }, { _: 'span', attr: { id: 'control_center' }, child: [{ _: 'div', prop: { id: 'progress_info' }, child: [{ _: 'span', child: [{ _: 'canvas', prop: { id: 'progress', pad: 10 } }] }, { _: 'span', prop: { id: 'time_frame' }, child: [{ _: 'span', prop: { id: 'time' }, child: [{ _: 'span', prop: { id: 'current_time' }, child: ['00:00'] }, '/', { _: 'span', prop: { id: 'total_time' }, child: ['00:00'] }] }] }] }, { _: 'div', prop: { id: 'danmaku_input_frame' }, child: [{ _: 'span', prop: { id: 'danmaku_style' }, child: [{ _: 'div', attr: { id: 'danmaku_style_pannel' }, child: [{ _: 'div', attr: { id: 'danmaku_color_box' } }, { _: 'input', attr: { id: 'danmaku_color', placeholder: _('hex color'), maxlength: "6" } }, { _: 'span', attr: { id: 'danmaku_mode_box' } }, { _: 'span', attr: { id: 'danmaku_size_box' } }] }, icon('danmakuStyle')] }, { _: 'input', attr: { id: 'danmaku_input', placeholder: _('Input danmaku here') } }, { _: 'span', prop: { id: 'danmaku_submit', innerHTML: _('Send') } }] }] }, { _: 'span', attr: { id: 'control_right' }, child: [icon('addDanmaku', { click: function click(e) {
								return _this.danmakuInput();
							} }, { title: _('danmaku input(Enter)') }), icon('danmakuToggle', { click: function click(e) {
								return _this.danmakuToggle();
							} }, { title: _('danmaku toggle(D)') }), icon('volume', {}, { title: _('volume($0)([shift]+↑↓)', '100%') }), icon('loop', { click: function click(e) {
								video.loop = !video.loop;
							} }, { title: _('loop(L)') }), { _: 'span', prop: { id: 'player_mode' }, child: [icon('fullPage', { click: function click(e) {
									return _this.playerMode('fullPage');
								} }, { title: _('full page(P)') }), icon('fullScreen', { click: function click(e) {
									return _this.playerMode('fullScreen');
								} }, { title: _('full screen(F)') })] }] }] }] }]
		});

		//msg box
		_this.videoFrame.appendChild((0, _Object2HTML2.default)({
			_: 'div',
			attr: { id: 'msg_box' }
		}));

		//add elements with id to $ prop
		_this.collectEles(_this._.player);

		//danmaku sizes
		opt.danmakuSizes && opt.danmakuSizes.forEach(function (s, ind) {
			var e = (0, _Object2HTML2.default)({ _: 'span', attr: { style: 'font-size:' + (12 + ind * 3) + 'px;', title: s }, prop: { size: s }, child: ['A'] });
			$.danmaku_size_box.appendChild(e);
		});

		//danmaku colors
		opt.danmakuColors && opt.danmakuColors.forEach(function (c) {
			var e = (0, _Object2HTML2.default)({ _: 'span', attr: { style: 'background-color:#' + c + ';', title: c }, prop: { color: c } });
			$.danmaku_color_box.appendChild(e);
		});

		//danmaku modes
		opt.danmakuModes && opt.danmakuModes.forEach(function (m) {
			$.danmaku_mode_box.appendChild(icon('danmakuMode' + m));
		});
		_this.collectEles($.danmaku_mode_box);

		//progress
		setTimeout(function () {
			//ResizeSensor
			$.control.ResizeSensor = new _NyaPCore.ResizeSensor($.control, function () {
				return _this.refreshProgress();
			});
			_this.refreshProgress();
		}, 0);
		_this._.progressContext = $.progress.getContext('2d');

		//events
		var events = {
			NyaP: {
				keydown: function keydown(e) {
					return _this._playerKeyHandle(e);
				}
			},
			document: {
				'fullscreenchange,mozfullscreenchange,webkitfullscreenchange,msfullscreenchange': function fullscreenchangeMozfullscreenchangeWebkitfullscreenchangeMsfullscreenchange(e) {
					if (_this._.playerMode == 'fullScreen' && !(0, _NyaPCore.isFullscreen)()) _this.playerMode('normal');
				}
			},
			main_video: {
				playing: function playing(e) {
					return _this._iconActive('play', true);
				},
				'pause,stalled': function pauseStalled(e) {
					_this._iconActive('play', false);
				},
				timeupdate: function timeupdate(e) {
					if (Date.now() - _this._.lastTimeUpdate < 30) return;
					_this._setTimeInfo((0, _NyaPCore.formatTime)(video.currentTime, video.duration));
					_this.drawProgress();
					_this._.lastTimeUpdate = Date.now();
				},
				loadedmetadata: function loadedmetadata(e) {
					_this._setTimeInfo(null, (0, _NyaPCore.formatTime)(video.duration, video.duration));
				},
				volumechange: function volumechange(e) {
					(0, _NyaPCore.setAttrs)($.volume_circle, { 'stroke-dasharray': video.volume * 12 * Math.PI + ' 90', style: 'fill-opacity:' + (video.muted ? .2 : .6) + '!important' });
					$.icon_span_volume.setAttribute('title', _('volume($0)([shift]+↑↓)', video.muted ? _('muted') : (video.volume * 100 | 0) + '%'));
				},
				progress: function progress(e) {
					return _this.drawProgress();
				},
				_loopChange: function _loopChange(e) {
					return _this._iconActive('loop', e.value);
				},
				click: function click(e) {
					return _this.playToggle();
				},
				contextmenu: function contextmenu(e) {
					return e.preventDefault();
				}
			},
			danmaku_container: {
				click: function click(e) {
					return _this.playToggle();
				},
				contextmenu: function contextmenu(e) {
					return e.preventDefault();
				}
			},
			progress: {
				'mousemove,click': function mousemoveClick(e) {
					var t = e.target,
					    pre = (0, _NyaPCore.limitIn)((e.offsetX - t.pad) / (t.offsetWidth - 2 * t.pad), 0, 1);
					if (e.type === 'mousemove') {
						_this._.progressX = e.offsetX;_this.drawProgress();
						_this._setTimeInfo(null, (0, _NyaPCore.formatTime)(pre * video.duration, video.duration));
					} else if (e.type === 'click') {
						video.currentTime = pre * video.duration;
					}
				},
				mouseout: function mouseout(e) {
					_this._.progressX = undefined;_this.drawProgress();
					_this._setTimeInfo(null, (0, _NyaPCore.formatTime)(video.duration, video.duration));
				}
			},
			danmaku_style_pannel: {
				click: function click(e) {
					return setImmediate(function (a) {
						return _this.$.danmaku_input.focus();
					});
				}
			},
			danmaku_color: {
				'input,change': function inputChange(e) {
					var i = e.target,
					    c = void 0;
					if (c = i.value.match(/^([\da-f\$]{3}){1,2}$/i)) {
						//match valid hex color code
						c = c[0];
						i.style.backgroundColor = '#' + c;
						_this._.danmakuColor = c;
					} else {
						_this._.danmakuColor = undefined;
						i.style.backgroundColor = '';
					}
				}
			},
			icon_span_volume: {
				click: function click(e) {
					return video.muted = !video.muted;
				},
				wheel: function wheel(e) {
					e.preventDefault();
					if (e.deltaMode !== 0) return;
					var delta = void 0;
					if (e.shiftKey) {
						delta = e.deltaY > 0 ? 10 : -10;
					} else if (e.deltaY > 10 || e.deltaY < -10) delta = e.deltaY / 10;else {
						delta = e.deltaY;
					}
					video.volume = (0, _NyaPCore.limitIn)(video.volume + delta / 100, 0, 1);
				}
			},
			danmakuModeSwitch: {
				click: function click() {
					var m = 1 * this.id.match(/\d$/)[0];
					if (NP._.danmakuMode !== undefined) $['icon_span_danmakuMode' + NP._.danmakuMode].classList.remove('active');
					$['icon_span_danmakuMode' + m].classList.add('active');
					NP._.danmakuMode = m;
				}
			},
			danmaku_input: {
				keydown: function keydown(e) {
					if (e.key === 'Enter') {
						_this.send();
					} else if (e.key === 'Escape') {
						_this.danmakuInput(false);
					}
				}
			},
			danmaku_submit: {
				click: function click(e) {
					return _this.send();
				}
			},
			danmaku_size_box: {
				click: function click(e) {
					var t = e.target;
					if (!t.size) return;
					(0, _NyaPCore.toArray)($.danmaku_size_box.childNodes).forEach(function (sp) {
						if (_this._.danmakuSize === sp.size) sp.classList.remove('active');
					});
					t.classList.add('active');
					_this._.danmakuSize = t.size;
				}
			},
			danmaku_color_box: {
				click: function click(e) {
					if (e.target.color) {
						$.danmaku_color.value = e.target.color;
						$.danmaku_color.dispatchEvent(new Event('change'));
					}
				}
			}
		};
		for (var eleid in $) {
			//add events to elements
			var eves = events[eleid];
			if (eleid.startsWith('icon_span_danmakuMode')) eves = events.danmakuModeSwitch;
			eves && (0, _NyaPCore.addEvents)($[eleid], eves);
		}

		Number.isInteger(opt.defaultDanmakuMode) && $['icon_span_danmakuMode' + opt.defaultDanmakuMode].click(); //init to default danmaku mode
		typeof opt.defaultDanmakuSize === 'number' && (0, _NyaPCore.toArray)($.danmaku_size_box.childNodes).forEach(function (sp) {
			if (sp.size === opt.defaultDanmakuSize) sp.click();
		});

		//listen danmakuToggle event to change button style
		_this.on('danmakuToggle', function (bool) {
			return _this._iconActive('danmakuToggle', bool);
		});
		if (_this.danmakuFrame.modules.TextDanmaku.enabled) _this._iconActive('danmakuToggle', true);
		return _this;
	}

	_createClass(NyaP, [{
		key: '_iconActive',
		value: function _iconActive(name, bool) {
			this.$['icon_span_' + name].classList[bool ? 'add' : 'remove']('active_icon');
		}
	}, {
		key: '_setTimeInfo',
		value: function _setTimeInfo() {
			var _this2 = this;

			var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
			var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			requestAnimationFrame(function () {
				if (a !== null) {
					_this2.$.current_time.innerHTML = a;
				}
				if (b !== null) {
					_this2.$.total_time.innerHTML = b;
				}
			});
		}
	}, {
		key: '_playerKeyHandle',
		value: function _playerKeyHandle(e) {
			//hot keys
			if (e.target.tagName === 'INPUT') return;
			var V = this.video,
			    _SH = e.shiftKey,
			    _RE = e.repeat;
			//to prevent default,use break.otherwise,use return.
			switch (e.key) {
				case ' ':
					{
						if (_RE) return;
						this.playToggle();break;
					}
				case 'ArrowRight':
					{
						//seek to after time
						V.currentTime += 3 * (_SH ? 2 : 1);break;
					}
				case 'ArrowLeft':
					{
						//seek to before time
						V.currentTime -= 1.5 * (_SH ? 2 : 1);break;
					}
				case 'ArrowUp':
					{
						//volume up
						V.volume = (0, _NyaPCore.limitIn)(V.volume + 0.03 * (_SH ? 2 : 1), 0, 1);break;
					}
				case 'ArrowDown':
					{
						//volume down
						V.volume = (0, _NyaPCore.limitIn)(V.volume - 0.03 * (_SH ? 2 : 1), 0, 1);break;
					}
				case 'p':
					{
						//full page
						if (_RE) return;
						this.playerMode('fullPage');break;
					}
				case 'f':
					{
						//fullscreen
						this.playerMode('fullScreen');break;
					}
				case 'd':
					{
						//danmaku toggle
						if (_RE) return;
						this.danmakuToggle();break;
					}
				case 'm':
					{
						//mute
						if (_RE) return;
						this.video.muted = !this.video.muted;break;
					}
				case 'l':
					{
						//loop
						this.video.loop = !this.video.loop;break;
					}
				case 'Enter':
					{
						//danmaku input toggle
						if (_RE) return;
						this.danmakuInput();break;
					}
				case 'Escape':
					{
						//exit full page mode
						if (this._.playerMode === 'fullPage') {
							this.playerMode('normal');break;
						}
						return;
					}
				default:
					return;
			}
			e.preventDefault();
		}
	}, {
		key: 'danmakuInput',
		value: function danmakuInput() {
			var bool = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.$.danmaku_input_frame.offsetHeight;

			var $ = this.$;
			$.danmaku_input_frame.style.display = bool ? 'flex' : '';
			this._iconActive('addDanmaku', bool);
			setImmediate(function () {
				bool ? $.danmaku_input.focus() : $.NyaP.focus();
			});
		}
	}, {
		key: 'playerMode',
		value: function playerMode() {
			var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'normal';

			if (mode === 'normal' && this._.playerMode === mode) return;
			var $ = this.$;
			if (this._.playerMode === 'fullPage') {
				this.player.style.position = '';
				this._iconActive('fullPage', false);
			} else if (this._.playerMode === 'fullScreen') {
				this._iconActive('fullScreen', false);
				(0, _NyaPCore.exitFullscreen)();
			}
			if (mode !== 'normal' && this._.playerMode === mode) mode = 'normal'; //back to normal mode
			switch (mode) {
				case 'fullPage':
					{
						this.player.style.position = 'fixed';
						this._iconActive('fullPage', true);
						this.player.setAttribute('playerMode', 'fullPage');
						break;
					}
				case 'fullScreen':
					{
						this._iconActive('fullScreen', true);
						this.player.setAttribute('playerMode', 'fullScreen');
						(0, _NyaPCore.requestFullscreen)(this.player);
						break;
					}
				default:
					{
						this.player.setAttribute('playerMode', 'normal');
					}
			}
			this._.playerMode = mode;
			this.emit('playerModeChange', mode);
		}
	}, {
		key: 'refreshProgress',
		value: function refreshProgress() {
			var c = this.$.progress;
			c.width = c.offsetWidth;
			c.height = c.offsetHeight;
			this.drawProgress();
			this.emit('progressRefresh');
		}
	}, {
		key: 'send',
		value: function send() {
			var _this3 = this;

			var color = this._.danmakuColor || this.opt.defaultDanmakuColor,
			    text = this.$.danmaku_input.value,
			    size = this._.danmakuSize,
			    mode = this._.danmakuMode,
			    time = this.danmakuFrame.time;

			if (text.match(/^\s*$/)) {
				this.danmakuInput(false);
				return;
			}
			if (color) {
				color = color.replace(/\$/g, function () {
					return colorChars[(0, _NyaPCore.limitIn)(16 * Math.random() | 0, 0, 15)];
				});
			}
			var d = { color: color, text: text, size: size, mode: mode, time: time };
			if (this.opt.danmakuSend) {
				this.opt.danmakuSend(d, function (danmaku) {
					if (danmaku && danmaku._ === 'text') _this3.$.danmaku_input.value = '';
					var result = _this3.danmakuFrame.modules.TextDanmaku.load(danmaku);
					result.highlight = true;
					if (_this3.opt.autoHideDanmakuInput) {
						_this3.danmakuInput(false);
					}
				});
			}
		}
	}, {
		key: '_progressDrawer',
		value: function _progressDrawer() {
			var ctx = this._.progressContext,
			    c = this.$.progress,
			    w = c.width,
			    h = c.height,
			    v = this.video,
			    d = v.duration,
			    cT = v.currentTime,
			    pad = c.pad,
			    len = w - 2 * pad;
			var i = void 0;
			ctx.clearRect(0, 0, w, h);
			ctx.lineCap = "round";
			//background
			ctx.beginPath();
			ctx.strokeStyle = '#eee';
			ctx.lineWidth = 7;
			ctx.moveTo(pad, 15);
			ctx.lineTo(pad + len, 15);
			ctx.stroke();
			//buffered
			ctx.beginPath();
			ctx.strokeStyle = '#C0BBBB';
			ctx.lineWidth = 2;
			var tr = v.buffered;
			for (i = tr.length; i--;) {
				ctx.moveTo(pad + tr.start(i) / d * len, 18);
				ctx.lineTo(pad + tr.end(i) / d * len, 18);
			}
			ctx.stroke();
			//progress
			ctx.beginPath();
			ctx.strokeStyle = '#6cf';
			ctx.lineWidth = 5;
			ctx.moveTo(pad, 15);
			ctx.lineTo(pad + len * cT / d, 15);
			ctx.stroke();
			//already played
			ctx.beginPath();
			ctx.strokeStyle = 'rgba(255,255,255,.3)';
			ctx.lineWidth = 5;
			tr = v.played;
			for (i = tr.length; i--;) {
				ctx.moveTo(pad + tr.start(i) / d * len, 15);
				ctx.lineTo(pad + tr.end(i) / d * len, 15);
			}
			ctx.stroke();
			//mouse
			if (this._.progressX) {
				ctx.beginPath();
				ctx.strokeStyle = 'rgba(0,0,0,.05)';
				ctx.moveTo(pad + len * cT / d, 15);
				ctx.lineTo((0, _NyaPCore.limitIn)(this._.progressX, pad, pad + len), 15);
				ctx.stroke();
			}
			this._.drawingProgress = false;
		}
	}, {
		key: 'drawProgress',
		value: function drawProgress() {
			var _this4 = this;

			if (this._.drawingProgress) return;
			this._.drawingProgress = true;
			requestAnimationFrame(function () {
				return _this4._progressDrawer();
			});
		}
	}, {
		key: 'msg',
		value: function msg(text) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'tip';
			//type:tip|info|error
			var msg = new MsgBox(text, type);
			this.$.msg_box.appendChild(msg.msg);
			requestAnimationFrame(function () {
				return msg.show();
			});
		}
	}]);

	return NyaP;
}(_NyaPCore.NyaPlayerCore);

var MsgBox = function () {
	function MsgBox(text, type) {
		var _this5 = this;

		_classCallCheck(this, MsgBox);

		this.using = false;
		var msg = this.msg = (0, _Object2HTML2.default)({ _: 'div', attr: { class: 'msg_type_' + type }, child: [text] });
		msg.addEventListener('click', function () {
			return _this5.remove();
		});
		if (text instanceof HTMLElement) text = text.textContent;
		var texts = String(text).match(/\w+|\S/g);
		this.timeout = setTimeout(function () {
			return _this5.remove();
		}, Math.max((texts ? texts.length : 0) * 0.6 * 1000, 5000));
	}

	_createClass(MsgBox, [{
		key: 'show',
		value: function show() {
			var _this6 = this;

			this.msg.style.opacity = 0;
			setTimeout(function () {
				_this6.using = true;
				_this6.msg.style.opacity = 1;
			}, 0);
		}
	}, {
		key: 'remove',
		value: function remove() {
			var _this7 = this;

			if (!this.using) return;
			this.using = false;
			this.msg.style.opacity = 0;
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = 0;
			}
			setTimeout(function () {
				_this7.msg.parentNode.removeChild(_this7.msg);
			}, 600);
		}
	}]);

	return MsgBox;
}();

window.NyaP = NyaP;

},{"../lib/Object2HTML/Object2HTML.js":1,"./NyaPCore.js":13,"./i18n.js":14}],13:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ResizeSensor = exports.toArray = exports.limitIn = exports.setAttrs = exports.padTime = exports.rand = exports.formatTime = exports.isFullscreen = exports.exitFullscreen = exports.requestFullscreen = exports.addEvents = exports.NyaPlayerCore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _i18n = require('./i18n.js');

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

var _ = _i18n.i18n._;

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
			this.globalHandle(e, arg);
		}
	}, {
		key: '_resolve',
		value: function _resolve(e, arg) {
			var _this = this;

			if (e in this._events) {
				var hs = this._events[e];
				try {
					hs.forEach(function (h) {
						h.call(_this, arg);
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
	}, {
		key: 'globalHandle',
		value: function globalHandle(name, arg) {} //所有事件会触发这个函数

	}]);

	return NyaPEventEmitter;
}();

var NyaPlayerCore = function (_NyaPEventEmitter) {
	_inherits(NyaPlayerCore, _NyaPEventEmitter);

	function NyaPlayerCore(opt) {
		_classCallCheck(this, NyaPlayerCore);

		var _this2 = _possibleConstructorReturn(this, (NyaPlayerCore.__proto__ || Object.getPrototypeOf(NyaPlayerCore)).call(this));

		opt = _this2.opt = Object.assign({}, NyaPOptions, opt);
		var $ = _this2.$ = { document: document, window: window };
		_this2._ = {}; //for private variables
		var video = _this2._.video = (0, _Object2HTML2.default)({ _: 'video', attr: { id: 'main_video' } });
		_this2.container = (0, _Object2HTML2.default)({ _: 'div', prop: { id: 'danmaku_container' } });
		_this2.videoFrame = (0, _Object2HTML2.default)({ _: 'div', attr: { id: 'video_frame' }, child: [video, _this2.container, { _: 'div', attr: { id: 'loading_frame' }, child: [{ _: 'div', attr: { id: 'loading_anime' }, child: ['(๑•́ ω •̀๑)'] }, { _: 'div', attr: { id: 'loading_info' } }] }] });
		_this2.collectEles(_this2.videoFrame);

		_this2.loadingInfo(_('Loading danmaku frame'));
		_this2.danmakuFrame = new _danmakuFrame.DanmakuFrame(_this2.container);
		_this2.danmakuFrame.setMedia(video);
		_this2.danmakuFrame.enable('TextDanmaku');
		_this2.setDanmakuOptions(opt.danmakuOption);
		_this2.setDanmakuOptions(opt.textStyle);

		_this2.danmakuFrame.addStyle(['#loading_frame{top:0;left:0;width:100%;height:100%;position:absolute;background-color:#efefef;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;cursor:dafault;}', '#loading_frame #loading_anime{display:inline-block;font-size:5em;transition:transform 0.08s linear;will-change:transfrom;pointer-events:none;}', '#loading_frame #loading_info{display:block;font-size:.9em;position:absolute;left:0;bottom:0;padding:0.4em;color:#868686;}']);
		_this2._.loadingAnimeInterval = setInterval(function () {
			$.loading_anime.style.transform = "translate(" + rand(-20, 20) + "px," + rand(-20, 20) + "px) rotate(" + rand(-10, 10) + "deg)";
		}, 80);

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
		addEvents(video, {
			loadedmetadata: function loadedmetadata(e) {
				clearInterval(_this2._.loadingAnimeInterval);
				$.loading_frame.parentNode.removeChild($.loading_frame);
			},
			error: function error(e) {
				clearInterval(_this2._.loadingAnimeInterval);
				loading_anime.style.transform = "";
				loading_anime.innerHTML = '(๑• . •๑)';
			}
		});

		_this2.emit('coreLoad');
		return _this2;
	}

	_createClass(NyaPlayerCore, [{
		key: 'playToggle',
		value: function playToggle() {
			var Switch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.video.paused;

			this.video[Switch ? 'play' : 'pause']();
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
			var bool = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.danmakuFrame.modules.TextDanmaku.enabled;

			this.danmakuFrame[bool ? 'enable' : 'disable']('TextDanmaku');
			this.emit('danmakuToggle', bool);
		}
	}, {
		key: 'danmakuAt',
		value: function danmakuAt(x, y) {
			return this.danmakuFrame.modules.TextDanmaku.danmakuAt(x, y);
		}
	}, {
		key: 'loadingInfo',
		value: function loadingInfo(text) {
			this.$.loading_info.appendChild((0, _Object2HTML2.default)({ _: 'div', child: [text] }));
		}
	}, {
		key: 'collectEles',
		value: function collectEles(ele) {
			var $ = this.$;
			if (ele.id && !$[ele.id]) $[ele.id] = ele;
			toArray(ele.querySelectorAll('*')).forEach(function (e) {
				if (e.id && !$[e.id]) $[e.id] = e;
			});
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

function addEvents(target, events) {
	if (!Array.isArray(target)) target = [target];

	var _loop = function _loop(e) {
		e.split(/\,/g).forEach(function (e2) {
			target.forEach(function (t) {
				t.addEventListener(e2, events[e]);
			});
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
function rand(min, max) {
	return min + Math.random() * (max - min) + 0.5 | 0;
}
function toArray(obj) {
	if (obj instanceof Array) return obj.slice();
	if (obj.length !== undefined) return Array.prototype.slice.call(obj);
	return [].concat(_toConsumableArray(obj));
}

//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) String.prototype.startsWith = function (searchString) {
	var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	return this.substr(position, searchString.length) === searchString;
};
//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) Object.assign = function (target, varArgs) {
	'use strict';

	if (target == null) throw new TypeError('Cannot convert undefined or null to object');
	var to = Object(target);
	for (var index = 1; index < arguments.length; index++) {
		var nextSource = arguments[index];
		if (nextSource != null) {
			for (var nextKey in nextSource) {
				if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
					to[nextKey] = nextSource[nextKey];
				}
			}
		}
	}
	return to;
};
//Polyfill Array.from
if (!Array.from) Array.from = function (a, func) {
	if (!(a instanceof Array)) a = toArray(a);
	var r = new Array(a.length);
	for (var i = a.length; i--;) {
		r[i] = func ? func(a[i], i) : a[i];
	}return r;
};
//Polyfill Number.isInteger
if (!Number.isInteger) Number.isInteger = function (v) {
	return (v | 0) === v;
};

exports.default = NyaPlayerCore;
exports.NyaPlayerCore = NyaPlayerCore;
exports.addEvents = addEvents;
exports.requestFullscreen = requestFullscreen;
exports.exitFullscreen = exitFullscreen;
exports.isFullscreen = isFullscreen;
exports.formatTime = formatTime;
exports.rand = rand;
exports.padTime = padTime;
exports.setAttrs = setAttrs;
exports.limitIn = limitIn;
exports.toArray = toArray;
exports.ResizeSensor = _danmakuFrame.ResizeSensor;

},{"../lib/Object2HTML/Object2HTML.js":1,"../lib/danmaku-frame/src/danmaku-frame.js":3,"../lib/danmaku-text/src/danmaku-text.js":6,"./i18n.js":14}],14:[function(require,module,exports){
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
	'Send': '发送',
	'pause': '暂停',
	'muted': '静音',
	'settings': '设置',
	'loop(L)': '循环(L)',
	'hex color': 'Hex颜色',
	'full page(P)': '全页模式(P)',
	'Creating player': '创建播放器',
	'full screen(F)': '全屏模式(F)',
	'danmaku toggle(D)': '弹幕开关(D)',
	'Input danmaku here': '在这里输入弹幕',
	'Loading danmaku frame': '加载弹幕框架',
	'danmaku input(Enter)': '弹幕输入框(回车)',
	'volume($0)([shift]+↑↓)': '音量($0)([shift]+↑↓)',
	'Failed to change to fullscreen mode': '无法切换到全屏模式'
};

//automatically select a language

if (!navigator.languages) {
	navigator.languages = [navigator.language || navigator.browserLanguage];
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

},{}]},{},[12])

//# sourceMappingURL=NyaP.es2015.js.map
