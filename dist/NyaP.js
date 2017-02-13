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

function Object2HTML(obj) {
	var ele = void 0,
	    o = void 0,
	    e = void 0;
	if ('_' in obj === false) return;
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

				e = Object2HTML(o);
				e instanceof HTMLElement && ele.appendChild(e);
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
	return ele;
}

exports.Object2HTML = Object2HTML;

},{}],2:[function(require,module,exports){
/*
MIT LICENSE
Copyright (c) 2016 iTisso
https://github.com/iTisso/CanvasObjLibrary
varsion:2.0
*/
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
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
						lineHeight: 18,
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
			key: 'generateGraphID',
			value: function generateGraphID() {
				return ++this.tmp.graphID;
			}
		}, {
			key: 'adjustCanvas',
			value: function adjustCanvas() {
				var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.canvas.offsetWidth;
				var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.canvas.offsetHeight;

				this.root.style.width = this.canvas.width = width;
				this.root.style.height = this.canvas.height = height;
				var ce = new this.class.Event('resize');
				this.root.emit(ce);
			}
		}, {
			key: '_commonEventHandle',
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
			key: 'clear',
			value: function clear() {
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}
		}, {
			key: 'draw',
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
			key: 'traverseGraphTree',
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
			key: 'drawDebug',
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
			key: 'drawGraph',
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
					key: 'stopPropagation',
					value: function stopPropagation() {
						this.propagation = false;
					}
				}, {
					key: 'stopImmediatePropagation',
					value: function stopImmediatePropagation() {
						this.stoped = true;
					}
				}, {
					key: 'altKey',
					get: function get() {
						return this.originEvent.altKey;
					}
				}, {
					key: 'ctrlKey',
					get: function get() {
						return this.originEvent.ctrlKey;
					}
				}, {
					key: 'metaKey',
					get: function get() {
						return this.originEvent.metaKey;
					}
				}, {
					key: 'shiftKey',
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
					key: 'button',
					get: function get() {
						return this.originEvent.button;
					}
				}, {
					key: 'buttons',
					get: function get() {
						return this.originEvent.buttons;
					}
				}, {
					key: 'movementX',
					get: function get() {
						return host.stat.mouse.x - host.stat.previousX;
					}
				}, {
					key: 'movementY',
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
					key: 'deltaX',
					get: function get() {
						return this.originEvent.deltaX;
					}
				}, {
					key: 'deltaY',
					get: function get() {
						return this.originEvent.deltaY;
					}
				}, {
					key: 'deltaZ',
					get: function get() {
						return this.originEvent.deltaZ;
					}
				}, {
					key: 'deltaMode',
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
					key: 'key',
					get: function get() {
						return this.originEvent.key;
					}
				}, {
					key: 'code',
					get: function get() {
						return this.originEvent.code;
					}
				}, {
					key: 'repeat',
					get: function get() {
						return this.originEvent.repeat;
					}
				}, {
					key: 'keyCode',
					get: function get() {
						return this.originEvent.keyCode;
					}
				}, {
					key: 'charCode',
					get: function get() {
						return this.originEvent.charCode;
					}
				}, {
					key: 'location',
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
					key: 'emit',
					value: function emit(e) {
						if (e instanceof host.class.Event === false) return;
						e.target = this;
						this._resolve(e);
					}
				}, {
					key: '_resolve',
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
					key: 'on',
					value: function on(name, handle) {
						if (!(handle instanceof Function)) return;
						if (!(name in this._events)) this._events[name] = [];
						this._events[name].push(handle);
					}
				}, {
					key: 'removeEvent',
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
					key: 'inhertGraph',
					value: function inhertGraph(graph) {
						//inhert a graph's style
						if (!(graph instanceof host.class.Graph)) throw new TypeError('graph is not a Graph instance');
						this.inhertStyle(graph.style);
						return true;
					}
				}, {
					key: 'inhertStyle',
					value: function inhertStyle(style) {
						if (!(style instanceof host.class.GraphStyle)) throw new TypeError('graph is not a Graph instance');
						this.__proto__ = style;
						return true;
					}
				}, {
					key: 'inhert',
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
					key: 'cancelInhert',
					value: function cancelInhert() {
						this.__proto__ = Object.prototype;
					}
				}, {
					key: 'getPoint',
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
					key: 'position',
					value: function position(x, y) {
						this.x = x;
						this.y = y;
					}
				}, {
					key: 'zoom',
					value: function zoom(x, y) {
						if (arguments.length == 1) {
							this.zoomX = this.zoomY = x;
						} else {
							this.zoomX = x;
							this.zoomY = y;
						}
					}
				}, {
					key: 'size',
					value: function size(w, h) {
						this.width = w;
						this.height = h;
					}
				}, {
					key: 'setRotatePoint',
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
					key: 'setPositionPoint',
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
					key: 'setZoomPoint',
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
					key: 'setSkewPoint',
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
					key: 'createShadow',
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
					key: 'appendChild',
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
					key: 'insertAfter',
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
					key: 'insertBefore',
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
					key: 'findChild',
					value: function findChild(graph) {
						for (var i = this.childNodes.length; i--;) {
							if (this.childNodes[i] === graph) return i;
						}return -1;
					}
				}, {
					key: 'removeChild',
					value: function removeChild(graph) {
						var i = this.findChild(graph);
						if (i < 0) return;
						this.childNodes.splice(i, 1);
						Object.defineProperty(this, 'parentNode', {
							value: undefined
						});
					}
				}, {
					key: 'checkIfOnOver',
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
					key: 'delete',
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
					key: 'drawer',
					value: function drawer(ct) {
						//onover point check
						this.checkIfOnOver(true);
					}
				}, {
					key: 'hitRange',
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
					key: 'use',
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
					key: 'resetStyleSize',
					value: function resetStyleSize() {
						this.style.width = this.width;
						this.style.height = this.height;
					}
				}, {
					key: 'drawer',
					value: function drawer(ct) {
						//onover point check
						//ct.beginPath();
						ct.drawImage(this.image, 0, 0);
						this.checkIfOnOver(true);
					}
				}, {
					key: 'hitRange',
					value: function hitRange(ct) {
						ct.beginPath();
						ct.rect(0, 0, this.style.width, this.style.height);
					}
				}, {
					key: 'width',
					get: function get() {
						if (this.image instanceof Image) return this.image.naturalWidth;
						if (this.image instanceof HTMLCanvasElement) return this.image.width;
						return 0;
					}
				}, {
					key: 'height',
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
					key: 'draw',
					value: function draw(func) {
						if (this.autoClear) this.context.clearRect(0, 0, this.width, this.height);
						func(this.context);
					}
				}, {
					key: 'width',
					set: function set(w) {
						this.image.width = w;
					}
				}, {
					key: 'height',
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
					key: 'prepare',
					value: function prepare() {
						//prepare text details
						if (!this._cache && !this.realtimeRender) {
							Object.defineProperty(this, '_cache', { value: document.createElement("canvas") });
						}
						var font = "";
						this.font.fontStyle && (font = this.font.fontStyle);
						this.font.fontVariant && (font = font + ' ' + this.font.fontVariant);
						this.font.fontWeight && (font = font + ' ' + this.font.fontWeight);
						font = font + ' ' + this.font.fontSize + 'px';
						this.font.fontFamily && (font = font + ' ' + this.font.fontFamily);
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
					key: 'render',
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
					key: 'drawer',
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
					key: 'hitRange',
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

	window.CanvasObjLibrary = CanvasObjLibrary;

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
})();

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


require('../lib/COL/CanvasObjLibrary.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

'use strict';

var DanmakuFrame = function () {
	function DanmakuFrame(canvas) {
		_classCallCheck(this, DanmakuFrame);

		if (canvas && canvas instanceof HTMLCanvasElement === false) throw 'The first arg should be a canvas or empty';
		this.canvas = canvas || document.createElement('canvas'); //the canvas
		this.context2d = this.canvas.getContext('2d'); //the canvas context
		this.COL = new CanvasObjLibrary(this.canvas); //the library

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
			return true;
		}
	}, {
		key: 'load',
		value: function load(danmakuObj) {
			for (var m in this.modules) {
				this.modules[m].load && this.modules[m].load(danmakuObj);
			}
		}
	}, {
		key: 'loadList',
		value: function loadList(danmakuArray) {
			for (var m in this.modules) {
				this.modules[m].loadList && this.modules[m].loadList(danmakuObj);
			}
		}
	}, {
		key: 'unload',
		value: function unload(danmakuObj) {
			for (var m in this.modules) {
				this.modules[m].unload && this.modules[m].unload(danmakuObj);
			}
		}
	}, {
		key: 'start',
		value: function start() {
			this.working = true;
			for (var m in this.modules) {
				this.modules[m].start && this.modules[m].start();
			}this.draw();
		}
	}, {
		key: 'pause',
		value: function pause() {
			this.working = false;
			for (var m in this.modules) {
				this.modules[m].pause && this.modules[m].pause();
			}
		}
	}, {
		key: 'stop',
		value: function stop() {
			this.working = false;
			for (var m in this.modules) {
				this.modules[m].stop && this.modules[m].stop();
			}this.COL.clear(); //clear the canvas
		}
	}, {
		key: 'draw',
		value: function draw() {
			var _this = this;

			if (this.working === false) return;
			if (this.fps === 0) {
				requestAnimationFrame(function () {
					_this.draw();
				});
			} else {
				setTimeout(function () {
					_this.draw();
				}, 1000 / this.fps);
			}
			for (var m in this.modules) {
				this.modules[m].draw && this.modules[m].draw();
			}this.COL.draw();
		}
	}, {
		key: 'time',
		set: function set(t) {
			//current media time (ms)
			this.media || (this.timeBase = Date.now() - t);
			for (var m in this.modules) {
				//let all mods know when the time be set
				this.modules[m].time && this.modules[m].time(t);
			}
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

},{"../lib/COL/CanvasObjLibrary.js":2}],4:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license

danmaku-frame text2d mod
*/
'use strict';
/*
danmaku position is based on time
*/

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
			_this.COL_GraphCache = []; //COL text graph cache
			_this.layer = new _this.frame.COL.class.FunctionGraph(); //text layer
			_this.frame.COL.root.appendChild(_this.layer);
			_this.cacheCleanTime = 0;
			_this.danmakuMoveTime = 0;
			_this.options = {
				allowLines: false, //allow multi-line danmaku
				screenLimit: 0, //the most number of danmaku on the screen
				clearWhenTimeReset: true };
			return _this;
		}

		_createClass(Text2D, [{
			key: "start",
			value: function start() {
				this.paused = false;
				this.resetTimeOfDanmakuOnScreen();
			}
		}, {
			key: "pause",
			value: function pause() {
				this.paused = true;
			}
		}, {
			key: "load",
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
			key: "loadList",
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
			key: "unload",
			value: function unload(d) {
				if (!d || d._ !== 'text') return false;
				var i = this.list.indexOf(d);
				if (i < 0) return false;
				this.list.splice(i, 1);
				if (i < this.indexMark) this.indexMark--;
				return true;
			}
		}, {
			key: "resetTunnel",
			value: function resetTunnel() {
				this.tunnels = {
					right: [],
					left: [],
					bottom: [],
					top: []
				};
			}
		}, {
			key: "draw",
			value: function draw() {
				if (!this.enabled || this.paused) return;
				//find danmaku from indexMark to current time
				var cTime = this.frame.time,
				    cHeight = this.frame.COL.canvas.height,
				    cWidth = this.frame.COL.canvas.width;
				var t = void 0,
				    d = void 0;
				for (; this.list[this.indexMark].time <= cTime; this.indexMark++) {
					//add new danmaku
					if (this.layer.childNodes.length >= this.options.screenLimit) break; //break if the number of danmaku on screen has up to limit
					d = this.list[this.indexMark];
					t = this.COL_GraphCache.length ? this.COL_GraphCache.shift() : new this.frame.COL.class.TextGraph();
					t.onoverCheck = false;
					t.danmaku = d;
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
				//calc all danmaku's position
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.layer.childNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						t = _step2.value;

						this.danmakuMoveTime = cTime;
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
					//clean cache
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
			key: "getTunnel",
			value: function getTunnel(tid, size) {
				//get the tunnel index that can contain the danmaku of the sizes
				var tunnel = this.tunnels[tunnels[tid]],
				    tnum = -1,
				    ti = 0,
				    cHeight = this.frame.COL.canvas.height;
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
			key: "removeText",
			value: function removeText(t) {
				//remove the danmaku from screen
				this.layer.removeChild(t);
				t.danmaku = null;
				t.tunnelNumber >= 0 && delete this.tunnels[tunnels[t.danmaku.tunnel]][t.tunnelNumber];
				t.removeTime = Date.now();
				this.COL_GraphCache.push(t);
			}
		}, {
			key: "clear",
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
			key: "time",
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
			key: "resetTimeOfDanmakuOnScreen",
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
			key: "danmakuAt",
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
			key: "enable",
			value: function enable() {
				//enable the plugin
				this.layer.style.hidden = false;
			}
		}, {
			key: "disable",
			value: function disable() {
				//disable the plugin
				this.layer.style.hidden = true;
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

exports.init = init;

},{}],5:[function(require,module,exports){
/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

var _danmakuFrame = require('../lib/danmaku-frame/src/danmaku-frame.js');

var _danmakuText = require('../lib/danmaku-text/src/danmaku-text.js');

var _Object2HTML = require('../lib/Object2HTML/Object2HTML.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(0, _danmakuText.init)(_danmakuFrame.DanmakuFrame, _danmakuFrame.DanmakuFrameModule); //init text2d mod


var NyaP = function NyaP(opt) {
	_classCallCheck(this, NyaP);
};

},{"../lib/Object2HTML/Object2HTML.js":1,"../lib/danmaku-frame/src/danmaku-frame.js":3,"../lib/danmaku-text/src/danmaku-text.js":4}]},{},[5])

//# sourceMappingURL=NyaP.js.map
