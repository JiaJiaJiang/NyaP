/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {i18n} from './i18n.js';
import Danmaku from './danmaku.js';
import O2H from '../lib/Object2HTML/Object2HTML.js'

const _=i18n._;
window.Object2HTML=O2H;

//default options
const NyaPCoreOptions={
	muted:false,
	volume:1,
	loop:false,
	defaultDanmakuColor:null,//a hex color(without #),when the color inputed is invalid,this color will be applied
	defaultDanmakuMode:0,//right
	defaultDanmakuSize:24,
	danmakuSend:(d,callback)=>{callback(false);},//the func for sending danmaku
	textStyle:{},
	danmakuOption:{},
}


class NyaPEventEmitter{
	constructor(){
		this._events={};
	}
	emit(e,...arg){
		this._resolve(e,...arg);
		this.globalHandle(e,...arg);
	}
	_resolve(e,...arg){
		if(e in this._events){
			const hs=this._events[e];
			try{
				hs.forEach(h=>{h.apply(this,arg)});
			}catch(e){
				console.error(e);
			}
		}
	}
	addEventListener(e,handle){
		this.on(e,handle);
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
	globalHandle(name,...arg){}//所有事件会触发这个函数
}

class NyaPlayerCore extends NyaPEventEmitter{
	constructor(opt){
		super();
		opt=this.opt=Object.assign({},NyaPCoreOptions,opt);
		const $=this.$={document,window,NP:this};
		this._={
			video:O2H({_:'video',attr:{id:'main_video'}}),
			playerMode:'normal',
		};//for private variables
		this.container=O2H({_:'div',prop:{id:'danmaku_container'}});
		this.videoFrame=O2H(
			{_:'div',attr:{id:'video_frame'},child:[
				this.video,
				this.container,
				{_:'div',attr:{id:'loading_frame'},child:[
					{_:'div',attr:{id:'loading_anime'},child:['(๑•́ ω •̀๑)']},
					{_:'div',attr:{id:'loading_info'}},
				]}
			]}
		);
		this.collectEles(this.videoFrame);

		this.loadingInfo(_('Loading danmaku frame'));
		this.Danmaku=new Danmaku(this);

		this._.loadingAnimeInterval=setInterval(()=>{
			$.loading_anime.style.transform="translate("+rand(-20,20)+"px,"+rand(-20,20)+"px) rotate("+rand(-10,10)+"deg)";
		},80);

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
			Object.defineProperty(this.video,'loop',{
				get:LoopDesc.get,
				set:function(bool){
					if(bool===this.loop)return;
					this.dispatchEvent(Object.assign(new Event('_loopChange'),{value:bool}));
					LoopDesc.set.call(this,bool);
				}
			});
		}
		addEvents(this.video,{
			loadedmetadata:e=>{
				clearInterval(this._.loadingAnimeInterval);
				$.loading_frame.parentNode.removeChild($.loading_frame);
			},
			error:e=>{
				clearInterval(this._.loadingAnimeInterval);
				loading_anime.style.transform="";
				loading_anime.innerHTML='(๑• . •๑)';
			},
		});


		this.emit('coreLoad');
	}
	playToggle(Switch=this.video.paused){
		this.video[Switch?'play':'pause']();
	}
	loadingInfo(text){
		this.$.loading_info.appendChild(O2H({_:'div',child:[text]}));
	}
	collectEles(ele){
		const $=this.$;
		if(ele.id&&!$[ele.id])$[ele.id]=ele;
		toArray(ele.querySelectorAll('*')).forEach(e=>{
			if(e.id&&!$[e.id])$[e.id]=e;
		});
	}
	playerMode(mode='normal'){
		if(mode==='normal' && this._.playerMode===mode)return;
		let $=this.$;
		if(this._.playerMode==='fullPage'){
			this.player.style.position='';
		}else if(this._.playerMode==='fullScreen'){
			exitFullscreen();
		}
		if(mode!=='normal' && this._.playerMode===mode)mode='normal';//back to normal mode
		switch(mode){
			case 'fullPage':{
				this.player.style.position='fixed';
				this.player.setAttribute('playerMode','fullPage');
				break;
			}
			case 'fullScreen':{
				this.player.setAttribute('playerMode','fullScreen');
				requestFullscreen(this.player);
				break;
			}
			default:{
				this.player.setAttribute('playerMode','normal');
			}
		}
		this._.playerMode=mode;
		this.emit('playerModeChange',mode);
	}
	isFullscreen(){
		const d=document;
		return (d.webkitFullscreenElement
				||d.msFullscreenElement
				||d.mozFullScreenElement
				||d.fullscreenElement)
				==this.player;
	}
	get danmakuFrame(){return this.Danmaku.danmakuFrame;}
	get player(){return this._.player;}
	get video(){return this._.video;}
	get src(){return this.video.src;}
	set src(s){this.video.src=s;}
	get TextDanmaku(){return this.danmakuFrame.modules.TextDanmaku;}
	get videoSize(){return [this.video.videoWidth,this.video.videoHeight];}
}


//other functions

function addEvents(target,events){
	if(!Array.isArray(target))target=[target];
	for(let e in events)
		e.split(/\,/g).forEach(function(e2){
			target.forEach(function(t){
				t.addEventListener(e2,events[e])
			});
		});
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
function rand(min, max) {
	return (min+Math.random()*(max-min)+0.5)|0;
}
function toArray(obj){
	if(obj instanceof Array)return obj.slice();
	if(obj.length!==undefined)
		return Array.prototype.slice.call(obj);
	return [...obj];
}

//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if(!String.prototype.startsWith)
String.prototype.startsWith = function(searchString, position=0){
	return this.substr(position, searchString.length) === searchString;
};
//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if(!Object.assign)
Object.assign = function(target, varArgs) {
	'use strict';
	if(target==null)throw new TypeError('Cannot convert undefined or null to object');
	var to = Object(target);
	for(var index=1;index<arguments.length;index++){
		var nextSource=arguments[index];
		if(nextSource!=null){
			for(var nextKey in nextSource) {
				if(Object.prototype.hasOwnProperty.call(nextSource,nextKey)){
					to[nextKey]=nextSource[nextKey];
				}
			}
		}
	}
	return to;
};
//Polyfill Array.from
if(!Array.from)
Array.from=function(a,func){
	if(!(a instanceof Array))a=toArray(a);
	var r=new Array(a.length);
	for(var i=a.length;i--;)r[i]=func?func(a[i],i):a[i];
	return r;
};
//Polyfill Number.isInteger
if(!Number.isInteger)
Number.isInteger=function(v){
  return (v|0)===v;
};

export default NyaPlayerCore;
export {
	NyaPlayerCore,
	addEvents,
	requestFullscreen,
	exitFullscreen,
	isFullscreen,
	formatTime,
	rand,
	padTime,
	setAttrs,
	limitIn,
	toArray,
}
