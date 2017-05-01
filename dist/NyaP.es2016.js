(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/*
Copyright luojia@luojia.me
LGPL license
*/
function _Obj(t) {
	return typeof t == 'object';
}

function Object2HTML(obj, func) {
	let ele, o, e;
	if (typeof obj === 'string' || typeof obj === 'number') return document.createTextNode(obj); //text node
	if (obj === null || typeof obj !== 'object' || '_' in obj === false || typeof obj._ !== 'string' || obj._ == '') return; //if it dont have a _ prop to specify a tag
	ele = document.createElement(obj._);
	//attributes
	if (_Obj(obj.attr)) for (o in obj.attr) ele.setAttribute(o, obj.attr[o]);
	//properties
	if (_Obj(obj.prop)) for (o in obj.prop) ele[o] = obj.prop[o];
	//events
	if (_Obj(obj.event)) for (o in obj.event) ele.addEventListener(o, obj.event[o]);
	//childNodes
	if (_Obj(obj.child) && obj.child.length > 0) obj.child.forEach(o => {
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

/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
;
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
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
    var ResizeSensor = function (element, callback) {
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

            var reset = function () {
                expandChild.style.width = '100000px';
                expandChild.style.height = '100000px';

                expand.scrollLeft = 100000;
                expand.scrollTop = 100000;

                shrink.scrollLeft = 100000;
                shrink.scrollTop = 100000;
            };

            reset();

            var onResized = function () {
                rafId = 0;

                if (!dirty) return;

                lastWidth = newWidth;
                lastHeight = newHeight;

                if (element.resizedAttached) {
                    element.resizedAttached.call();
                }
            };

            var onScroll = function () {
                newWidth = element.offsetWidth;
                newHeight = element.offsetHeight;
                dirty = newWidth != lastWidth || newHeight != lastHeight;

                if (dirty && !rafId) {
                    rafId = requestAnimationFrame(onResized);
                }

                reset();
            };

            var addEvent = function (el, name, cb) {
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

var _ResizeSensor = require('../lib/ResizeSensor.js');

var _ResizeSensor2 = _interopRequireDefault(_ResizeSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DanmakuFrame {
	constructor(container) {
		this.container = container || document.createElement('div');
		this.rate = 1;
		this.timeBase = this.width = this.height = this.fps = 0;
		this.media = null;
		this.working = false;
		this.modules = {}; //constructed module list
		this.moduleList = [];
		const style = document.createElement("style");
		document.head.appendChild(style);
		this.styleSheet = style.sheet;

		for (let m in DanmakuFrame.moduleList) {
			//init all modules
			this.initModule(m);
		}

		setTimeout(() => {
			//container size sensor
			this.container.ResizeSensor = new _ResizeSensor2.default(this.container, () => {
				this.resize();
			});
			this.resize();
		}, 0);
		this.draw = this.draw.bind(this);
	}
	enable(name) {
		let module = this.modules[name];
		if (!module) return this.initModule(name);
		module.enabled = true;
		module.enable && module.enable();
		return true;
	}
	addStyle(s) {
		if (typeof s === 'string') s = [s];
		if (s instanceof Array === false) return;
		s.forEach(r => this.styleSheet.insertRule(r, this.styleSheet.cssRules.length));
	}
	disable(name) {
		let module = this.modules[name];
		if (!module) return false;
		module.enabled = false;
		module.disable && module.disable();
		return true;
	}
	initModule(name) {
		let mod = DanmakuFrame.moduleList[name];
		if (!mod) throw 'Module [' + name + '] does not exist.';
		let module = new mod(this);
		if (module instanceof DanmakuFrameModule === false) throw 'Constructor of ' + name + ' is not extended from DanmakuFrameModule';
		module.enabled = true;
		this.modules[name] = module;
		this.moduleList.push(name);
		console.debug(`Mod Inited: ${name}`);
		return true;
	}
	set time(t) {
		//current media time (ms)
		this.media || (this.timeBase = Date.now() - t);
		this.moduleFunction('time', t); //let all mods know when the time be set
	}
	get time() {
		return this.media ? this.media.currentTime * 1000 | 0 : Date.now() - this.timeBase;
	}
	draw(force) {
		if (!this.working) return;
		this.moduleFunction('draw', force);
		if (this.fps === 0) {
			requestAnimationFrame(this.draw);
		} else {
			setTimeout(this.draw, 1000 / this.fps);
		}
	}
	load(danmakuObj) {
		this.moduleFunction('load', danmakuObj);
	}
	loadList(danmakuArray) {
		this.moduleFunction('loadList', danmakuArray);
	}
	unload(danmakuObj) {
		this.moduleFunction('unload', danmakuObj);
	}
	start() {
		if (this.working) return;
		this.working = true;
		this.moduleFunction('start');
		this.draw(true);
	}
	pause() {
		this.working = false;
		this.moduleFunction('pause');
	}
	resize() {
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.moduleFunction('resize');
	}
	moduleFunction(name, arg) {
		for (let i = 0, m; i < this.moduleList.length; i++) {
			m = this.modules[this.moduleList[i]];
			if (m[name] && m.enabled) m[name](arg);
		}
	}
	setMedia(media) {
		this.media = media;
		addEvents(media, {
			playing: () => this.start(),
			pause: () => this.pause(),
			ratechange: () => this.rate = this.media.playbackRate
		});
		this.moduleFunction('media', media);
	}
	static addModule(name, module) {
		if (name in this.moduleList) {
			console.warn('The module "' + name + '" has already been added.');
			return;
		}
		this.moduleList[name] = module;
	}
}

DanmakuFrame.moduleList = {};

class DanmakuFrameModule {
	constructor(frame) {
		this.frame = frame;
		this.enabled = false;
	}
}
function addEvents(target, events = {}) {
	for (let e in events) e.split(/\,/g).forEach(e2 => target.addEventListener(e2, events[e]));
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

(function (f) {
	if (typeof define === "function" && define.amd) {
		define(f);
	} else if (typeof exports === "object") {
		module.exports = f();
	} else {
		(0, eval)('this').Mat = f();
	}
})(function () {
	const global = (0, eval)('this');
	const TypedArray = global.Float32Array && global.Float32Array.prototype;

	function createClass(Constructor) {
		class Matrix {
			get length() {
				return this._len;
			}
			static leftMultiply(m) {
				return this.set(Mat.multiply(m, this, Mat(m.row, this.column)));
			}
			static rightMultiply(m) {
				return this.set(Mat.multiply(this, m, Mat(this.row, m, column)));
			}
			static fill(n) {
				arguments.length || (n = 0);
				for (let i = this.length; i--;) this[i] = n;
				return this;
			}
			static set(arr, offset) {
				offset || (offset = 0);
				for (let i = arr.length + offset <= this.length ? arr.length : this.length - offset; i--;) this[offset + i] = arr[i];
				return this;
			}
			static put(m, row, column) {
				Mat.put(this, m, row || 0, column || 0);
				return this;
			}
			static rotate2d(t) {
				return this.set(Mat.rotate2d(this, t, Mat.Matrixes.T3));
			}
			static translate2d(x, y) {
				return this.set(Mat.translate2d(this, x, y, Mat.Matrixes.T3));
			}
			static scale2d(x, y) {
				return this.set(Mat.scale2d(this, x, y, Mat.Matrixes.T3));
			}
			static rotate3d(tx, ty, tz) {
				return this.set(Mat.rotate3d(this, tx, ty, tz, Mat.Matrixes.T4));
			}
			static scale3d(x, y, z) {
				return this.set(Mat.scale3d(this, x, y, z, Mat.Matrixes.T4));
			}
			static translate3d(x, y, z) {
				return this.set(Mat.translate3d(this, x, y, z, Mat.Matrixes.T4));
			}
			static rotateX(t) {
				return this.set(Mat.rotateX(this, t, Mat.Matrixes.T4));
			}
			static rotateY(t) {
				return this.set(Mat.rotateY(this, t, Mat.Matrixes.T4));
			}
			static rotateZ(t) {
				return this.set(Mat.rotateZ(this, t, Mat.Matrixes.T4));
			}
			static clone() {
				return Mat(this.row, this.column, this);
			}
			static toString() {
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
		}
		class staticMethods {
			//static methods
			static Identity(n) {
				//return a new Identity Matrix
				let m = Mat(n, n, 0);
				for (let i = n; i--;) m[i * n + i] = 1;
				return m;
			}
			static Perspective(fovy, aspect, znear, zfar, result) {
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
			static multiply(a, b, result) {
				if (a.column !== b.row) throw 'wrong matrix';
				let row = a.row,
				    column = Math.min(a.column, b.column),
				    r = result || Mat(row, column),
				    c,
				    i,
				    ind;
				for (let l = row; l--;) {
					for (c = column; c--;) {
						r[ind = l * r.column + c] = 0;
						for (i = a.column; i--;) {
							r[ind] += a[l * a.column + i] * b[c + i * b.column];
						}
					}
				}
				return r;
			}
			static multiplyString(a, b, array, ignoreZero = true) {
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
			static add(a, b, result) {
				if (a.column !== b.column || a.row !== b.row) throw 'wrong matrix';
				let r = result || Mat(a.row, b.column);
				for (let i = a.length; i--;) r[i] = a[i] + b[i];
				return r;
			}
			static minus(a, b, result) {
				if (a.column !== b.column || a.row !== b.row) throw 'wrong matrix';
				let r = result || Mat(a.row, b.column);
				for (let i = a.length; i--;) r[i] = a[i] - b[i];
				return r;
			}
			static rotate2d(m, t, result) {
				const Mr = Mat.Matrixes.rotate2d;
				Mr[0] = Mr[4] = Math.cos(t);
				Mr[1] = -(Mr[3] = Math.sin(t));
				return Mat.multiply(Mr, m, result || Mat(3, 3));
			}
			static scale2d(m, x, y, result) {
				const Mr = Mat.Matrixes.scale2d;
				Mr[0] = x;
				Mr[4] = y;
				return Mat.multiply(Mr, m, result || Mat(3, 3));
			}
			static translate2d(m, x, y, result) {
				const Mr = Mat.Matrixes.translate2d;
				Mr[2] = x;
				Mr[5] = y;
				return Mat.multiply(Mr, m, result || Mat(3, 3));
			}
			static rotate3d(m, tx, ty, tz, result) {
				const Xc = Math.cos(tx),
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
			static rotateX(m, t, result) {
				const Mr = Mat.Matrixes.rotateX;
				Mr[10] = Mr[5] = Math.cos(t);
				Mr[6] = -(Mr[9] = Math.sin(t));
				return Mat.multiply(Mr, m, result || Mat(4, 4));
			}
			static rotateY(m, t, result) {
				const Mr = Mat.Matrixes.rotateY;
				Mr[10] = Mr[0] = Math.cos(t);
				Mr[8] = -(Mr[2] = Math.sin(t));
				return Mat.multiply(Mr, m, result || Mat(4, 4));
			}
			static rotateZ(m, t, result) {
				const Mr = Mat.Matrixes.rotateZ;
				Mr[5] = Mr[0] = Math.cos(t);
				Mr[1] = -(Mr[4] = Math.sin(t));
				return Mat.multiply(Mr, m, result || Mat(4, 4));
			}
			static scale3d(m, x, y, z, result) {
				const Mr = Mat.Matrixes.scale3d;
				Mr[0] = x;
				Mr[5] = y;
				Mr[10] = z;
				return Mat.multiply(Mr, m, result || Mat(4, 4));
			}
			static translate3d(m, x, y, z, result) {
				const Mr = Mat.Matrixes.translate3d;
				Mr[12] = x;
				Mr[13] = y;
				Mr[14] = z;
				return Mat.multiply(Mr, m, result || Mat(4, 4));
			}
			static put(m, sub, row, column) {
				let c, ind, i;
				row || (row = 0);
				column || (column = 0);
				for (let l = sub.row; l--;) {
					if (l + row >= m.row) continue;
					for (c = sub.column; c--;) {
						if (c + column >= m.column) continue;
						m[(l + row) * m.column + c + column] = sub[l * sub.column + c];
					}
				}
			}
			static createClass(Constructor) {
				return createClass(Constructor);
			}
		}
		var testArray = new Constructor(1);
		Object.defineProperty(Matrix, '_instanceofTypedArray', { value: !!(TypedArray && TypedArray.isPrototypeOf(testArray)) });
		testArray = null;

		Object.setPrototypeOf(Matrix, Constructor.prototype);
		function Mat(l, c, fill) {
			const M = new Constructor(l * c);
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
	return createClass(global.Float32Array ? Float32Array : Array);
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
        registerImmediate = function (handle) {
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
        var onGlobalMessage = function (event) {
            if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function (handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function (handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function (handle) {
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
        registerImmediate = function (handle) {
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

require('../lib/setImmediate/setImmediate.js');

var _text2d = require('./text2d.js');

var _text2d2 = _interopRequireDefault(_text2d);

var _text3d = require('./text3d.js');

var _text3d2 = _interopRequireDefault(_text3d);

var _textCanvas = require('./textCanvas.js');

var _textCanvas2 = _interopRequireDefault(_textCanvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
	const defProp = Object.defineProperty;
	const requestIdleCallback = window.requestIdleCallback || setImmediate;
	let useImageBitmap = false;

	class TextDanmaku extends DanmakuFrameModule {
		constructor(frame) {
			super(frame);
			this.list = []; //danmaku object array
			this.indexMark = 0; //to record the index of last danmaku in the list
			this.tunnel = new tunnelManager();
			this.paused = true;
			this.randomText = `danmaku_text_${Math.random() * 999999 | 0}`;
			this.defaultStyle = { //these styles can be overwrote by the 'font' property of danmaku object
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
			frame.addStyle(`.${this.randomText}_fullfill{top:0;left:0;width:100%;height:100%;position:absolute;}`);

			defProp(this, 'renderMode', { configurable: true });
			defProp(this, 'activeRenderMode', { configurable: true, value: null });
			const con = this.container = document.createElement('div');
			con.classList.add(`${this.randomText}_fullfill`);
			frame.container.appendChild(con);

			//init modes
			this.text2d = new _text2d2.default(this);
			this.text3d = new _text3d2.default(this);
			this.textCanvas = new _textCanvas2.default(this);

			this.textCanvasContainer.hidden = this.canvas.hidden = this.canvas3d.hidden = true;
			this.modes = {
				1: this.textCanvas,
				2: this.text2d,
				3: this.text3d
			};
			this.GraphCache = []; //COL text graph cache
			this.DanmakuText = [];

			//opt time record
			this.cacheCleanTime = 0;
			this.danmakuMoveTime = 0;
			this.danmakuCheckTime = 0;

			this.danmakuCheckSwitch = true;
			this.options = {
				allowLines: false, //allow multi-line danmaku
				screenLimit: 0, //the most number of danmaku on the screen
				clearWhenTimeReset: true, //clear danmaku on screen when the time is reset
				speed: 6.5
			};
			addEvents(document, {
				visibilitychange: e => {
					if (document.hidden) {
						this.pause();
					} else {
						this.reCheckIndexMark();
						if (this.frame.working) this.start();else {
							this.draw(true);
						}
					}
				}
			});
			this._checkNewDanmaku = this._checkNewDanmaku.bind(this);
			this._cleanCache = this._cleanCache.bind(this);
			setInterval(this._cleanCache, 5000); //set an interval for cache cleaning
			this.setRenderMode(1);
		}
		setRenderMode(n) {
			if (this.renderMode === n || !(n in this.modes) || !this.modes[n].supported) return;
			this.clear();
			this.activeRenderMode && this.activeRenderMode.disable();
			this.modes[n].enable();
			defProp(this, 'activeRenderMode', { value: this.modes[n] });
			defProp(this, 'renderMode', { value: n });
			this.activeRenderMode.resize();
		}
		media(media) {
			addEvents(media, {
				seeked: () => {
					this.start();
					this.time();
					this._clearCanvas();
				},
				seeking: () => this.pause(),
				stalled: () => this.pause()
			});
		}
		start() {
			this.paused = false;
			this.reCheckIndexMark();
			this.activeRenderMode.start();
		}
		pause() {
			this.paused = true;
			this.activeRenderMode.pause();
		}
		load(d) {
			if (!d || d._ !== 'text') {
				return false;
			}
			if (typeof d.text !== 'string') {
				console.error('wrong danmaku object:', d);
				return false;
			}
			let t = d.time,
			    ind,
			    arr = this.list;
			ind = dichotomy(arr, d.time, 0, arr.length - 1, false);
			arr.splice(ind, 0, d);
			if (ind < this.indexMark) this.indexMark++;
			//round d.style.fontSize to prevent Iifinity loop in tunnel
			d.style.fontSize = d.style.fontSize + 0.5 | 0;
			if (isNaN(d.style.fontSize) || d.style.fontSize === Infinity || d.style.fontSize === 0) d.style.fontSize = this.defaultStyle.fontstyle.fontSize;
			if (typeof d.mode !== 'number') d.mode = 0;
			return d;
		}
		loadList(danmakuArray) {
			danmakuArray.forEach(d => this.load(d));
		}
		unload(d) {
			if (!d || d._ !== 'text') return false;
			const i = this.list.indexOf(d);
			if (i < 0) return false;
			this.list.splice(i, 1);
			if (i < this.indexMark) this.indexMark--;
			return true;
		}
		_checkNewDanmaku() {
			let d,
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
		_addNewDanmaku(d) {
			const cHeight = this.height,
			      cWidth = this.width;
			let t = this.GraphCache.length ? this.GraphCache.shift() : new TextGraph();
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
			const tnum = this.tunnel.getTunnel(t, cHeight);
			//calc margin
			let margin = (tnum < 0 ? 0 : tnum) % cHeight;
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
		_calcSideDanmakuPosition(t, T, cWidth) {
			let R = !t.danmaku.mode,
			    style = t.style;
			return (R ? cWidth : -style.width) + (R ? -1 : 1) * this.frame.rate * (style.width + 1024) * (T - t.time) * this.options.speed / 60000;
		}
		_calcDanmakusPosition(force) {
			let T = this.frame.time;
			if (!force && (this.danmakuMoveTime === T || this.paused)) return;
			const cWidth = this.width;
			let R,
			    i,
			    t,
			    style,
			    X,
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
							} else if (R && X < -style.width - 20 || !R && X > cWidth + style.width + 20) {
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
		_cleanCache(force) {
			//clean text object cache
			const now = Date.now();
			if (this.GraphCache.length > 30 || force) {
				//save 20 cached danmaku
				for (let ti = 0; ti < this.GraphCache.length; ti++) {
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
		draw(force) {
			if (!force && this.paused || !this.enabled) return;
			this._calcDanmakusPosition(force);
			this.activeRenderMode.draw(force);
			requestIdleCallback(this._checkNewDanmaku);
		}
		removeText(t) {
			//remove the danmaku from screen
			let ind = this.DanmakuText.indexOf(t);
			if (ind >= 0) this.DanmakuText.splice(ind, 1);
			this.tunnel.removeMark(t);
			t._bitmap = t.danmaku = null;
			t.removeTime = Date.now();
			this.GraphCache.push(t);
			this.activeRenderMode.remove(t);
		}
		resize() {
			if (this.activeRenderMode) this.activeRenderMode.resize();
			this.draw(true);
		}
		_clearCanvas(forceFull) {
			this.activeRenderMode && this.activeRenderMode.clear(forceFull);
		}
		clear() {
			//clear danmaku on the screen
			for (let i = this.DanmakuText.length, T; i--;) {
				T = this.DanmakuText[i];
				if (T.danmaku) this.removeText(T);
			}
			this.tunnel.reset();
			this._clearCanvas(true);
		}
		reCheckIndexMark(t = this.frame.time) {
			this.indexMark = dichotomy(this.list, t, 0, this.list.length - 1, true);
		}
		time(t = this.frame.time) {
			//reset time,you should invoke it when the media has seeked to another time
			this.reCheckIndexMark(t);
			if (this.options.clearWhenTimeReset) {
				this.clear();
			} else {
				this.resetTimeOfDanmakuOnScreen();
			}
		}
		resetTimeOfDanmakuOnScreen(cTime) {
			//cause the position of the danmaku is based on time
			//and if you don't want these danmaku on the screen to disappear after seeking,their time should be reset
			if (cTime === undefined) cTime = this.frame.time;
			this.DanmakuText.forEach(t => {
				if (!t.danmaku) return;
				t.time = cTime - (this.danmakuMoveTime - t.time);
			});
		}
		danmakuAt(x, y) {
			//return a list of danmaku which covers this position
			const list = [];
			if (!this.enabled) return list;
			this.DanmakuText.forEach(t => {
				if (!t.danmaku) return;
				if (t.style.x <= x && t.style.x + t.style.width >= x && t.style.y <= y && t.style.y + t.style.height >= y) list.push(t.danmaku);
			});
			return list;
		}
		enable() {
			//enable the plugin
			this.textCanvasContainer.hidden = false;
			if (this.frame.working) this.start();
		}
		disable() {
			//disable the plugin
			this.textCanvasContainer.hidden = true;
			this.pause();
			this.clear();
		}
		set useImageBitmap(v) {
			useImageBitmap = typeof createImageBitmap === 'function' ? v : false;
		}
		get useImageBitmap() {
			return useImageBitmap;
		}
		get width() {
			return this.frame.width;
		}
		get height() {
			return this.frame.height;
		}
	}

	class TextGraph {
		//code copied from CanvasObjLibrary
		constructor(text = '') {
			this._fontString = '';
			this._renderList = null;
			this.style = {};
			this.font = {};
			this.text = text;
			this._renderToCache = this._renderToCache.bind(this);
			defProp(this, '_cache', { configurable: true });
		}
		prepare(async = false) {
			//prepare text details
			if (!this._cache) {
				defProp(this, '_cache', { value: document.createElement("canvas") });
			}
			let ta = [];
			this.font.fontStyle && ta.push(this.font.fontStyle);
			this.font.fontVariant && ta.push(this.font.fontVariant);
			this.font.fontWeight && ta.push(this.font.fontWeight);
			ta.push(`${this.font.fontSize}px`);
			this.font.fontFamily && ta.push(this.font.fontFamily);
			this._fontString = ta.join(' ');

			const imgobj = this._cache,
			      ct = imgobj.ctx2d || (imgobj.ctx2d = imgobj.getContext("2d"));
			ct.font = this._fontString;
			this._renderList = this.text.split(/\n/g);
			this.estimatePadding = Math.max(this.font.shadowBlur + 5 + Math.max(Math.abs(this.font.shadowOffsetY), Math.abs(this.font.shadowOffsetX)), this.font.strokeWidth + 3);
			let w = 0,
			    tw,
			    lh = typeof this.font.lineHeigh === 'number' ? this.font.lineHeigh : this.font.fontSize;
			for (let i = this._renderList.length; i--;) {
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
		_renderToCache() {
			if (!this.danmaku) return;
			this.render(this._cache.ctx2d);
			if (useImageBitmap) {
				//use ImageBitmap
				if (this._bitmap) {
					this._bitmap.close();
					this._bitmap = null;
				}
				createImageBitmap(this._cache).then(bitmap => {
					this._bitmap = bitmap;
				});
			}
		}
		render(ct) {
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
			let lh = typeof this.font.lineHeigh === 'number' ? this.font.lineHeigh : this.font.fontSize,
			    x;
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

			for (let i = this._renderList.length; i--;) {
				this.font.strokeWidth && ct.strokeText(this._renderList[i], x, lh * i);
				this.font.fill && ct.fillText(this._renderList[i], x, lh * i);
			}
			ct.restore();
		}
	}

	class tunnelManager {
		constructor() {
			this.reset();
		}
		reset() {
			this.right = {};
			this.left = {};
			this.bottom = {};
			this.top = {};
		}
		getTunnel(tobj, cHeight) {
			//get the tunnel index that can contain the danmaku of the sizes
			let tunnel = this.tunnel(tobj.danmaku.mode),
			    size = tobj.style.height,
			    ti = 0,
			    tnum = -1;
			if (typeof size !== 'number' || size <= 0) {
				console.error('Incorrect size:' + size);
				size = 24;
			}
			if (size > cHeight) return 0;

			while (tnum < 0) {
				for (let t = ti + size - 1; ti <= t;) {
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
		addMark(tobj) {
			let t = this.tunnel(tobj.danmaku.mode);
			if (!t[tobj.tunnelNumber]) t[tobj.tunnelNumber] = tobj;
		}
		removeMark(tobj) {
			let t,
			    tun = tobj.tunnelNumber;
			if (tun >= 0 && (t = this.tunnel(tobj.danmaku.mode))[tun] === tobj) {
				delete t[tun];
				tobj.tunnelNumber = -1;
			}
		}
		tunnel(id) {
			return this[tunnels[id]];
		}
	}

	const tunnels = ['right', 'left', 'bottom', 'top'];

	function dichotomy(arr, t, start, end, position = false) {
		if (arr.length === 0) return 0;
		let m = start,
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

function addEvents(target, events = {}) {
	for (let e in events) e.split(/\,/g).forEach(e2 => target.addEventListener(e2, events[e]));
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

var _textModuleTemplate = require('./textModuleTemplate.js');

var _textModuleTemplate2 = _interopRequireDefault(_textModuleTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Text2d extends _textModuleTemplate2.default {
	constructor(dText) {
		super(dText);
		this.supported = false;
		dText.canvas = document.createElement('canvas'); //the canvas
		dText.context2d = dText.canvas.getContext('2d'); //the canvas contex
		if (!dText.context2d) {
			console.warn('text 2d not supported');
			return;
		}
		dText.canvas.classList.add(`${dText.randomText}_fullfill`);
		dText.canvas.id = `${dText.randomText}_text2d`;
		dText.container.appendChild(dText.canvas);
		this.supported = true;
	}
	draw(force) {
		let ctx = this.dText.context2d,
		    cW = ctx.canvas.width,
		    dT = this.dText.DanmakuText,
		    i = dT.length,
		    t;
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
	clear(force) {
		const D = this.dText;
		if (force || this._evaluateIfFullClearMode()) {
			D.context2d.clearRect(0, 0, D.canvas.width, D.canvas.height);
			return;
		}
		for (let i = D.DanmakuText.length, t; i--;) {
			t = D.DanmakuText[i];
			if (t.drawn) D.context2d.clearRect(t.style.x - t.estimatePadding, t.style.y - t.estimatePadding, t._cache.width, t._cache.height);
		}
	}
	_evaluateIfFullClearMode() {
		if (this.dText.DanmakuText.length > 3) return true;
		let l = this.dText.GraphCache[this.dText.GraphCache.length - 1];
		if (l && l.drawn) {
			l.drawn = false;
			return true;
		}
		return false;
	}
	resize() {
		let D = this.dText,
		    C = D.canvas;
		C.width = D.width;
		C.height = D.height;
	}
	enable() {
		this.dText.useImageBitmap = !(this.dText.canvas.hidden = false);
	}
	disable() {
		this.dText.canvas.hidden = true;
	}
} /*
  Copyright luojia@luojia.me
  LGPL license
  */
exports.default = Text2d;

},{"./textModuleTemplate.js":10}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Mat = require('../lib/Mat/Mat.js');

var _Mat2 = _interopRequireDefault(_Mat);

var _textModuleTemplate = require('./textModuleTemplate.js');

var _textModuleTemplate2 = _interopRequireDefault(_textModuleTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
Copyright luojia@luojia.me
LGPL license
*/
const requestIdleCallback = window.requestIdleCallback || setImmediate;

class Text3d extends _textModuleTemplate2.default {
	constructor(dText) {
		super(dText);
		this.supported = false;
		dText.canvas3d = document.createElement('canvas'); //the canvas
		dText.canvas3d.classList.add(`${dText.randomText}_fullfill`);
		dText.canvas3d.id = `${dText.randomText}_text3d`;
		dText.context3d = dText.canvas3d.getContext('webgl'); //the canvas3d context
		if (!dText.context3d) dText.context3d = dText.canvas3d.getContext('expeimental-webgl');

		if (!dText.context3d) {
			console.warn('text 3d not supported');
			return;
		}
		dText.container.appendChild(dText.canvas3d);
		const gl = this.gl = dText.context3d,
		      canvas = dText.canvas3d;
		//init webgl

		//shader
		var shaders = {
			danmakuFrag: [gl.FRAGMENT_SHADER, `
				varying lowp vec2 vDanmakuTexCoord;
				uniform sampler2D uSampler;
				void main(void) {
					gl_FragColor = texture2D(uSampler,vDanmakuTexCoord);
				}`],
			danmakuVert: [gl.VERTEX_SHADER, `
				attribute vec2 aVertexPosition;
				attribute vec2 aDanmakuTexCoord;
				uniform mat4 u2dCoordinate;
				uniform vec2 uDanmakuPos;
				varying lowp vec2 vDanmakuTexCoord;
				void main(void) {
					gl_Position = u2dCoordinate * vec4(aVertexPosition+uDanmakuPos,0,1);
					vDanmakuTexCoord = aDanmakuTexCoord;
				}`]
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
		var shaderProgram = this.shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error("Unable to initialize the shader program.");
			return;
		}
		gl.useProgram(shaderProgram);

		//scene
		gl.clearColor(0, 0, 0, 0.0);
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		this.maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

		this.uSampler = gl.getUniformLocation(shaderProgram, "uSampler");
		this.u2dCoord = gl.getUniformLocation(shaderProgram, "u2dCoordinate");
		this.uDanmakuPos = gl.getUniformLocation(shaderProgram, "uDanmakuPos");
		this.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		this.atextureCoord = gl.getAttribLocation(shaderProgram, "aDanmakuTexCoord");

		gl.enableVertexAttribArray(this.aVertexPosition);
		gl.enableVertexAttribArray(this.atextureCoord);

		this.commonTexCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.commonTexCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, commonTextureCoord, gl.STATIC_DRAW);
		gl.vertexAttribPointer(this.atextureCoord, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(this.uSampler, 0);

		this.supported = true;
	}
	draw(force) {
		const gl = this.gl,
		      l = this.dText.DanmakuText.length;
		for (let i = 0, t; i < l; i++) {
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
	clear() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}
	deleteTextObject(t) {
		const gl = this.gl;
		if (t.texture) gl.deleteTexture(t.texture);
		if (t.verticesBuffer) gl.deleteBuffer(t.verticesBuffer);
		if (t.textureCoordBuffer) gl.deleteBuffer(t.textureCoordBuffer);
	}
	resize(w, h) {
		const gl = this.gl,
		      C = this.dText.canvas3d;
		C.width = this.dText.width;
		C.height = this.dText.height;
		gl.viewport(0, 0, C.width, C.height);
		//to 2d canvas
		gl.uniformMatrix4fv(this.u2dCoord, false, _Mat2.default.Identity(4).translate3d(-1, 1, 0).scale3d(2 / C.width, -2 / C.height, 0));
	}
	enable() {
		this.dText.useImageBitmap = this.dText.canvas3d.hidden = false;
	}
	disable() {
		this.dText._cleanCache(true);
		this.dText.canvas3d.hidden = true;
	}
	newDanmaku(t) {
		const gl = this.gl;
		t.glDanmaku = false;
		if (t._cache.height > this.maxTexSize || t._cache.width > this.maxTexSize) {
			//ignore too large danmaku image
			console.warn('Ignore a danmaku width too large size', t.danmaku);
			return;
		}
		let tex;
		if (!(tex = t.texture)) {
			tex = t.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}

		requestIdleCallback(() => {
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t._cache);
			t.glDanmaku = true;
		});

		//vert
		t.verticesBuffer || (t.verticesBuffer = gl.createBuffer());
		gl.bindBuffer(gl.ARRAY_BUFFER, t.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, t._cache.width, 0, 0, t._cache.height, t._cache.width, t._cache.height]), gl.STATIC_DRAW);
	}
}

const commonTextureCoord = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]);

exports.default = Text3d;

},{"../lib/Mat/Mat.js":4,"./textModuleTemplate.js":10}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _textModuleTemplate = require('./textModuleTemplate.js');

var _textModuleTemplate2 = _interopRequireDefault(_textModuleTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TextCanvas extends _textModuleTemplate2.default {
	constructor(dText) {
		super(dText);
		this.supported = dText.text2d.supported;
		if (!this.supported) return;
		dText.frame.addStyle([`#${dText.randomText}_textCanvasContainer canvas{will-change:transform;top:0;left:0;position:absolute;}`, `#${dText.randomText}_textCanvasContainer.moving canvas{transition:transform 500s linear;}`, `#${dText.randomText}_textCanvasContainer{will-change:transform;pointer-events:none;overflow:hidden;}`]);

		this.container = dText.textCanvasContainer = document.createElement('div'); //for text canvas
		this.container.classList.add(`${dText.randomText}_fullfill`);
		this.container.id = `${dText.randomText}_textCanvasContainer`;
		dText.container.appendChild(this.container);
		document.addEventListener('visibilitychange', e => {
			if (dText.renderMode === 1 && !document.hidden) {
				this.resetPos();
			}
		});
	}
	_toggle(s) {
		let D = this.dText,
		    T = D.frame.time;
		this.container.classList[s ? 'add' : 'remove']('moving');
		for (let i = D.DanmakuText.length, t; i--;) {
			if ((t = D.DanmakuText[i]).danmaku.mode >= 2) continue;
			if (s) {
				requestAnimationFrame(a => this._move(t, T + 500000));
			} else {
				this._move(t, T);
			}
		}
	}
	pause() {
		this._toggle(false);
	}
	start() {
		this._toggle(true);
	}
	_move(t, T) {
		if (!t.danmaku) return;
		if (T === undefined) T = this.dText.frame.time + 500000;
		t._cache.style.transform = `translate3d(${((this.dText._calcSideDanmakuPosition(t, T, this.dText.width) - t.estimatePadding) * 10 | 0) / 10}px,${t.style.y - t.estimatePadding}px,0)`;
	}
	resetPos() {
		this.pause();
		this.dText.paused || setImmediate(() => this.start());
	}
	resize() {
		this.resetPos();
	}
	remove(t) {
		this.container.removeChild(t._cache);
	}
	enable() {
		this.container.hidden = false;
	}
	disable() {
		this.container.hidden = true;
	}
	newDanmaku(t) {
		t._cache.style.transform = `translate3d(${t.style.x - t.estimatePadding}px,${t.style.y - t.estimatePadding}px,0)`;
		this.container.appendChild(t._cache);
		if (t.danmaku.mode < 2) requestAnimationFrame(a => this._move(t));
	}
} /*
  Copyright luojia@luojia.me
  LGPL license
  */
exports.default = TextCanvas;

},{"./textModuleTemplate.js":10}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
/*
Copyright luojia@luojia.me
LGPL license

*/
class textModuleTemplate {
	constructor(dText) {
		this.dText = dText;
	}
	draw() {}
	pause() {}
	start() {}
	clear() {}
	resize() {}
	remove() {}
	enable() {}
	disable() {}
	newDanmaku() {}
	deleteTextObject() {}
}

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

var _i18n = require('./i18n.js');

var _Object2HTML = require('../lib/Object2HTML/Object2HTML.js');

var _Object2HTML2 = _interopRequireDefault(_Object2HTML);

var _NyaPCore = require('./NyaPCore.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _ = _i18n.i18n._;

const colorChars = '0123456789abcdef';

//NyaP options
const NyaPOptions = {
	autoHideDanmakuInput: true, //hide danmakuinput after danmaku sending
	danmakuColors: ['fff', '6cf', 'ff0', 'f00', '0f0', '00f', 'f0f', '000'], //colors in the danmaku style pannel
	danmakuModes: [0, 3, 2, 1], //0:right	1:left	2:bottom	3:top
	defaultDanmakuColor: null, //a hex color(without #),when the color inputed is invalid,this color will be applied
	defaultDanmakuMode: 0, //right
	danmakuSend: (d, callback) => {
		callback(false);
	}, //the func for sending danmaku
	danmakuSizes: [20, 24, 36],
	defaultDanmakuSize: 24
};

//normal player
class NyaP extends _NyaPCore.NyaPlayerCore {
	constructor(opt) {
		super(Object.assign({}, NyaPOptions, opt));
		opt = this.opt;
		const NP = this;
		const $ = this.$ = { document, window };
		this._.playerMode = 'normal';
		const video = this.video;
		video.controls = false;
		const icons = {
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
		function icon(name, event, attr = {}) {
			const ico = icons[name];
			return (0, _Object2HTML2.default)({ _: 'span', event, attr, prop: { id: `icon_span_${name}`,
					innerHTML: `<svg height=${ico[1]} width=${ico[0]} id="icon_${name}"">${ico[2]}</svg>` } });
		}
		function collectEles(ele) {
			if (ele.id && !$[ele.id]) $[ele.id] = ele;
			(0, _NyaPCore.toArray)(ele.querySelectorAll('*')).forEach(e => {
				if (e.id && !$[e.id]) $[e.id] = e;
			});
		}

		this._.player = (0, _Object2HTML2.default)({
			_: 'div', attr: { 'class': 'NyaP', id: 'NyaP', tabindex: 0 }, child: [this.videoFrame, { _: 'div', attr: { id: 'controls' }, child: [{ _: 'div', attr: { id: 'control' }, child: [{ _: 'span', attr: { id: 'control_left' }, child: [icon('play', { click: e => this.playToggle() }, { title: _('play') })] }, { _: 'span', attr: { id: 'control_center' }, child: [{ _: 'div', prop: { id: 'progress_info' }, child: [{ _: 'span', child: [{ _: 'canvas', prop: { id: 'progress', pad: 10 } }] }, { _: 'span', prop: { id: 'time_frame' }, child: [{ _: 'span', prop: { id: 'time' }, child: [{ _: 'span', prop: { id: 'current_time' }, child: ['00:00'] }, '/', { _: 'span', prop: { id: 'total_time' }, child: ['00:00'] }] }] }] }, { _: 'div', prop: { id: 'danmaku_input_frame' }, child: [{ _: 'span', prop: { id: 'danmaku_style' }, child: [{ _: 'div', attr: { id: 'danmaku_style_pannel' }, child: [{ _: 'div', attr: { id: 'danmaku_color_box' } }, { _: 'input', attr: { id: 'danmaku_color', placeholder: _('hex color'), maxlength: "6" } }, { _: 'span', attr: { id: 'danmaku_mode_box' } }, { _: 'span', attr: { id: 'danmaku_size_box' } }] }, icon('danmakuStyle')] }, { _: 'input', attr: { id: 'danmaku_input', placeholder: _('Input danmaku here') } }, { _: 'span', prop: { id: 'danmaku_submit', innerHTML: _('Send') } }] }] }, { _: 'span', attr: { id: 'control_right' }, child: [icon('addDanmaku', { click: e => this.danmakuInput() }, { title: _('danmaku input(Enter)') }), icon('danmakuToggle', { click: e => this.danmakuToggle() }, { title: _('danmaku toggle(D)') }), icon('volume', {}, { title: _('volume($0)([shift]+↑↓)', '100%') }), icon('loop', { click: e => {
								video.loop = !video.loop;
							} }, { title: _('loop(L)') }), { _: 'span', prop: { id: 'player_mode' }, child: [icon('fullPage', { click: e => this.playerMode('fullPage') }, { title: _('full page(P)') }), icon('fullScreen', { click: e => this.playerMode('fullScreen') }, { title: _('full screen(F)') })] }] }] }] }]
		});

		//add elements with id to $ prop
		collectEles(this._.player);

		//danmaku sizes
		opt.danmakuSizes && opt.danmakuSizes.forEach((s, ind) => {
			let e = (0, _Object2HTML2.default)({ _: 'span', attr: { style: `font-size:${12 + ind * 3}px;`, title: s }, prop: { size: s }, child: ['A'] });
			$.danmaku_size_box.appendChild(e);
		});

		//danmaku colors
		opt.danmakuColors && opt.danmakuColors.forEach(c => {
			let e = (0, _Object2HTML2.default)({ _: 'span', attr: { style: `background-color:#${c};`, title: c }, prop: { color: c } });
			$.danmaku_color_box.appendChild(e);
		});

		//danmaku modes
		opt.danmakuModes && opt.danmakuModes.forEach(m => {
			$.danmaku_mode_box.appendChild(icon(`danmakuMode${m}`));
		});
		collectEles($.danmaku_mode_box);

		//progress
		setTimeout(() => {
			//ResizeSensor
			$.control.ResizeSensor = new _NyaPCore.ResizeSensor($.control, () => this.refreshProgress());
			this.refreshProgress();
		}, 0);
		this._.progressContext = $.progress.getContext('2d');

		//events
		const events = {
			NyaP: {
				keydown: e => this._playerKeyHandle(e)
			},
			document: {
				'fullscreenchange,mozfullscreenchange,webkitfullscreenchange,msfullscreenchange': e => {
					if (this._.playerMode == 'fullScreen' && !(0, _NyaPCore.isFullscreen)()) this.playerMode('normal');
				}
			},
			main_video: {
				playing: e => this._iconActive('play', true),
				'pause,stalled': e => {
					this._iconActive('play', false);
				},
				timeupdate: e => {
					if (Date.now() - this._.lastTimeUpdate < 30) return;
					this._setTimeInfo((0, _NyaPCore.formatTime)(video.currentTime, video.duration));
					this.drawProgress();
					this._.lastTimeUpdate = Date.now();
				},
				loadedmetadata: e => {
					this._setTimeInfo(null, (0, _NyaPCore.formatTime)(video.duration, video.duration));
				},
				volumechange: e => {
					(0, _NyaPCore.setAttrs)($.volume_circle, { 'stroke-dasharray': `${video.volume * 12 * Math.PI} 90`, style: `fill-opacity:${video.muted ? .2 : .6}!important` });
					$.icon_span_volume.setAttribute('title', _('volume($0)([shift]+↑↓)', video.muted ? _('muted') : `${video.volume * 100 | 0}%`));
				},
				progress: e => this.drawProgress(),
				_loopChange: e => this._iconActive('loop', e.value),
				click: e => this.playToggle(),
				contextmenu: e => e.preventDefault()
			},
			progress: {
				'mousemove,click': e => {
					let t = e.target,
					    pre = (0, _NyaPCore.limitIn)((e.offsetX - t.pad) / (t.offsetWidth - 2 * t.pad), 0, 1);
					if (e.type === 'mousemove') {
						this._.progressX = e.offsetX;this.drawProgress();
						this._setTimeInfo(null, (0, _NyaPCore.formatTime)(pre * video.duration, video.duration));
					} else if (e.type === 'click') {
						video.currentTime = pre * video.duration;
					}
				},
				mouseout: e => {
					this._.progressX = undefined;this.drawProgress();
					this._setTimeInfo(null, (0, _NyaPCore.formatTime)(video.duration, video.duration));
				}
			},
			danmaku_style_pannel: {
				click: e => setImmediate(a => this.$.danmaku_input.focus())
			},
			danmaku_color: {
				'input,change': e => {
					let i = e.target,
					    c;
					if (c = i.value.match(/^([\da-f\$]{3}){1,2}$/i)) {
						//match valid hex color code
						c = c[0];
						i.style.backgroundColor = `#${c}`;
						this._.danmakuColor = c;
					} else {
						this._.danmakuColor = undefined;
						i.style.backgroundColor = '';
					}
				}
			},
			icon_span_volume: {
				click: e => video.muted = !video.muted,
				wheel: e => {
					e.preventDefault();
					if (e.deltaMode !== 0) return;
					let delta;
					if (e.shiftKey) {
						delta = e.deltaY > 0 ? 10 : -10;
					} else if (e.deltaY > 10 || e.deltaY < -10) delta = e.deltaY / 10;else {
						delta = e.deltaY;
					}
					video.volume = (0, _NyaPCore.limitIn)(video.volume + delta / 100, 0, 1);
				}
			},
			danmakuModeSwitch: {
				click: function () {
					let m = 1 * this.id.match(/\d$/)[0];
					if (NP._.danmakuMode !== undefined) $[`icon_span_danmakuMode${NP._.danmakuMode}`].classList.remove('active');
					$[`icon_span_danmakuMode${m}`].classList.add('active');
					NP._.danmakuMode = m;
				}
			},
			danmaku_input: {
				keydown: e => {
					if (e.key === 'Enter') {
						this.send();
					} else if (e.key === 'Escape') {
						this.danmakuInput(false);
					}
				}
			},
			danmaku_submit: {
				click: e => this.send()
			},
			danmaku_size_box: {
				click: e => {
					let t = e.target;
					if (!t.size) return;
					(0, _NyaPCore.toArray)($.danmaku_size_box.childNodes).forEach(sp => {
						if (this._.danmakuSize === sp.size) sp.classList.remove('active');
					});
					t.classList.add('active');
					this._.danmakuSize = t.size;
				}
			},
			danmaku_color_box: {
				click: e => {
					if (e.target.color) {
						$.danmaku_color.value = e.target.color;
						$.danmaku_color.dispatchEvent(new Event('change'));
					}
				}
			}
		};
		for (let eleid in $) {
			//add events to elements
			let eves = events[eleid];
			if (eleid.startsWith('icon_span_danmakuMode')) eves = events.danmakuModeSwitch;
			eves && (0, _NyaPCore.addEvents)($[eleid], eves);
		}

		typeof opt.defaultDanmakuMode === 'number' && $['icon_span_danmakuMode' + opt.defaultDanmakuMode].click(); //init to default danmaku mode
		typeof opt.defaultDanmakuSize === 'number' && (0, _NyaPCore.toArray)($.danmaku_size_box.childNodes).forEach(sp => {
			if (sp.size === opt.defaultDanmakuSize) sp.click();
		});

		//listen danmakuToggle event to change button style
		this.on('danmakuToggle', bool => this._iconActive('danmakuToggle', bool));
		if (this.danmakuFrame.modules.TextDanmaku.enabled) this._iconActive('danmakuToggle', true);
	}
	_iconActive(name, bool) {
		this.$[`icon_span_${name}`].classList[bool ? 'add' : 'remove']('active_icon');
	}
	_setTimeInfo(a = null, b = null) {
		requestAnimationFrame(() => {
			if (a !== null) {
				this.$.current_time.innerHTML = a;
			}
			if (b !== null) {
				this.$.total_time.innerHTML = b;
			}
		});
	}
	_playerKeyHandle(e) {
		//hot keys
		if (e.target.tagName === 'INPUT') return;
		const V = this.video,
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
	danmakuInput(bool = !this.$.danmaku_input_frame.offsetHeight) {
		let $ = this.$;
		$.danmaku_input_frame.style.display = bool ? 'flex' : '';
		this._iconActive('addDanmaku', bool);
		setImmediate(() => {
			bool ? $.danmaku_input.focus() : $.NyaP.focus();
		});
	}
	playerMode(mode = 'normal') {
		if (mode === 'normal' && this._.playerMode === mode) return;
		let $ = this.$;
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
	refreshProgress() {
		const c = this.$.progress;
		c.width = c.offsetWidth;
		c.height = c.offsetHeight;
		this.drawProgress();
		this.emit('progressRefresh');
	}
	send() {
		let color = this._.danmakuColor || this.opt.defaultDanmakuColor,
		    text = this.$.danmaku_input.value,
		    size = this._.danmakuSize,
		    mode = this._.danmakuMode,
		    time = this.danmakuFrame.time;

		if (text.match(/^\s*$/)) {
			this.danmakuInput(false);
			return;
		}
		if (color) {
			color = color.replace(/\$/g, () => {
				return colorChars[(0, _NyaPCore.limitIn)(16 * Math.random() | 0, 0, 15)];
			});
		}
		let d = { color, text, size, mode, time };
		if (this.opt.danmakuSend) {
			this.opt.danmakuSend(d, danmaku => {
				if (danmaku && danmaku._ === 'text') this.$.danmaku_input.value = '';
				let result = this.danmakuFrame.modules.TextDanmaku.load(danmaku);
				result.highlight = true;
				if (this.opt.autoHideDanmakuInput) {
					this.danmakuInput(false);
				}
			});
		}
	}
	_progressDrawer() {
		const ctx = this._.progressContext,
		      c = this.$.progress,
		      w = c.width,
		      h = c.height,
		      v = this.video,
		      d = v.duration,
		      cT = v.currentTime,
		      pad = c.pad,
		      len = w - 2 * pad;
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
		let tr = v.buffered;
		for (var i = tr.length; i--;) {
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
		for (var i = tr.length; i--;) {
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
	drawProgress() {
		if (this._.drawingProgress) return;
		this._.drawingProgress = true;
		requestAnimationFrame(() => {
			this._progressDrawer();
		});
	}
}

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
exports.ResizeSensor = exports.toArray = exports.limitIn = exports.setAttrs = exports.padTime = exports.formatTime = exports.isFullscreen = exports.exitFullscreen = exports.requestFullscreen = exports.addEvents = exports.NyaPlayerCore = undefined;

var _danmakuFrame = require('../lib/danmaku-frame/src/danmaku-frame.js');

var _danmakuText = require('../lib/danmaku-text/src/danmaku-text.js');

var _danmakuText2 = _interopRequireDefault(_danmakuText);

var _Object2HTML = require('../lib/Object2HTML/Object2HTML.js');

var _Object2HTML2 = _interopRequireDefault(_Object2HTML);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _danmakuText2.default)(_danmakuFrame.DanmakuFrame, _danmakuFrame.DanmakuFrameModule); //init TextDanmaku mod


//default options
const NyaPOptions = {
	muted: false,
	volume: 1,
	loop: false,
	textStyle: {},
	danmakuOption: {}
};

class NyaPEventEmitter {
	constructor() {
		this._events = {};
	}
	emit(e, arg) {
		this._resolve(e, arg);
		this.globalHandle(e, arg);
	}
	_resolve(e, arg) {
		if (e in this._events) {
			const hs = this._events[e];
			try {
				hs.forEach(h => {
					h.call(this, arg);
				});
			} catch (e) {
				console.error(e);
			}
		}
	}
	on(e, handle) {
		if (!(handle instanceof Function)) return;
		if (!(e in this._events)) this._events[e] = [];
		this._events[e].push(handle);
	}
	removeEvent(e, handle) {
		if (!(e in this._events)) return;
		if (arguments.length === 1) {
			delete this._events[e];return;
		}
		let ind;
		if (ind = this._events[e].indexOf(handle) >= 0) this._events[e].splice(ind, 1);
		if (this._events[e].length === 0) delete this._events[e];
	}
	globalHandle(name, arg) {} //所有事件会触发这个函数
}

class NyaPlayerCore extends NyaPEventEmitter {
	constructor(opt) {
		super();
		opt = this.opt = Object.assign({}, NyaPOptions, opt);
		this._ = {}; //for private variables
		const video = this._.video = (0, _Object2HTML2.default)({ _: 'video', attr: { id: 'main_video' } });
		this.container = (0, _Object2HTML2.default)({ _: 'div', prop: { id: 'danmaku_container' } });
		this.videoFrame = (0, _Object2HTML2.default)({ _: 'div', attr: { id: 'video_frame' }, child: [video, this.container] });
		this.danmakuFrame = new _danmakuFrame.DanmakuFrame(this.container);
		this.danmakuFrame.setMedia(video);
		this.danmakuFrame.enable('TextDanmaku');
		this.setDanmakuOptions(opt.danmakuOption);
		this.setDanmakuOptions(opt.textStyle);

		//options
		setTimeout(a => {
			['src', 'muted', 'volume', 'loop'].forEach(o => {
				//dont change the order
				opt[o] !== undefined && (this.video[o] = opt[o]);
			});
		}, 0);

		//define events
		{
			//video:_loopChange
			let LoopDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'loop');
			Object.defineProperty(video, 'loop', {
				get: LoopDesc.get,
				set: function (bool) {
					if (bool === this.loop) return;
					this.dispatchEvent(Object.assign(new Event('_loopChange'), { value: bool }));
					LoopDesc.set.call(this, bool);
				}
			});
		}

		this.emit('coreLoad');
	}
	playToggle(Switch = this.video.paused) {
		this.video[Switch ? 'play' : 'pause']();
	}
	loadDanmaku(obj) {
		this.danmakuFrame.load(obj);
	}
	loadDanmakuList(obj) {
		this.danmakuFrame.loadList(obj);
	}
	removeDanmaku(obj) {
		this.danmakuFrame.unload(obj);
	}
	danmakuToggle(bool = !this.danmakuFrame.modules.TextDanmaku.enabled) {
		this.danmakuFrame[bool ? 'enable' : 'disable']('TextDanmaku');
		this.emit('danmakuToggle', bool);
	}
	danmakuAt(x, y) {
		return this.danmakuFrame.modules.TextDanmaku.danmakuAt(x, y);
	}
	get player() {
		return this._.player;
	}
	get video() {
		return this._.video;
	}
	get src() {
		return this.video.src;
	}
	set src(s) {
		this.video.src = s;
	}
	get TextDanmaku() {
		return this.danmakuFrame.modules.TextDanmaku;
	}
	get videoSize() {
		return [this.video.videoWidth, this.video.videoHeight];
	}
	setDefaultTextStyle(opt) {
		if (opt) for (let n in opt) this.TextDanmaku.defaultStyle[n] = opt[n];
	}
	setDanmakuOptions(opt) {
		if (opt) for (let n in opt) this.TextDanmaku.options[n] = opt[n];
	}
}

//other functions

function addEvents(target, events) {
	if (!Array.isArray(target)) target = [target];
	for (let e in events) e.split(/\,/g).forEach(function (e2) {
		target.forEach(function (t) {
			t.addEventListener(e2, events[e]);
		});
	});
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
	const d = document;
	(d.exitFullscreen || d.msExitFullscreen || d.mozCancelFullScreen || d.webkitCancelFullScreen).call(d);
}
function isFullscreen() {
	const d = document;
	return !!(d.fullscreen || d.mozFullScreen || d.webkitIsFullScreen || d.msFullscreenElement);
}
function formatTime(sec, total) {
	let r,
	    s = sec | 0,
	    h = s / 3600 | 0;
	if (total >= 3600) s = s % 3600;
	r = [padTime(s / 60 | 0), padTime(s % 60)];
	total >= 3600 && r.unshift(h);
	return r.join(':');
}
function padTime(n) {
	//pad number to 2 chars
	return n > 9 && n || `0${n}`;
}
function setAttrs(ele, obj) {
	//set multi attrs to a Element
	for (let a in obj) ele.setAttribute(a, obj[a]);
}
function limitIn(num, min, max) {
	//limit the number in a range
	return num < min ? min : num > max ? max : num;
}
function toArray(obj) {
	return [...obj];
}

//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) String.prototype.startsWith = function (searchString, position = 0) {
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

},{"../lib/Object2HTML/Object2HTML.js":1,"../lib/danmaku-frame/src/danmaku-frame.js":3,"../lib/danmaku-text/src/danmaku-text.js":6}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/*
Copyright luojia@luojia.me
LGPL license
*/
const i18n = {
	lang: null,
	langs: {},
	_: (str, ...args) => {
		let s = i18n.lang && i18n.langs[i18n.lang][str] || str;
		args.length && args.forEach((arg, ind) => {
			s = s.replace(`$${ind}`, arg);
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
	'full screen(F)': '全屏模式(F)',
	'danmaku toggle(D)': '弹幕开关(D)',
	'Input danmaku here': '在这里输入弹幕',
	'danmaku input(Enter)': '弹幕输入框(回车)',
	'volume($0)([shift]+↑↓)': '音量($0)([shift]+↑↓)',
	'Failed to change to fullscreen mode': '无法切换到全屏模式'
};

//automatically select a language

if (!navigator.languages) {
	navigator.languages = [navigator.language];
}

for (let lang of [...navigator.languages]) {
	if (i18n.langs[lang]) {
		i18n.lang = lang;
		break;
	}
	let code = lang.match(/^\w+/)[0];
	for (let cod in i18n.langs) {
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

//# sourceMappingURL=NyaP.es2016.js.map
