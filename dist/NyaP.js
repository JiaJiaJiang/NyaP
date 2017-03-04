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
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = obj.child[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				o = _step.value;

				e = o instanceof Node ? o : Object2HTML(o, func);
				e instanceof Node && ele.appendChild(e);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
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
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.DanmakuFrameModule = exports.DanmakuFrame = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     Copyright luojia@luojia.me
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     LGPL license
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _ResizeSensor = require('../lib/ResizeSensor.js');

var _ResizeSensor2 = _interopRequireDefault(_ResizeSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

'use strict';

var DanmakuFrame = function () {
	function DanmakuFrame(container) {
		var _this = this;

		_classCallCheck(this, DanmakuFrame);

		this.container = container || document.createElement('div');
		this.container.id = 'danmaku_container';
		this.rate = 1;
		this.timeBase = 0;
		this.media = null;
		this.fps = 30;
		this.working = false;
		this.modules = {}; //constructed module list
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = DanmakuFrame.moduleList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var m = _step.value;
				//init all modules
				this.initModule(m[0]);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		setTimeout(function () {
			//container size sensor
			_this.container.ResizeSensor = new _ResizeSensor2.default(_this.container, function () {
				_this.resize();
			});
		}, 0);
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
			var mod = DanmakuFrame.moduleList.get(name);
			if (!mod) throw 'Module [' + name + '] does not exist.';
			var module = new mod(this);
			if (module instanceof DanmakuFrameModule === false) throw 'Constructor of ' + name + ' is not extended from DanmakuFrameModule';
			module.enabled = true;
			this.modules[name] = module;
			console.debug('Mod Inited: ' + name);
			return true;
		}
	}, {
		key: 'load',
		value: function load(danmakuObj) {
			this.moduleFunction('load');
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
			this.working = true;
			this.moduleFunction('start');
			this.draw();
		}
	}, {
		key: 'pause',
		value: function pause() {
			this.working = false;
			this.moduleFunction('pause');
		}
	}, {
		key: 'stop',
		value: function stop() {
			this.working = false;
			this.moduleFunction('stop');
		}
	}, {
		key: 'resize',
		value: function resize() {
			this.moduleFunction('resize');
		}
	}, {
		key: 'moduleFunction',
		value: function moduleFunction(name) {
			for (var _len = arguments.length, arg = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				arg[_key - 1] = arguments[_key];
			}

			for (var m in this.modules) {
				var _modules$m;

				this.modules[m][name] && (_modules$m = this.modules[m])[name].apply(_modules$m, arg);
			}
		}
	}, {
		key: 'draw',
		value: function draw() {
			var _this2 = this;

			if (this.working === false) return;
			if (this.fps === 0) {
				requestAnimationFrame(function () {
					_this2.draw();
				});
			} else {
				setTimeout(function () {
					_this2.draw();
				}, 1000 / this.fps);
			}
			this.moduleFunction('draw');
		}
	}, {
		key: 'setMedia',
		value: function setMedia(media) {
			this.media = media;
		}
	}, {
		key: 'time',
		set: function set(t) {
			//current media time (ms)
			this.media || (this.timeBase = Date.now() - t);
			this.moduleFunction('time', t); //let all mods know when the time be set
		},
		get: function get() {
			return this.media ? this.media.currentTime * 1000000 : Date.now() - this.timeBase;
		}
	}], [{
		key: 'addModule',
		value: function addModule(name, module) {
			if (this.moduleList.has(name)) {
				console.warn('The module "' + name + '" has already been added.');
				return;
			}
			this.moduleList.set(name, module);
		}
	}]);

	return DanmakuFrame;
}();

DanmakuFrame.moduleList = new Map();

var DanmakuFrameModule = function DanmakuFrameModule(frame) {
	_classCallCheck(this, DanmakuFrameModule);

	this.frame = frame;
	this.enabled = false;
}
/*enable(){}
disable(){}
load(){}
frame(){}
time(){}
start(){}
pause(){}
stop(){}*/
;

exports.DanmakuFrame = DanmakuFrame;
exports.DanmakuFrameModule = DanmakuFrameModule;

},{"../lib/ResizeSensor.js":2}],4:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
MIT LICENSE
Copyright (c) 2016 iTisso
https://github.com/iTisso/CanvasObjLibrary
varsion:2.0
*/

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define(factory);
	} else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
		module.exports = factory();
	} else {
		root.CanvasObjLibrary = factory();
	}
})(undefined, function () {
	'use strict';

	//class:CanvasObjLibrary

	var CanvasObjLibrary = function () {
		function CanvasObjLibrary(canvas) {
			var _this = this;

			_classCallCheck(this, CanvasObjLibrary);

			if (canvas instanceof HTMLCanvasElement === false) throw new TypeError('canvas required');
			var COL = this;
			Object.assign(this, {
				/*The main canvas*/
				canvas: canvas,
				/*Canvas' context*/
				context: canvas.getContext('2d'),
				default: {
					/*default font*/
					font: {
						fontStyle: null,
						fontWeight: null,
						fontVariant: null,
						color: "#000",
						lineHeight: null,
						fontSize: 14,
						fontFamily: "Arial",
						strokeWidth: 0,
						strokeColor: "#000",
						shadowBlur: 0,
						shadowColor: "#000",
						shadowOffsetX: 0,
						shadowOffsetY: 0,
						fill: true,
						reverse: false
					},
					style: {
						width: 1,
						height: 1,
						hidden: false,
						opacity: 1,
						clipOverflow: false,
						backgroundColor: null,
						composite: null,
						debugBorderColor: 'black',
						x: 0,
						y: 0,
						zoomX: 1,
						zoomY: 1,
						rotate: 0,
						rotatePointX: 0,
						rotatePointY: 0,
						positionPointX: 0,
						positionPointY: 0,
						zoomPointX: 0,
						zoomPointY: 0,
						skewX: 1,
						skewY: 1,
						skewPointX: 0,
						skewPointY: 0
					}
				},
				stat: {
					mouse: {
						x: null,
						y: null,
						previousX: null,
						previousY: null
					},
					/*The currently focused on obj*/
					onfocus: null,
					/*The currently mouseover obj*/
					onover: null,
					canvasOnFocus: false,
					canvasOnover: false

				},
				tmp: {
					graphID: 0,
					onOverGraph: null,
					toClickGraph: null,
					matrix1: new Float32Array([1, 0, 0, 0, 1, 0]),
					matrix2: new Float32Array([1, 0, 0, 0, 1, 0]),
					matrix3: new Float32Array([1, 0, 0, 0, 1, 0])
				},

				root: null, //root Graph

				class: {},

				autoClear: true,
				//Debug info
				debug: {
					switch: false,
					count: 0,
					FPS: 0,
					_lastFrameTime: Date.now(),
					_recordOffset: 0,
					_timeRecorder: new Uint32Array(15), //记录5帧绘制时的时间来计算fps
					on: function on() {
						this.switch = true;
					},
					off: function off() {
						this.switch = false;
					}
				}
			});
			//set classes
			for (var c in COL_Class) {
				this.class[c] = COL_Class[c](this);
			} //init root graph
			this.root = new this.class.FunctionGraph();
			this.root.name = 'root';
			//this.root.drawer=null;
			//prevent root's parentNode being modified
			Object.defineProperty(this.root, 'parentNode', { configurable: false });

			//adjust canvas drawing size
			this.adjustCanvas();

			//const canvas=this.canvas;
			//add events
			addEvents(canvas, {
				mouseout: function mouseout(e) {
					_this.stat.canvasOnover = false;
					//clear mouse pos data
					_this.stat.mouse.x = null;
					_this.stat.mouse.y = null;
					//clear onover obj
					var onover = _this.stat.onover;
					_this._commonEventHandle(e);
					_this.stat.onover = null;
				},
				mouseover: function mouseover(e) {
					_this.stat.canvasOnover = true;
				},
				mousemove: function mousemove(e) {
					_this.tmp.toClick = false;
					_this._commonEventHandle(e);
				},
				mousedown: function mousedown(e) {
					_this.tmp.toClickGraph = _this.stat.onover;
					_this.stat.canvasOnFocus = true;
					_this.stat.onfocus = _this.stat.onover;
					_this._commonEventHandle(e);
				},
				mouseup: function mouseup(e) {
					return _this._commonEventHandle(e);
				},
				click: function click(e) {
					if (_this.tmp.toClickGraph) _this._commonEventHandle(e);
				},
				dblclick: function dblclick(e) {
					return _this._commonEventHandle(e);
				},
				selectstart: function selectstart(e) {
					return e.preventDefault();
				},
				wheel: function wheel(e) {
					var ce = new _this.class.WheelEvent('wheel');
					ce.originEvent = e;
					(_this.stat.onover || _this.root).emit(ce);
				}
			});
			addEvents(document, {
				mousedown: function mousedown(e) {
					if (e.target !== _this.canvas) {
						_this.stat.canvasOnFocus = false;
					}
				},
				mouseout: function mouseout(e) {
					if (_this.stat.mouse.x !== null) {
						var eve = new window.MouseEvent('mouseout');
						_this.canvas.dispatchEvent(eve);
					}
				},
				keydown: function keydown(e) {
					return _this._commonEventHandle(e);
				},
				keyup: function keyup(e) {
					return _this._commonEventHandle(e);
				},
				keypress: function keypress(e) {
					return _this._commonEventHandle(e);
				}

			});
		}

		_createClass(CanvasObjLibrary, [{
			key: "generateGraphID",
			value: function generateGraphID() {
				return ++this.tmp.graphID;
			}
		}, {
			key: "adjustCanvas",
			value: function adjustCanvas() {
				var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.canvas.offsetWidth;
				var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.canvas.offsetHeight;

				this.root.style.width = this.canvas.width = width;
				this.root.style.height = this.canvas.height = height;
				var ce = new this.class.Event('resize');
				this.root.emit(ce);
			}
		}, {
			key: "_commonEventHandle",
			value: function _commonEventHandle(e) {
				if (e instanceof MouseEvent) {
					this.stat.previousX = this.stat.mouse.x;
					this.stat.previousY = this.stat.mouse.y;
					if (e.type === 'mouseout') {
						this.stat.mouse.x = null;
						this.stat.mouse.y = null;
					} else {
						this.stat.mouse.x = e.layerX;
						this.stat.mouse.y = e.layerY;
					}
					var ce = new this.class.MouseEvent(e.type);
					ce.originEvent = e;
					(this.stat.onover || this.root).emit(ce);
				} else if (e instanceof KeyboardEvent) {
					if (!this.stat.canvasOnFocus) return;
					var _ce = new this.class.KeyboardEvent(e.type);
					_ce.originEvent = e;
					(this.stat.onfocus || this.root).emit(_ce);
				}
			}
		}, {
			key: "clear",
			value: function clear() {
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}
		}, {
			key: "draw",
			value: function draw() {
				this.debug.count = 0;
				this.autoClear && this.clear();
				this.traverseGraphTree(0);
				this.debug.switch && this.drawDebug();
			}
			/*
   	traverse mode
   		0	draw graphs and check onover graph
   		1	check onover graph
   */

		}, {
			key: "traverseGraphTree",
			value: function traverseGraphTree() {
				var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

				this.context.setTransform(1, 0, 0, 1, 0, 0);
				this.drawGraph(this.root, mode);
				if (this.tmp.onOverGraph !== this.stat.onover) {
					//new onover graph
					var oldOnover = this.stat.onover;
					this.tmp.toClickGraph = null;
					this.stat.onover = this.tmp.onOverGraph;
					if (oldOnover) {
						var ceout = new this.class.MouseEvent('mouseout');
						oldOnover.emit(ceout);
					}

					if (this.stat.onover) {
						var ceover = new this.class.MouseEvent('mouseover');
						this.stat.onover.emit(ceover);
					}
				}
				this.tmp.onOverGraph = null;
			}
		}, {
			key: "drawDebug",
			value: function drawDebug() {
				var ct = this.context,
				    d = this.debug,
				    r = d._timeRecorder,
				    n = Date.now();
				//fps
				r[d._recordOffset++] = n - d._lastFrameTime;
				d._lastFrameTime = n;
				if (d._recordOffset === 15) d._recordOffset = 0;
				d.FPS = 15000 / (r[0] + r[1] + r[2] + r[3] + r[4] + r[5] + r[6] + r[7] + r[8] + r[9] + r[10] + r[11] + r[12] + r[13] + r[14]) + 0.5 | 0;
				//draw
				ct.save();
				ct.beginPath();
				ct.setTransform(1, 0, 0, 1, 0, 0);
				ct.font = "16px Arial";
				ct.textBaseline = "bottom";
				ct.globalCompositeOperation = "lighter";
				ct.fillStyle = "red";
				ct.fillText("point:" + String(this.stat.mouse.x) + "," + String(this.stat.mouse.y) + " FPS:" + this.debug.FPS + " Items:" + this.debug.count, 0, this.canvas.height);
				ct.fillText("onover:" + (this.stat.onover ? this.stat.onover.GID : "null") + " onfocus:" + (this.stat.onfocus ? this.stat.onfocus.GID : "null"), 0, this.canvas.height - 20);
				ct.strokeStyle = "red";
				ct.globalCompositeOperation = "source-over";
				ct.moveTo(this.stat.mouse.x, this.stat.mouse.y + 6);
				ct.lineTo(this.stat.mouse.x, this.stat.mouse.y - 6);
				ct.moveTo(this.stat.mouse.x - 6, this.stat.mouse.y);
				ct.lineTo(this.stat.mouse.x + 6, this.stat.mouse.y);
				ct.stroke();
				ct.restore();
			}
		}, {
			key: "drawGraph",
			value: function drawGraph(g) {
				var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

				if (g.style.hidden === true) return;
				var ct = this.context,
				    style = g.style,
				    _M = this.tmp.matrix3;
				var M = this.tmp.matrix1,
				    tM = this.tmp.matrix2;
				this.debug.count++;
				ct.save();
				if (mode === 0) {
					style.composite && (ct.globalCompositeOperation = style.composite);
					ct.globalAlpha = style.opacity;
				}
				//position & offset
				M[0] = 1;M[1] = 0;M[2] = style.x - style.positionPointX;
				M[3] = 0;M[4] = 1;M[5] = style.y - style.positionPointY;
				if (style.skewX !== 1 || style.skewY !== 1) {
					if (style.skewPointX !== 0 || style.skewPointY !== 0) {
						_M[0] = 1;_M[1] = 0;_M[2] = style.skewPointX;_M[3] = 0;_M[4] = 1;_M[5] = style.skewPointY;
						multiplyMatrix(M, _M, tM);
						_M[0] = style.skewX;_M[2] = 0;_M[4] = style.skewY;_M[5] = 0;
						multiplyMatrix(tM, _M, M);
						_M[0] = 1;_M[2] = -style.skewPointX;_M[4] = 1;_M[5] = -style.skewPointY;
						multiplyMatrix(M, _M, tM);
					} else {
						_M[0] = style.skewX;_M[1] = 0;_M[2] = 0;_M[3] = 0;_M[4] = style.skewY;_M[5] = 0;
						multiplyMatrix(M, _M, tM);
					}
					M.set(tM);
				}
				//rotate
				if (style.rotate !== 0) {
					var r = style.rotate * 0.0174532925;
					if (style.rotatePointX !== 0 || style.rotatePointY !== 0) {
						_M[0] = 1;_M[1] = 0;_M[2] = style.rotatePointX;_M[3] = 0;_M[4] = 1;_M[5] = style.rotatePointY;
						multiplyMatrix(M, _M, tM);
						_M[0] = Math.cos(r);_M[1] = -Math.sin(r);_M[2] = 0;_M[3] = Math.sin(r);_M[4] = Math.cos(r);_M[5] = 0;
						multiplyMatrix(tM, _M, M);
						_M[0] = 1;_M[1] = 0;_M[2] = -style.rotatePointX;_M[3] = 0;_M[4] = 1;_M[5] = -style.rotatePointY;
						multiplyMatrix(M, _M, tM);
					} else {
						_M[0] = Math.cos(r);_M[1] = -Math.sin(r);_M[2] = 0;_M[3] = Math.sin(r);_M[4] = Math.cos(r);_M[5] = 0;
						multiplyMatrix(M, _M, tM);
					}
					M.set(tM);
				}
				//zoom
				if (style.zoomX !== 1 || style.zoomY !== 1) {
					if (style.zoomPointX !== 0 || style.zoomPointY !== 0) {
						_M[0] = 1;_M[1] = 0;_M[2] = style.zoomPointX;_M[3] = 0;_M[4] = 1;_M[5] = style.zoomPointY;
						multiplyMatrix(M, _M, tM);
						_M[0] = style.zoomX;_M[2] = 0;_M[4] = style.zoomY;_M[5] = 0;
						multiplyMatrix(tM, _M, M);
						_M[0] = 1;_M[2] = -style.zoomPointX;_M[4] = 1;_M[5] = -style.zoomPointY;
						multiplyMatrix(M, _M, tM);
					} else {
						_M[0] = style.zoomX;_M[1] = 0;_M[2] = 0;_M[3] = 0;_M[4] = style.zoomY;_M[5] = 0;
						multiplyMatrix(M, _M, tM);
					}
					M.set(tM);
				}
				ct.transform(M[0], M[3], M[1], M[4], M[2], M[5]);
				if (this.debug.switch && mode === 0) {
					ct.save();
					ct.beginPath();
					ct.globalAlpha = 0.5;
					ct.globalCompositeOperation = 'source-over';
					ct.strokeStyle = g.style.debugBorderColor;
					ct.strokeWidth = 1.5;
					ct.strokeRect(0, 0, style.width, style.height);
					ct.strokeWidth = 1;
					ct.globalAlpha = 1;
					ct.strokeStyle = 'green';
					ct.strokeRect(style.positionPointX - 5, style.positionPointY - 5, 10, 10);
					ct.strokeStyle = 'blue';
					ct.strokeRect(style.rotatePointX - 4, style.rotatePointX - 4, 8, 8);
					ct.strokeStyle = 'olive';
					ct.strokeRect(style.zoomPointX - 3, style.zoomPointX - 3, 6, 6);
					ct.strokeStyle = '#6cf';
					ct.strokeRect(style.skewPointX - 2, style.skewPointX - 2, 4, 4);
					ct.restore();
				}
				if (g.style.clipOverflow) {
					ct.beginPath();
					ct.rect(0, 0, style.width, style.height);
					ct.clip();
				}
				switch (mode) {
					case 0:
						{
							g.drawer && g.drawer(ct);break;
						}
					case 1:
						{
							g.checkIfOnOver(true, mode);break;
						}
				}
				if (g.childNodes.length) {
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = g.childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var c = _step.value;

							this.drawGraph(c, mode);
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				}
				ct.restore();
			}
		}]);

		return CanvasObjLibrary;
	}();

	var COL_Class = {
		Event: function Event(host) {
			var COL = host;
			return function Event(type) {
				_classCallCheck(this, Event);

				this.type = type;
				this.timeStamp = Date.now();
			};
		},
		GraphEvent: function GraphEvent(host) {
			var COL = host;
			return function (_host$class$Event) {
				_inherits(GraphEvent, _host$class$Event);

				function GraphEvent(type) {
					_classCallCheck(this, GraphEvent);

					var _this2 = _possibleConstructorReturn(this, (GraphEvent.__proto__ || Object.getPrototypeOf(GraphEvent)).call(this, type));

					_this2.propagation = true;
					_this2.stoped = false;
					_this2.target = null;
					return _this2;
				}

				_createClass(GraphEvent, [{
					key: "stopPropagation",
					value: function stopPropagation() {
						this.propagation = false;
					}
				}, {
					key: "stopImmediatePropagation",
					value: function stopImmediatePropagation() {
						this.stoped = true;
					}
				}, {
					key: "altKey",
					get: function get() {
						return this.originEvent.altKey;
					}
				}, {
					key: "ctrlKey",
					get: function get() {
						return this.originEvent.ctrlKey;
					}
				}, {
					key: "metaKey",
					get: function get() {
						return this.originEvent.metaKey;
					}
				}, {
					key: "shiftKey",
					get: function get() {
						return this.originEvent.shiftKey;
					}
				}]);

				return GraphEvent;
			}(host.class.Event);
		},
		MouseEvent: function MouseEvent(host) {
			return function (_host$class$GraphEven) {
				_inherits(MouseEvent, _host$class$GraphEven);

				function MouseEvent(type) {
					_classCallCheck(this, MouseEvent);

					return _possibleConstructorReturn(this, (MouseEvent.__proto__ || Object.getPrototypeOf(MouseEvent)).call(this, type));
				}

				_createClass(MouseEvent, [{
					key: "button",
					get: function get() {
						return this.originEvent.button;
					}
				}, {
					key: "buttons",
					get: function get() {
						return this.originEvent.buttons;
					}
				}, {
					key: "movementX",
					get: function get() {
						return host.stat.mouse.x - host.stat.previousX;
					}
				}, {
					key: "movementY",
					get: function get() {
						return host.stat.mouse.y - host.stat.previousY;
					}
				}]);

				return MouseEvent;
			}(host.class.GraphEvent);
		},
		WheelEvent: function WheelEvent(host) {
			return function (_host$class$MouseEven) {
				_inherits(WheelEvent, _host$class$MouseEven);

				function WheelEvent(type) {
					_classCallCheck(this, WheelEvent);

					return _possibleConstructorReturn(this, (WheelEvent.__proto__ || Object.getPrototypeOf(WheelEvent)).call(this, type));
				}

				_createClass(WheelEvent, [{
					key: "deltaX",
					get: function get() {
						return this.originEvent.deltaX;
					}
				}, {
					key: "deltaY",
					get: function get() {
						return this.originEvent.deltaY;
					}
				}, {
					key: "deltaZ",
					get: function get() {
						return this.originEvent.deltaZ;
					}
				}, {
					key: "deltaMode",
					get: function get() {
						return this.originEvent.deltaMode;
					}
				}]);

				return WheelEvent;
			}(host.class.MouseEvent);
		},
		KeyboardEvent: function KeyboardEvent(host) {
			return function (_host$class$GraphEven2) {
				_inherits(KeyboardEvent, _host$class$GraphEven2);

				function KeyboardEvent(type) {
					_classCallCheck(this, KeyboardEvent);

					return _possibleConstructorReturn(this, (KeyboardEvent.__proto__ || Object.getPrototypeOf(KeyboardEvent)).call(this, type));
				}

				_createClass(KeyboardEvent, [{
					key: "key",
					get: function get() {
						return this.originEvent.key;
					}
				}, {
					key: "code",
					get: function get() {
						return this.originEvent.code;
					}
				}, {
					key: "repeat",
					get: function get() {
						return this.originEvent.repeat;
					}
				}, {
					key: "keyCode",
					get: function get() {
						return this.originEvent.keyCode;
					}
				}, {
					key: "charCode",
					get: function get() {
						return this.originEvent.charCode;
					}
				}, {
					key: "location",
					get: function get() {
						return this.originEvent.location;
					}
				}]);

				return KeyboardEvent;
			}(host.class.GraphEvent);
		},
		GraphEventEmitter: function GraphEventEmitter(host) {
			var COL = host;
			return function () {
				function GraphEventEmitter() {
					_classCallCheck(this, GraphEventEmitter);

					this._events = {};
				}

				_createClass(GraphEventEmitter, [{
					key: "emit",
					value: function emit(e) {
						if (e instanceof host.class.Event === false) return;
						e.target = this;
						this._resolve(e);
					}
				}, {
					key: "_resolve",
					value: function _resolve(e) {
						if (e.type in this._events) {
							var hs = this._events[e.type];
							try {
								var _iteratorNormalCompletion2 = true;
								var _didIteratorError2 = false;
								var _iteratorError2 = undefined;

								try {
									for (var _iterator2 = hs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
										var h = _step2.value;
										h.call(this, e);if (e.stoped) return;
									}
								} catch (err) {
									_didIteratorError2 = true;
									_iteratorError2 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion2 && _iterator2.return) {
											_iterator2.return();
										}
									} finally {
										if (_didIteratorError2) {
											throw _iteratorError2;
										}
									}
								}

								;
							} catch (e) {
								console.error(e);
							}
						}
						if (e.propagation === true && this.parentNode) this.parentNode._resolve(e);
					}
				}, {
					key: "on",
					value: function on(name, handle) {
						if (!(handle instanceof Function)) return;
						if (!(name in this._events)) this._events[name] = [];
						this._events[name].push(handle);
					}
				}, {
					key: "removeEvent",
					value: function removeEvent(name, handle) {
						if (!(name in this._events)) return;
						if (arguments.length === 1) {
							delete this._events[name];return;
						}
						var ind = void 0;
						if (ind = this._events[name].indexOf(handle) >= 0) this._events[name].splice(ind, 1);
						if (this._events[name].length === 0) delete this._events[name];
					}
				}]);

				return GraphEventEmitter;
			}();
		},
		GraphStyle: function GraphStyle(host) {
			return function () {
				function GraphStyle(inhertFrom) {
					_classCallCheck(this, GraphStyle);

					if (inhertFrom && this.inhert(inhertFrom)) return;
					this.__proto__.__proto__ = host.default.style;
					this._calculatableStyleChanged = false;
				}

				_createClass(GraphStyle, [{
					key: "inhertGraph",
					value: function inhertGraph(graph) {
						//inhert a graph's style
						if (!(graph instanceof host.class.Graph)) throw new TypeError('graph is not a Graph instance');
						this.inhertStyle(graph.style);
						return true;
					}
				}, {
					key: "inhertStyle",
					value: function inhertStyle(style) {
						if (!(style instanceof host.class.GraphStyle)) throw new TypeError('graph is not a Graph instance');
						this.__proto__ = style;
						return true;
					}
				}, {
					key: "inhert",
					value: function inhert(from) {
						if (from instanceof host.class.Graph) {
							this.inhertGraph(from);
							return true;
						} else if (from instanceof host.class.GraphStyle) {
							this.inhertStyle(from);
							return true;
						}
						return false;
					}
				}, {
					key: "cancelInhert",
					value: function cancelInhert() {
						this.__proto__ = Object.prototype;
					}
				}, {
					key: "getPoint",
					value: function getPoint(name) {
						switch (name) {
							case 'center':
								{
									return [this.width / 2, this.height / 2];
								}
						}
						return [0, 0];
					}
				}, {
					key: "position",
					value: function position(x, y) {
						this.x = x;
						this.y = y;
					}
				}, {
					key: "zoom",
					value: function zoom(x, y) {
						if (arguments.length == 1) {
							this.zoomX = this.zoomY = x;
						} else {
							this.zoomX = x;
							this.zoomY = y;
						}
					}
				}, {
					key: "size",
					value: function size(w, h) {
						this.width = w;
						this.height = h;
					}
				}, {
					key: "setRotatePoint",
					value: function setRotatePoint(x, y) {
						if (arguments.length == 2) {
							this.rotatePointX = x;
							this.rotatePointY = y;
						} else if (arguments.length == 1) {
							var _getPoint = this.getPoint(x);

							var _getPoint2 = _slicedToArray(_getPoint, 2);

							this.rotatePointX = _getPoint2[0];
							this.rotatePointY = _getPoint2[1];
						}
					}
				}, {
					key: "setPositionPoint",
					value: function setPositionPoint(x, y) {
						if (arguments.length == 2) {
							this.positionPointX = x;
							this.positionPointY = y;
						} else if (arguments.length == 1) {
							var _getPoint3 = this.getPoint(x);

							var _getPoint4 = _slicedToArray(_getPoint3, 2);

							this.positionPointX = _getPoint4[0];
							this.positionPointY = _getPoint4[1];
						}
					}
				}, {
					key: "setZoomPoint",
					value: function setZoomPoint(x, y) {
						if (arguments.length == 2) {
							this.zoomPointX = x;
							this.zoomPointY = y;
						} else if (arguments.length == 1) {
							var _getPoint5 = this.getPoint(x);

							var _getPoint6 = _slicedToArray(_getPoint5, 2);

							this.zoomPointX = _getPoint6[0];
							this.zoomPointY = _getPoint6[1];
						}
					}
				}, {
					key: "setSkewPoint",
					value: function setSkewPoint(x, y) {
						if (arguments.length == 2) {
							this.skewPointX = x;
							this.skewPointY = y;
						} else if (arguments.length == 1) {
							var _getPoint7 = this.getPoint(x);

							var _getPoint8 = _slicedToArray(_getPoint7, 2);

							this.skewPointX = _getPoint8[0];
							this.skewPointY = _getPoint8[1];
						}
					}
				}]);

				return GraphStyle;
			}();
		},
		Graph: function Graph(host) {
			return function (_host$class$GraphEven3) {
				_inherits(Graph, _host$class$GraphEven3);

				function Graph() {
					_classCallCheck(this, Graph);

					//this.name=name;
					var _this6 = _possibleConstructorReturn(this, (Graph.__proto__ || Object.getPrototypeOf(Graph)).call(this));

					_this6.host = host;
					_this6.GID = _this6.host.generateGraphID();
					_this6.onoverCheck = true;
					Object.defineProperties(_this6, {
						style: { value: new host.class.GraphStyle(), configurable: true },
						childNodes: { value: [] },
						parentNode: { value: undefined, configurable: true }
					});
					return _this6;
				}

				_createClass(Graph, [{
					key: "createShadow",
					value: function createShadow() {
						var shadow = Object.create(this);
						shadow.GID = this.host.generateGraphID();
						shadow.shadowParent = this;
						Object.defineProperties(shadow, {
							style: { value: new host.class.GraphStyle(this.style), configurable: true },
							parentNode: { value: undefined, configurable: true }
						});
						return shadow;
					}
					//add a graph to childNodes' end

				}, {
					key: "appendChild",
					value: function appendChild(graph) {
						if (!(graph instanceof host.class.Graph)) throw new TypeError('graph is not a Graph instance');
						if (graph === this) throw new Error('can not add myself as a child');
						if (graph.parentNode !== this) {
							Object.defineProperty(graph, 'parentNode', {
								value: this
							});
						} else {
							var i = this.findChild(graph);
							if (i >= 0) this.childNodes.splice(i, 1);
						}
						this.childNodes.push(graph);
					}
					//insert this graph after the graph

				}, {
					key: "insertAfter",
					value: function insertAfter(graph) {
						if (!(graph instanceof host.class.Graph)) throw new TypeError('graph is not a Graph instance');
						if (graph === this) throw new Error('can not add myself as a child');
						var p = graph.parentNode,
						    io = void 0,
						    it = void 0;
						if (!p) throw new Error('no parentNode');
						it = p.findChild(graph);
						//if(it<0)return false;
						if (p !== this.parentNode) {
							Object.defineProperty(this, 'parentNode', {
								value: p
							});
						} else {
							io = p.findChild(this);
							if (io >= 0) p.childNodes.splice(io, 1);
						}
						p.childNodes.splice(io < it ? it : it + 1, 0, this);
					}
					//insert this graph before the graph

				}, {
					key: "insertBefore",
					value: function insertBefore(graph) {
						if (!(graph instanceof host.class.Graph)) throw new TypeError('graph is not a Graph instance');
						if (graph === this) throw new Error('can not add myself as a child');
						var p = graph.parentNode,
						    io = void 0,
						    it = void 0;
						if (!p) throw new Error('no parentNode');
						it = p.findChild(graph);
						//if(it<0)return false;
						if (p !== this.parentNode) {
							Object.defineProperty(this, 'parentNode', {
								value: p
							});
						} else {
							io = p.findChild(this);
							if (io >= 0) p.childNodes.splice(io, 1);
						}
						p.childNodes.splice(io < it ? it - 1 : it, 0, this);
					}
				}, {
					key: "findChild",
					value: function findChild(graph) {
						for (var i = this.childNodes.length; i--;) {
							if (this.childNodes[i] === graph) return i;
						}return -1;
					}
				}, {
					key: "removeChild",
					value: function removeChild(graph) {
						var i = this.findChild(graph);
						if (i < 0) return;
						this.childNodes.splice(i, 1);
						Object.defineProperty(this, 'parentNode', {
							value: undefined
						});
					}
				}, {
					key: "checkIfOnOver",
					value: function checkIfOnOver() {
						var runHitRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
						var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

						if (this.onoverCheck === false || !this.hitRange) return false;
						var m = this.host.stat.mouse;
						if (m.x === null) return false;
						if (this === this.host.tmp.onOverGraph) return true;
						runHitRange && this.hitRange(this.host.context);
						if (mode === 0 && this.host.debug.switch) {
							this.host.context.save();
							this.host.context.strokeStyle = 'yellow';
							this.host.context.stroke();
							this.host.context.restore();
						}
						if (this.host.context.isPointInPath(m.x, m.y)) {
							this.host.tmp.onOverGraph = this;
							return true;
						}
						return false;
					}
				}, {
					key: "delete",
					value: function _delete() {
						//remove it from the related objects
						if (this.parentNode) this.parentNode.removeChild(this);
						if (this.host.stat.onover === this) this.host.stat.onover = null;
						if (this.host.stat.onfocus === this) this.host.stat.onfocus = null;
					}
				}]);

				return Graph;
			}(host.class.GraphEventEmitter);
		},
		FunctionGraph: function FunctionGraph(host) {
			return function (_host$class$Graph) {
				_inherits(FunctionGraph, _host$class$Graph);

				function FunctionGraph(drawer) {
					_classCallCheck(this, FunctionGraph);

					var _this7 = _possibleConstructorReturn(this, (FunctionGraph.__proto__ || Object.getPrototypeOf(FunctionGraph)).call(this));

					if (drawer instanceof Function) {
						_this7.drawer = drawer;
					}
					_this7.style.debugBorderColor = '#f00';
					return _this7;
				}

				_createClass(FunctionGraph, [{
					key: "drawer",
					value: function drawer(ct) {
						//onover point check
						this.checkIfOnOver(true);
					}
				}, {
					key: "hitRange",
					value: function hitRange(ct) {
						ct.beginPath();
						ct.rect(0, 0, this.style.width, this.style.height);
					}
				}]);

				return FunctionGraph;
			}(host.class.Graph);
		},
		ImageGraph: function ImageGraph(host) {
			return function (_host$class$FunctionG) {
				_inherits(ImageGraph, _host$class$FunctionG);

				function ImageGraph(image) {
					_classCallCheck(this, ImageGraph);

					var _this8 = _possibleConstructorReturn(this, (ImageGraph.__proto__ || Object.getPrototypeOf(ImageGraph)).call(this));

					if (image) _this8.use(image);
					_this8.style.debugBorderColor = '#0f0';
					return _this8;
				}

				_createClass(ImageGraph, [{
					key: "use",
					value: function use(image) {
						var _this9 = this;

						if (image instanceof Image) {
							this.image = image;
							if (!image.complete) {
								image.addEventListener('load', function (e) {
									_this9.resetStyleSize();
								});
							} else {
								this.resetStyleSize();
							}
							return true;
						} else if (image instanceof HTMLCanvasElement) {
							this.image = image;
							this.resetStyleSize();
							return true;
						}
						throw new TypeError('Wrong image type');
					}
				}, {
					key: "resetStyleSize",
					value: function resetStyleSize() {
						this.style.width = this.width;
						this.style.height = this.height;
					}
				}, {
					key: "drawer",
					value: function drawer(ct) {
						//onover point check
						//ct.beginPath();
						ct.drawImage(this.image, 0, 0);
						this.checkIfOnOver(true);
					}
				}, {
					key: "hitRange",
					value: function hitRange(ct) {
						ct.beginPath();
						ct.rect(0, 0, this.style.width, this.style.height);
					}
				}, {
					key: "width",
					get: function get() {
						if (this.image instanceof Image) return this.image.naturalWidth;
						if (this.image instanceof HTMLCanvasElement) return this.image.width;
						return 0;
					}
				}, {
					key: "height",
					get: function get() {
						if (this.image instanceof Image) return this.image.naturalHeight;
						if (this.image instanceof HTMLCanvasElement) return this.image.height;
						return 0;
					}
				}]);

				return ImageGraph;
			}(host.class.FunctionGraph);
		},
		CanvasGraph: function CanvasGraph(host) {
			return function (_host$class$ImageGrap) {
				_inherits(CanvasGraph, _host$class$ImageGrap);

				function CanvasGraph() {
					_classCallCheck(this, CanvasGraph);

					var _this10 = _possibleConstructorReturn(this, (CanvasGraph.__proto__ || Object.getPrototypeOf(CanvasGraph)).call(this));

					_this10.image = document.createElement('canvas');
					_this10.context = _this10.image.getContext('2d');
					_this10.autoClear = true;
					return _this10;
				}

				_createClass(CanvasGraph, [{
					key: "draw",
					value: function draw(func) {
						if (this.autoClear) this.context.clearRect(0, 0, this.width, this.height);
						func(this.context);
					}
				}, {
					key: "width",
					set: function set(w) {
						this.image.width = w;
					}
				}, {
					key: "height",
					set: function set(h) {
						this.image.height = h;
					}
				}]);

				return CanvasGraph;
			}(host.class.ImageGraph);
		},
		TextGraph: function TextGraph(host) {
			return function (_host$class$FunctionG2) {
				_inherits(TextGraph, _host$class$FunctionG2);

				function TextGraph() {
					var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

					_classCallCheck(this, TextGraph);

					//this._cache=null;
					var _this11 = _possibleConstructorReturn(this, (TextGraph.__proto__ || Object.getPrototypeOf(TextGraph)).call(this));

					_this11._fontString = '';
					_this11._renderList = null;
					_this11.autoSize = true;
					_this11.font = Object.create(host.default.font);
					_this11.realtimeRender = false;
					_this11.style.debugBorderColor = '#00f';
					_this11.text = text;
					Object.defineProperty(_this11, '_cache', { configurable: true });
					return _this11;
				}

				_createClass(TextGraph, [{
					key: "prepare",
					value: function prepare() {
						//prepare text details
						if (!this._cache && !this.realtimeRender) {
							Object.defineProperty(this, '_cache', { value: document.createElement("canvas") });
						}
						var font = "";
						this.font.fontStyle && (font = this.font.fontStyle);
						this.font.fontVariant && (font = font + " " + this.font.fontVariant);
						this.font.fontWeight && (font = font + " " + this.font.fontWeight);
						font = font + " " + this.font.fontSize + "px";
						this.font.fontFamily && (font = font + " " + this.font.fontFamily);
						this._fontString = font;

						if (this.realtimeRender) return;
						var imgobj = this._cache,
						    ct = imgobj.getContext("2d");
						ct.font = font;
						ct.clearRect(0, 0, imgobj.width, imgobj.height);
						this._renderList = this.text.split(/\n/g);
						this.estimatePadding = Math.max(this.font.shadowBlur + 5 + Math.max(Math.abs(this.font.shadowOffsetY), Math.abs(this.font.shadowOffsetX)), this.font.strokeWidth + 3);
						if (this.autoSize) {
							var w = 0,
							    tw = void 0,
							    lh = typeof this.font.lineHeigh === 'number' ? this.font.lineHeigh : this.font.fontSize;
							for (var i = this._renderList.length; i--;) {
								tw = ct.measureText(this._renderList[i]).width;
								tw > w && (w = tw); //max
							}
							imgobj.width = (this.style.width = w) + this.estimatePadding * 2;
							imgobj.height = (this.style.height = this._renderList.length * lh) + (lh < this.font.fontSize) ? this.font.fontSize * 2 : 0 + this.estimatePadding * 2;
						} else {
							imgobj.width = this.style.width;
							imgobj.height = this.style.height;
						}
						ct.translate(this.estimatePadding, this.estimatePadding);
						this.render(ct);
					}
				}, {
					key: "render",
					value: function render(ct) {
						//render text
						if (!this._renderList) return;
						ct.font = this._fontString; //set font
						ct.textBaseline = 'top';
						ct.lineWidth = this.font.strokeWidth;
						ct.fillStyle = this.font.color;
						ct.strokeStyle = this.font.strokeColor;
						ct.shadowBlur = this.font.shadowBlur;
						ct.shadowOffsetX = this.font.shadowOffsetX;
						ct.shadowOffsetY = this.font.shadowOffsetY;
						for (var i = this._renderList.length; i--;) {
							this.font.fill && ct.fillText(this._renderList[i], 0, this.font.lineHeight * i);
							this.font.strokeWidth && ct.strokeText(this._renderList[i], 0, this.font.lineHeight * i);
						}
					}
				}, {
					key: "drawer",
					value: function drawer(ct) {
						//ct.beginPath();
						if (this.realtimeRender) {
							//realtime render the text
							//onover point check
							this.checkIfOnOver(true);
							this.render(ct);
						} else {
							//draw the cache
							if (!this._cache) {
								this.prepare();
							}
							ct.drawImage(this._cache, -this.estimatePadding, -this.estimatePadding);
							this.checkIfOnOver(true);
						}
					}
				}, {
					key: "hitRange",
					value: function hitRange(ct) {
						ct.beginPath();
						ct.rect(0, 0, this.style.width, this.style.height);
					}
				}]);

				return TextGraph;
			}(host.class.FunctionGraph);
		}
	};

	function addEvents(target) {
		var events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		for (var e in events) {
			target.addEventListener(e, events[e]);
		}
	}

	function multiplyMatrix(m1, m2, r) {
		r[0] = m1[0] * m2[0] + m1[1] * m2[3];
		r[1] = m1[0] * m2[1] + m1[1] * m2[4];
		r[2] = m1[0] * m2[2] + m1[1] * m2[5] + m1[2];
		r[3] = m1[3] * m2[0] + m1[4] * m2[3];
		r[4] = m1[3] * m2[1] + m1[4] * m2[4];
		r[5] = m1[3] * m2[2] + m1[4] * m2[5] + m1[5];
	}

	//code from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	if (typeof Object.assign != 'function') Object.assign = function (target) {
		'use strict';
		// We must check against these specific cases.

		if (target === undefined || target === null) {
			throw new TypeError('Cannot convert undefined or null to object');
		}
		var output = Object(target);
		for (var index = 1; index < arguments.length; index++) {
			var source = arguments[index];
			if (source !== undefined && source !== null) {
				for (var nextKey in source) {
					if (source.hasOwnProperty(nextKey)) {
						output[nextKey] = source[nextKey];
					}
				}
			}
		}
		return output;
	};

	if (!Float32Array.__proto__.from) {
		(function () {
			var copy_data = [];
			Float32Array.__proto__.from = function (obj, func, thisObj) {
				var typedArrayClass = Float32Array.__proto__;
				if (typeof this !== "function") throw new TypeError("# is not a constructor");
				if (this.__proto__ !== typedArrayClass) throw new TypeError("this is not a typed array.");
				func = func || function (elem) {
					return elem;
				};
				if (typeof func !== "function") throw new TypeError("specified argument is not a function");
				obj = Object(obj);
				if (!obj["length"]) return new this(0);
				copy_data.length = 0;
				for (var i = 0; i < obj.length; i++) {
					copy_data.push(obj[i]);
				}
				copy_data = copy_data.map(func, thisObj);
				var typed_array = new this(copy_data.length);
				for (var _i = 0; _i < typed_array.length; _i++) {
					typed_array[_i] = copy_data[_i];
				}
				return typed_array;
			};
		})();
	}

	(function () {
		if (window.requestAnimationFrame) return;
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelRequestAnimationFrame = window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element, interval) {
			var currTime = Date.now();
			var timeToCall = interval || Math.max(0, 1000 / 60 - (currTime - lastTime));
			callback(0);
			var id = window.setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
		if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
	})();

	return CanvasObjLibrary;
});

},{}],5:[function(require,module,exports){
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

var _CanvasObjLibrary = require('../lib/COL/CanvasObjLibrary.js');

var _CanvasObjLibrary2 = _interopRequireDefault(_CanvasObjLibrary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function init(DanmakuFrame, DanmakuFrameModule) {
	var Text2D = function (_DanmakuFrameModule) {
		_inherits(Text2D, _DanmakuFrameModule);

		function Text2D(frame) {
			_classCallCheck(this, Text2D);

			var _this = _possibleConstructorReturn(this, (Text2D.__proto__ || Object.getPrototypeOf(Text2D)).call(this, frame));

			_this.list = []; //danmaku object array
			_this.indexMark = 0; //to record the index of last danmaku in the list
			_this.resetTunnel();
			_this.paused = true;
			_this.defaultStyle = { //these styles can be overwrote by the 'font' property of danmaku object
				fontStyle: null,
				fontWeight: 600,
				fontVariant: null,
				color: "#fbfbfb",
				lineHeight: null, //when this style is was not a number,the number will be the same as fontSize
				fontSize: 30,
				fontFamily: "Arial",
				strokeWidth: 1, //outline width
				strokeColor: "#000",
				shadowBlur: 10,
				shadowColor: "#000",
				shadowOffsetX: 0,
				shadowOffsetY: 0,
				fill: true, //if the text should be filled
				reverse: false,
				speed: 5,
				opacity: 1
			};

			_this.canvas = document.createElement('canvas'); //the canvas
			Object.assign(_this.canvas.style, { position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 });
			_this.context2d = _this.canvas.getContext('2d'); //the canvas context
			_this.COL = new _CanvasObjLibrary2.default(_this.canvas); //the library
			_this.COL.autoClear = false;
			frame.container.appendChild(_this.canvas);
			_this.COL_GraphCache = []; //COL text graph cache
			_this.layer = new _this.COL.class.FunctionGraph(); //text layer
			_this.COL.root.appendChild(_this.layer);
			_this.cacheCleanTime = 0;
			_this.danmakuMoveTime = 0;
			//this._clearRange=[0,0];
			_this.options = {
				allowLines: false, //allow multi-line danmaku
				screenLimit: 0, //the most number of danmaku on the screen
				clearWhenTimeReset: true };
			return _this;
		}

		_createClass(Text2D, [{
			key: 'start',
			value: function start() {
				this.paused = false;
				this.resetTimeOfDanmakuOnScreen();
			}
		}, {
			key: 'pause',
			value: function pause() {
				this.paused = true;
			}
		}, {
			key: 'stop',
			value: function stop() {
				this.COL.clear(); //clear the canvas
			}
		}, {
			key: 'load',
			value: function load(d) {
				if (!d || d._ !== 'text') {
					return false;
				}
				var ind = dichotomy(this.list, d.time, 0, this.list.length - 1, false);
				this.list.splice(ind, 0, d);
				if (ind <= this.indexMark) this.indexMark++;
				return true;
			}
		}, {
			key: 'loadList',
			value: function loadList(danmakuArray) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = danmakuArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var d = _step.value;

						this.load(d);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
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
			key: 'resetTunnel',
			value: function resetTunnel() {
				this.tunnels = {
					right: [],
					left: [],
					bottom: [],
					top: []
				};
			}
		}, {
			key: 'draw',
			value: function draw() {
				if (!this.enabled) return;
				//find danmaku from indexMark to current time
				var cTime = this.frame.time,
				    cHeight = this.COL.canvas.height,
				    cWidth = this.COL.canvas.width,
				    ctx = this.COL.context;
				var t = void 0,
				    d = void 0;
				if (this.list.length) for (; this.list[this.indexMark].time <= cTime; this.indexMark++) {
					//add new danmaku
					if (this.options.screenLimit > 0 && this.layer.childNodes.length >= this.options.screenLimit) break; //break if the number of danmaku on screen has up to limit
					if (document.hidden) continue;
					d = this.list[this.indexMark];
					t = this.COL_GraphCache.length ? this.COL_GraphCache.shift() : new this.COL.class.TextGraph();
					t.onoverCheck = false;
					t.danmaku = d;
					t.drawn = false;
					t.text = this.allowLines ? d.text : d.text.replace(/\n/g, ' ');
					t.time = cTime;
					t.font = Object.create(this.defaultStyle);
					Object.assign(t.font, d.style);
					t.style.opacity = t.font.opacity;

					t.prepare();
					//find tunnel number
					var size = t.style.height,
					    tnum = this.getTunnel(d.tunnel, size);
					t.tunnelNumber = tnum;
					//calc margin
					var margin = (tnum < 0 ? 0 : tnum) % cHeight;
					t.style.setPositionPoint(t.style.width / 2, 0);
					switch (d.tunnel) {
						case 0:case 1:case 3:
							{
								t.style.top = margin;break;
							}
						case 2:
							{
								t.style.top = cHeight - margin;
							}
					}

					tunnel[tnum] = t.style.top + size > cHeight ? cHeight - t.style.top - 1 : size;
					this.layer.appendChild(t);
				}

				//const cRange=this._clearRange;
				//calc all danmaku's position
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.layer.childNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						t = _step2.value;

						this.danmakuMoveTime = cTime;
						if (t.drawn) {
							ctx.clearRect(t.style.x - t.estimatePadding, t.style.y - t.estimatePadding, t._cache.width, t._cache.height);
						} else {
							t.drawn = true;
						}

						switch (t.danmaku.tunnel) {
							case 0:case 1:
								{
									var direc = t.danmaku.tunnel;
									t.style.x = (direc ? cWidth + t.style.width / 2 : -t.style.width / 2) + (direc ? -1 : 1) * this.frame.rate * 520 * (cTime - t.time) / t.font.speed / 1000;
									if (direc || t.style.x < -t.style.width || direc && t.style.x > cWidth + t.style.width) {
										//go out the canvas
										this.removeText(t);
									} else if (t.tunnelNumber >= 0 && (direc || t.style.x + t.style.width / 2 + 30 < cWidth || direc && t.style.x - t.style.width / 2 > 30)) {
										delete this.tunnels[tunnels[t.danmaku.tunnel]][t.tunnelNumber];
										t.tunnelNumber = -1;
									}
									break;
								}
							case 2:case 3:
								{
									t.style.x = cWidth / 2;
									if (cTime - t.time > t.font.speed * 1000 / this.frame.rate) {
										this.removeText(t);
									}
								}
						}
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				this.COL.draw();
				//clean cache
				if (Date.now() - this.cacheCleanTime > 5000) {
					this.cacheCleanTime = Date.now();
					if (this.COL_GraphCache.length > 20) {
						//save 20 cached danmaku
						for (var ti = 0; ti < this.COL_GraphCache.length; ti++) {
							if (Date.now() - this.COL_GraphCache[ti].removeTime > 10000) {
								//delete cache which has live over 10s
								this.COL_GraphCache.splice(ti, 1);
							} else {
								break;
							}
						}
					}
				}
			}
		}, {
			key: 'getTunnel',
			value: function getTunnel(tid, size) {
				//get the tunnel index that can contain the danmaku of the sizes
				var tunnel = this.tunnels[tunnels[tid]],
				    tnum = -1,
				    ti = 0,
				    cHeight = this.COL.canvas.height;
				if (size > cHeight) return -1;

				while (tnum < 0) {
					for (var i2 = 0; i2 < size; i2++) {
						if (tunnel[ti + i2] !== undefined) {
							//used
							ti += i2 + tunnel[ti + i2];
							break;
						} else if ((ti + i2) % cHeight === 0) {
							//new page
							ti += i2;
							break;
						} else if (i2 === size - 1) {
							//get
							tnum = ti;
							break;
						}
					}
				}
				return tnum;
			}
		}, {
			key: 'removeText',
			value: function removeText(t) {
				//remove the danmaku from screen
				this.layer.removeChild(t);
				t.danmaku = null;
				t.tunnelNumber >= 0 && delete this.tunnels[tunnels[t.danmaku.tunnel]][t.tunnelNumber];
				t.removeTime = Date.now();
				this.COL_GraphCache.push(t);
			}
		}, {
			key: 'resize',
			value: function resize() {
				this.draw();
			}
		}, {
			key: 'clear',
			value: function clear() {
				//clear danmaku on the screen
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = this.layer.childNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						t = _step3.value;

						if (t.danmaku) this.removeText(t);
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}

				this.resetTunnel();
			}
		}, {
			key: 'time',
			value: function time(t) {
				//reset time,you should invoke it when the media has seeked to another time
				this.indexMark = dichotomy(this.list, t, 0, this.list.length - 1, true);
				if (this.options.clearWhenTimeReset) {
					this.clear();
				} else {
					this.resetTimeOfDanmakuOnScreen();
				}
			}
		}, {
			key: 'resetTimeOfDanmakuOnScreen',
			value: function resetTimeOfDanmakuOnScreen() {
				//cause the position of the danmaku is based on time
				//and if you don't want these danmaku on the screen to disappear,their time should be reset
				var cTime = Date.now();
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = this.layer.childNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var _t = _step4.value;

						if (!_t.danmaku) continue;
						_t.time = cTime - (this.danmakuMoveTime - _t.time);
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
			}
		}, {
			key: 'danmakuAt',
			value: function danmakuAt(x, y) {
				//return a list of danmaku which is over this position
				var list = [];
				if (!this.enabled) return list;
				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = this.layer.childNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var _t2 = _step5.value;

						if (!_t2.danmaku) continue;
						if (_t2.x <= x && _t2.x + _t2.style.width >= x && _t2.y <= y && _t2.y + _t2.style.height >= y) list.push(_t2.danmaku);
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}

				return list;
			}
		}, {
			key: 'enable',
			value: function enable() {
				//enable the plugin
				this.layer.style.hidden = false;
				this.canvas.hidden = false;
			}
		}, {
			key: 'disable',
			value: function disable() {
				//disable the plugin
				this.layer.style.hidden = true;
				this.canvas.hidden = false;
				this.clear();
			}
		}]);

		return Text2D;
	}(DanmakuFrameModule);

	var tunnels = ['right', 'left', 'bottom', 'top'];

	function dichotomy(arr, t, start, end, position) {
		if (arr.length === 0) return -1;
		var m = void 0;
		while (start <= end) {
			m = start + end >> 1;
			if (t <= arr[m].time) start = m;else end = m - 1;
		}
		if (position === true) {
			//top
			while (arr[start - 1] && arr[start - 1].time === arr[start].time) {
				start--;
			}
		} else if (position === false) {
			//end
			while (arr[start + 1] && arr[start + 1].time === arr[start].time) {
				start++;
			}
		}

		return start;
	}

	DanmakuFrame.addModule('text2d', Text2D);
};

exports.default = init;

},{"../lib/COL/CanvasObjLibrary.js":4}],6:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _i18n = require('./i18n.js');

var _Object2HTML = require('../lib/Object2HTML/Object2HTML.js');

var _Object2HTML2 = _interopRequireDefault(_Object2HTML);

var _ResizeSensor = require('../lib/danmaku-frame/lib/ResizeSensor.js');

var _ResizeSensor2 = _interopRequireDefault(_ResizeSensor);

var _NyaPCore = require('./NyaPCore.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = _i18n.i18n._;

//NyaP options
var NyaPOptions = {
	autoHideDanmakuInput: true, //hide danmakuinput after danmaku sent
	danmakuColors: ['fff', '6cf', 'ff0', 'f00', '0f0', '00f', 'f0f', '000'], //colors in the danmaku style pannel
	danmakuModes: [0, 3, 2, 1], //0:right	1:left	2:bottom	3:top
	defaultDanmakuColor: null, //when the color inputed is invalid,this color will be applied
	defaultDanmakuMode: 0, //right
	danmakuSend: function danmakuSend(d, callback) {
		callback(false);
	}, //the func for sending danmaku
	danmakuSizes: [25, 30, 45],
	defaultDanmakuSize: 30

};

//normal player

var NyaP = function (_NyaPlayerCore) {
	_inherits(NyaP, _NyaPlayerCore);

	function NyaP(opt) {
		_classCallCheck(this, NyaP);

		var _this = _possibleConstructorReturn(this, (NyaP.__proto__ || Object.getPrototypeOf(NyaP)).call(this, Object.assign({}, NyaPOptions, opt)));

		opt = _this.opt;
		var NP = _this;
		var $ = _this.eles = {};
		_this._.playerMode = 'normal';
		var video = _this.video;
		var icons = {
			play: [30, 30, '<path d="m10.063,8.856l9.873,6.143l-9.873,6.143v-12.287z" stroke-width="3" stroke-linejoin="round"/>'],
			addDanmaku: [30, 30, '<path stroke-width="1.5" d="m20.514,20.120l0.551,-1.365l2.206,-0.341l-2.757,1.706h-13.787v-10.240h16.544v8.533" stroke-linejoin="round"/>' + '<path style="fill-opacity:1;stroke-width:0" d="m12.081,13.981h1.928v-1.985h1.978v1.985h1.928v2.036h-1.928v1.985h-1.978v-1.985h-1.928v-2.036z"/>'],
			danmakuStyle: [30, 30, '<path style="fill-opacity:1!important" d="m21.781,9.872l-1.500,-1.530c-0.378,-0.385 -0.997,-0.391 -1.384,-0.012l-0.959,0.941l2.870,2.926l0.960,-0.940c0.385,-0.379 0.392,-0.998 0.013,-1.383zm-12.134,7.532l2.871,2.926l7.593,-7.448l-2.872,-2.927l-7.591,7.449l0.000,0.000zm-1.158,2.571l-0.549,1.974l1.984,-0.511l1.843,-0.474l-2.769,-2.824l-0.509,1.835z" stroke-width="0"/>'],
			fullPage: [30, 30, '<path stroke-linejoin="round" d="m11.166,9.761l-5.237,5.239l5.237,5.238l1.905,-1.905l-3.333,-3.333l3.332,-3.333l-1.904,-1.906zm7.665,0l-1.903,1.905l3.332,3.333l-3.332,3.332l1.903,1.905l5.238,-5.238l-5.238,-5.237z" stroke-width="1.3" />'],
			fullScreen: [30, 30, '<rect stroke-linejoin="round" height="11.169" width="17.655" y="9.415" x="6.172" stroke-width="1.5"/>' + '<path stroke-linejoin="round" d="m12.361,11.394l-3.604,3.605l3.605,3.605l1.311,-1.311l-2.294,-2.294l2.293,-2.294l-1.311,-1.311zm5.275,0l-1.310,1.311l2.293,2.294l-2.293,2.293l1.310,1.311l3.605,-3.605l-3.605,-3.605z"/>'],
			loop: [30, 30, '<path stroke-linejoin="round" stroke-width="1" d="m14.632,10.097h5.524c2.373,0 4.297,2.147 4.297,4.796c0,1.272 -0.452,2.491 -1.258,3.391c-0.805,0.899 -1.898,1.404 -3.038,1.404h-0.613v1.370l-2.455,-2.740l2.455,-2.740v1.370h0.613c1.017,0 1.841,-0.920 1.841,-2.055c0,-1.135 -0.824,-2.055 -1.841,-2.055h-5.524v-2.740z"/>' + '<path stroke-linejoin="round" stroke-width="1" d="m15.367,19.902h-5.524c-2.373,0 -4.297,-2.147 -4.297,-4.796c0,-1.272 0.452,-2.491 1.258,-3.391c0.805,-0.899 1.898,-1.404 3.038,-1.404h0.613v-1.370l2.455,2.740l-2.455,2.740v-1.370h-0.613c-1.017,0 -1.841,0.920 -1.841,2.055c0,1.135 0.824,2.055 1.841,2.055h5.524v2.740z"/>'],
			volume: [30, 30, '<ellipse id="volume_circle" style="fill-opacity:.6!important" ry="5" rx="5" cy="15" cx="15" stroke-dasharray="32 90" stroke-width="1.8"/>'],
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
		function collectEles(ele) {
			[].slice.call(ele.querySelectorAll('*')).forEach(function (e) {
				if (e.id && !$[e.id]) $[e.id] = e;
			});
		}

		_this._.player = (0, _Object2HTML2.default)({
			_: 'div', attr: { 'class': 'NyaP' }, child: [{ _: 'div', attr: { id: 'video_frame' }, child: [video, _this.danmakuFrame.container] }, { _: 'div', attr: { id: 'control' }, child: [{ _: 'span', attr: { id: 'control_left' }, child: [icon('play', { click: function click(e) {
							return _this.playToggle();
						} }, { title: _('play') })] }, { _: 'span', attr: { id: 'control_center' }, child: [{ _: 'div', prop: { id: 'progress_info' }, child: [{ _: 'span', child: [{ _: 'canvas', prop: { id: 'progress', pad: 10 } }] }, { _: 'span', prop: { id: 'time' }, child: [{ _: 'span', prop: { id: 'current_time' }, child: ['00:00'] }, '/', { _: 'span', prop: { id: 'total_time' }, child: ['00:00'] }] }] }, { _: 'div', prop: { id: 'danmaku_input_frame' }, child: [{ _: 'span', prop: { id: 'danmaku_style' }, child: [{ _: 'div', attr: { id: 'danmaku_style_pannel' }, child: [{ _: 'div', attr: { id: 'danmaku_color_box' } }, { _: 'input', attr: { id: 'danmaku_color', placeholder: _('hex color'), maxlength: "6" } }, { _: 'span', attr: { id: 'danmaku_mode_box' } }, { _: 'span', attr: { id: 'danmaku_size_box' } }] }, icon('danmakuStyle')] }, { _: 'input', attr: { id: 'danmaku_input', placeholder: _('Input danmaku here') } }, { _: 'span', prop: { id: 'danmaku_submit', innerHTML: _('Send') } }] }] }, { _: 'span', attr: { id: 'control_right' }, child: [icon('addDanmaku', { click: function click(e) {
							return _this.danmakuInput();
						} }, { title: _('danmaku input') }), icon('volume', {}, { title: _('volume($0)', '100%') }), icon('loop', { click: function click(e) {
							return _this.loop();
						} }, { title: _('loop') }),
					/*{_:'span',prop:{id:'player_settings'},child:[
     	icon('settings',{click:e=>{}},{title:_('settings')}),
     	{_:'div',attr:{id:'settings_box'},child:['poi']}
     ]},*/
					{ _: 'span', prop: { id: 'player_mode' }, child: [icon('fullPage', { click: function click(e) {
								return _this.playerMode('fullPage');
							} }, { title: _('full page') }), icon('fullScreen', { click: function click(e) {
								return _this.playerMode('fullScreen');
							} }, { title: _('full screen') })] }] }] }]
		});

		//add elements with id to eles prop
		collectEles(_this._.player);

		//danmaku sizes
		opt.danmakuSizes.forEach(function (s, ind) {
			var e = (0, _Object2HTML2.default)({ _: 'span', attr: { style: 'font-size:' + (12 + ind * 3) + 'px;', title: s }, prop: { size: s }, child: ['A'] });
			$.danmaku_size_box.appendChild(e);
		});

		//danmaku colors
		opt.danmakuColors.forEach(function (c) {
			var e = (0, _Object2HTML2.default)({ _: 'span', attr: { style: 'background-color:#' + c + ';', title: c }, prop: { color: c } });
			$.danmaku_color_box.appendChild(e);
		});

		//danmaku modes
		opt.danmakuModes.forEach(function (m) {
			$.danmaku_mode_box.appendChild(icon('danmakuMode' + m));
		});
		collectEles($.danmaku_mode_box);

		//progress
		setTimeout(function () {
			$.control.ResizeSensor = new _ResizeSensor2.default($.control, function () {
				return _this.refreshProgress();
			});
			_this.refreshProgress();
		}, 0);
		_this._.progressContext = $.progress.getContext('2d');

		//events
		(0, _NyaPCore.addEvents)(window, {
			keydown: function keydown(e) {
				switch (e.code) {
					case 'Escape':
						{
							//exit full page mode
							if (_this._.playerMode === 'fullPage') {
								_this.playerMode('normal');
							}
							break;
						}
				}
			}
		});
		var events = {
			main_video: {
				playing: function playing(e) {
					$.icon_span_play.classList.add('active_icon');
				},
				pause: function pause(e) {
					$.icon_span_play.classList.remove('active_icon');
				},
				stalled: function stalled(e) {
					$.icon_span_play.classList.remove('active_icon');
				},
				timeupdate: function timeupdate(e, notevent) {
					if (Date.now() - _this._.lastTimeUpdate < 30) return;
					$.current_time.innerHTML = (0, _NyaPCore.formatTime)(video.currentTime, video.duration);
					_this.drawProgress();
					_this._.lastTimeUpdate = Date.now();
					notevent || setTimeout(events.main_video.timeupdate, 250, null, true); //for smooth progress bar
				},
				loadedmetadata: function loadedmetadata(e) {
					$.total_time.innerHTML = (0, _NyaPCore.formatTime)(video.duration, video.duration);
				},
				volumechange: function volumechange(e) {
					(0, _NyaPCore.setAttrs)($.volume_circle, { 'stroke-dasharray': video.volume * 10 * Math.PI + ' 90', style: 'fill-opacity:' + (video.muted ? .2 : .6) + '!important' });
					$.icon_span_volume.setAttribute('title', _('volume($0)', video.muted ? _('muted') : (video.volume * 100 | 0) + '%'));
				},
				progress: function progress(e) {
					_this.drawProgress();
				},
				_loopChange: function _loopChange(e) {
					_this.eles.icon_span_loop.classList[e.value ? 'add' : 'remove']('active_icon');
				},
				click: function click(e) {
					return _this.playToggle();
				},
				mouseup: function mouseup(e) {
					if (e.button === 2) {
						//right key
						e.preventDefault();
						_this.menu([e.layerX, e.layerY]);
					}
				},
				contextmenu: function contextmenu(e) {
					e.preventDefault();
				}
			},
			progress: {
				mousemove: function mousemove(e) {
					_this._.progressX = e.layerX;_this.drawProgress();
					var t = e.target,
					    pre = (e.layerX - t.pad) / (t.offsetWidth - 2 * t.pad);
					pre = (0, _NyaPCore.limitIn)(pre, 0, 1);
					$.total_time.innerHTML = (0, _NyaPCore.formatTime)(pre * video.duration, video.duration);
				},
				mouseout: function mouseout(e) {
					_this._.progressX = undefined;_this.drawProgress();
					$.total_time.innerHTML = (0, _NyaPCore.formatTime)(video.duration, video.duration);
				},
				click: function click(e) {
					var t = e.target,
					    pre = (e.layerX - t.pad) / (t.offsetWidth - 2 * t.pad);
					pre = (0, _NyaPCore.limitIn)(pre, 0, 1);
					video.currentTime = pre * video.duration;
				}
			},
			danmaku_color: {
				'input,change': function inputChange(e) {
					var i = e.target,
					    c = void 0;
					if (c = i.value.match(/^([\da-f]{3}){1,2}$/i)) {
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
					video.muted = !video.muted;
				},
				wheel: function wheel(e) {
					e.preventDefault();
					var v = video.volume + e.deltaY / 100;
					if (v < 0) v = 0;else if (v > 1) v = 1;
					video.volume = v;
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
					if (e.code === 'Enter') _this.send();
				}
			},
			danmaku_submit: {
				click: function click(e) {
					_this.send();
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

		$['icon_span_danmakuMode' + opt.defaultDanmakuMode].click(); //init to default danmaku mode
		(0, _NyaPCore.toArray)($.danmaku_size_box.childNodes).forEach(function (sp) {
			if (sp.size === opt.defaultDanmakuSize) sp.click();
		});

		console.debug(_this.eles);
		return _this;
	}

	_createClass(NyaP, [{
		key: 'settingsBoxToggle',
		value: function settingsBoxToggle() {
			var bool = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.eles.settings_box.style.display;

			this.eles.settings_box.style.display = bool ? 'flex' : '';
		}
	}, {
		key: 'danmakuInput',
		value: function danmakuInput() {
			var bool = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.eles.danmaku_input_frame.offsetHeight;

			var $ = this.eles;
			$.danmaku_input_frame.style.display = bool ? 'flex' : '';
			$.icon_span_addDanmaku.classList[bool ? 'add' : 'remove']('active_icon');
			bool && $.danmaku_input.focus();
		}
	}, {
		key: 'playerMode',
		value: function playerMode() {
			var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'normal';

			if (mode === 'normal' && this._.playerMode === mode) return;
			var $ = this.eles;
			if (this._.playerMode === 'fullPage') {
				this.player.style.position = '';
				$.icon_span_fullPage.classList.remove('active_icon');
			} else if (this._.playerMode === 'fullScreen') {
				$.icon_span_fullScreen.classList.remove('active_icon');
				(0, _NyaPCore.exitFullscreen)();
			}
			if (mode !== 'normal' && this._.playerMode === mode) mode = 'normal'; //back to normal mode
			switch (mode) {
				case 'fullPage':
					{
						this.player.style.position = 'fixed';
						$.icon_span_fullPage.classList.add('active_icon');
						break;
					}
				case 'fullScreen':
					{
						$.icon_span_fullScreen.classList.add('active_icon');
						(0, _NyaPCore.requestFullscreen)(this.player);
						break;
					}
			}
			this._.playerMode = mode;
			this.emit('playerModeChange', mode);
		}
	}, {
		key: 'loop',
		value: function loop() {
			var bool = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !this.video.loop;

			this.video.loop = bool;
		}
	}, {
		key: 'refreshProgress',
		value: function refreshProgress() {
			var c = this.eles.progress;
			c.width = c.offsetWidth;
			c.height = c.offsetHeight;
			this.drawProgress();
			this.emit('progressRefresh');
		}
	}, {
		key: 'send',
		value: function send() {
			var color = this._.danmakuColor || this.opt.defaultDanmakuColor,
			    content = this.eles.danmaku_input.value,
			    size = this._.danmakuSize,
			    mode = this._.danmakuMode;
		}
	}, {
		key: 'menu',
		value: function menu(name, position) {
			console.log('position', position);
			if (position) {//if position is defined,find out the danmaku at that position and enable danmaku oprion in menu

			}
		}
	}, {
		key: 'drawProgress',
		value: function drawProgress() {
			var ctx = this._.progressContext,
			    c = this.eles.progress,
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
			tr = v.buffered;
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
			var tr = v.played;
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
		}
	}]);

	return NyaP;
}(_NyaPCore.NyaPlayerCore);

window.NyaP = NyaP;

},{"../lib/Object2HTML/Object2HTML.js":1,"../lib/danmaku-frame/lib/ResizeSensor.js":2,"./NyaPCore.js":7,"./i18n.js":8}],7:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.toArray = exports.limitIn = exports.setAttrs = exports.padTime = exports.formatTime = exports.isFullscreen = exports.exitFullscreen = exports.requestFullscreen = exports.addEvents = exports.NyaPlayerCore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _danmakuFrame = require('../lib/danmaku-frame/src/danmaku-frame.js');

var _danmakuText = require('../lib/danmaku-text/src/danmaku-text.js');

var _danmakuText2 = _interopRequireDefault(_danmakuText);

var _Object2HTML = require('../lib/Object2HTML/Object2HTML.js');

var _Object2HTML2 = _interopRequireDefault(_Object2HTML);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(0, _danmakuText2.default)(_danmakuFrame.DanmakuFrame, _danmakuFrame.DanmakuFrameModule); //init text2d mod


//default options
var NyaPOptions = {
	muted: false,
	volume: 1,
	loop: false
};

var NyaPEventEmitter = function () {
	function NyaPEventEmitter() {
		_classCallCheck(this, NyaPEventEmitter);

		this._events = {};
	}

	_createClass(NyaPEventEmitter, [{
		key: 'emit',
		value: function emit(e) {
			this._resolve(e);
		}
	}, {
		key: '_resolve',
		value: function _resolve(e) {
			if (e in this._events) {
				var hs = this._events[e];
				try {
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = hs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var h = _step.value;
							h.call.apply(h, [this, e].concat(_toConsumableArray(args)));
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					;
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

		var _this = _possibleConstructorReturn(this, (NyaPlayerCore.__proto__ || Object.getPrototypeOf(NyaPlayerCore)).call(this));

		opt = _this.opt = Object.assign({}, NyaPOptions, opt);
		_this._ = {}; //for private variables
		var video = _this._.video = (0, _Object2HTML2.default)({ _: 'video', attr: { id: 'main_video' } });
		_this.danmakuFrame = new _danmakuFrame.DanmakuFrame();
		_this.danmakuFrame.enable('text2d');

		//options
		setTimeout(function (a) {
			['src', 'muted', 'volume', 'loop'].forEach(function (o) {
				//dont change the order
				opt[o] !== undefined && (_this.video[o] = opt[o]);
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
		/*addEvents(this.video,{
  	playing:()=>{
  		this.danmakuFrame.start();
  	},
  	pause:()=>{
  		this.danmakuFrame.pause();
  	},
  	stalled:()=>{
  		this.danmakuFrame.pause();
  	},
  	ratechange:()=>{
  		this.danmakuFrame.rate=this.video.playbackRate;
  	}
  });*/

		_this.emit('coreLoad');
		//this.danmakuFrame.container
		return _this;
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
			if (this.video.paused) {
				this.play();
			} else {
				this.pause();
			}
		}
	}, {
		key: 'seek',
		value: function seek(time) {
			//msec
			this.video.currentTime = time / 1000;
		}
	}, {
		key: 'addDanmaku',
		value: function addDanmaku(obj) {}
	}, {
		key: 'removeDanmaku',
		value: function removeDanmaku(obj) {}
	}, {
		key: 'Danmaku',
		value: function Danmaku(bool) {}
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
		var se = e.split(/\,/g);
		se.forEach(function (e2) {
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
	var h = void 0,
	    r = void 0,
	    s = sec | 0;
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
	if (num < min) return min;
	if (num > max) return max;
	return num;
}
function toArray(obj) {
	return [].concat(_toConsumableArray(obj));
}

//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) String.prototype.startsWith = function (searchString, position) {
	position = position || 0;
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

},{"../lib/Object2HTML/Object2HTML.js":1,"../lib/danmaku-frame/src/danmaku-frame.js":3,"../lib/danmaku-text/src/danmaku-text.js":5}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
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
	'full page': '全页模式',
	'full screen': '全屏模式',
	'volume($0)': '音量（$0）',
	'hex color': 'Hex颜色',
	'danmaku input': '弹幕输入框',
	'Input danmaku here': '在这里输入弹幕',
	'Failed to change to fullscreen mode': '无法切换到全屏模式'
};

if (!navigator.languages) {
	navigator.languages = [navigator.language];
}
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
	for (var _iterator = navigator.languages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
		var lang = _step.value;

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
} catch (err) {
	_didIteratorError = true;
	_iteratorError = err;
} finally {
	try {
		if (!_iteratorNormalCompletion && _iterator.return) {
			_iterator.return();
		}
	} finally {
		if (_didIteratorError) {
			throw _iteratorError;
		}
	}
}

console.debug('Language:' + i18n.lang);

exports.i18n = i18n;

},{}]},{},[6])

//# sourceMappingURL=NyaP.js.map
