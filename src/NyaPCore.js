/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {DanmakuFrame,DanmakuFrameModule,ResizeSensor} from '../lib/danmaku-frame/src/danmaku-frame.js'
import initTextDanmaku from '../lib/danmaku-text/src/danmaku-text.js'
import O2H from '../lib/Object2HTML/Object2HTML.js'


initTextDanmaku(DanmakuFrame,DanmakuFrameModule);//init TextDanmaku mod


//default options
const NyaPOptions={
	muted:false,
	volume:1,
	loop:false,
	textStyle:{},
	danmakuOption:{},
}


class NyaPEventEmitter{
	constructor(){
		this._events={};
	}
	emit(e,arg){
		this._resolve(e,arg);
	}
	_resolve(e,arg){
		if(e in this._events){
			const hs=this._events[e];
			try{
				hs.forEach(h=>{h.call(this,arg)});
			}catch(e){
				console.error(e);
			}
		}
	}
	on(e,handle){
		if(!(handle instanceof Function))return;
		if(!(e in this._events))this._events[e]=[];
		this._events[e].push(handle);
	}
	removeEvent(e,handle){
		if(!(e in this._events))return;
		if(arguments.length===1){delete this._events[e];return;}
		let ind;
		if(ind=(this._events[e].indexOf(handle))>=0)this._events[e].splice(ind,1);
		if(this._events[e].length===0)delete this._events[e];
	}
}

class NyaPlayerCore extends NyaPEventEmitter{
	constructor(opt){
		super();
		opt=this.opt=Object.assign({},NyaPOptions,opt);
		this._={};//for private variables
		const video=this._.video=O2H({_:'video',attr:{id:'main_video'}});
		this.container=O2H({_:'div',prop:{id:'danmaku_container'}});
		this.videoFrame=O2H({_:'div',attr:{id:'video_frame'},child:[video,this.container]});
		this.danmakuFrame=new DanmakuFrame(this.container);
		this.danmakuFrame.setMedia(video);
		this.danmakuFrame.enable('TextDanmaku');
		this.setDanmakuOptions(opt.danmakuOption);
		this.setDanmakuOptions(opt.textStyle);


		//options
		setTimeout(a=>{
			['src','muted','volume','loop'].forEach(o=>{//dont change the order
				(opt[o]!==undefined)&&(this.video[o]=opt[o]);
			})
		},0)

		//define events
		{
			//video:_loopChange
			let LoopDesc=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'loop');
			Object.defineProperty(video,'loop',{
				get:LoopDesc.get,
				set:function(bool){
					if(bool===this.loop)return;
					this.dispatchEvent(Object.assign(new Event('_loopChange'),{value:bool}));
					LoopDesc.set.call(this,bool);
				}
			});
		}
		
		this.emit('coreLoad');
	}
	playToggle(Switch=this.video.paused){
		this.video[Switch?'play':'pause']();
	}
	loadDanmaku(obj){
		this.danmakuFrame.load(obj);
	}
	loadDanmakuList(obj){
		this.danmakuFrame.loadList(obj);
	}
	removeDanmaku(obj){
		this.danmakuFrame.unload(obj);
	}
	danmakuToggle(bool=!this.danmakuFrame.modules.TextDanmaku.enabled){
		this.danmakuFrame[bool?'enable':'disable']('TextDanmaku');
		this.emit('danmakuToggle',bool);
	}
	danmakuAt(x,y){
		return this.danmakuFrame.modules.TextDanmaku.danmakuAt(x,y);
	}
	get player(){return this._.player;}
	get video(){return this._.video;}
	get src(){return this.video.src;}
	set src(s){this.video.src=s;}
	get TextDanmaku(){return this.danmakuFrame.modules.TextDanmaku;}
	get videoSize(){return [this.video.videoWidth,this.video.videoHeight];}
	setDefaultTextStyle(opt){
		if(opt)for(let n in opt)this.TextDanmaku.defaultStyle[n]=opt[n];
	}
	setDanmakuOptions(opt){
		if(opt)for(let n in opt)this.TextDanmaku.options[n]=opt[n];
	}
}


//other functions

function addEvents(target,events={}){
	for(let e in events)
		e.split(/\,/g).forEach(e2=>target.addEventListener(e2,events[e]));
}
function requestFullscreen(d) {
	try{
		(d.requestFullscreen||
		d.msRequestFullscreen||
		d.mozRequestFullScreen||
		d.webkitRequestFullscreen)
		.call(d);
	}catch(e){
		console.error(e)
		alert(_('Failed to change to fullscreen mode'));
	}
}
function exitFullscreen() {
	const d=document;
	(d.exitFullscreen||
	d.msExitFullscreen||
	d.mozCancelFullScreen||
	d.webkitCancelFullScreen).call(d);
}
function isFullscreen() {
	const d=document;
	return !!(d.fullscreen || d.mozFullScreen || d.webkitIsFullScreen || d.msFullscreenElement);
}
function formatTime(sec,total){
	let r,s=sec|0,h=(s/3600)|0;
	if(total>=3600)s=s%3600;
	r=[padTime((s/60)|0),padTime(s%60)];
	(total>=3600)&&r.unshift(h);
	return r.join(':');
}
function padTime(n){//pad number to 2 chars
	return n>9&&n||`0${n}`;
}
function setAttrs(ele,obj){//set multi attrs to a Element
	for(let a in obj)
		ele.setAttribute(a,obj[a])
}
function limitIn(num,min,max){//limit the number in a range
	return num<min?min:(num>max?max:num);
}
function toArray(obj){
	return [...obj];
}


//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith)
String.prototype.startsWith = function(searchString, position=0){
	return this.substr(position, searchString.length) === searchString;
};

export default NyaPlayerCore;
export {
	NyaPlayerCore,
	addEvents,
	requestFullscreen,
	exitFullscreen,
	isFullscreen,
	formatTime,
	padTime,
	setAttrs,
	limitIn,
	toArray,
	ResizeSensor,
}
