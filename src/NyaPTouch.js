/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {i18n} from './i18n.js';
import O2H from '../lib/Object2HTML/Object2HTML.js'
import {Object2HTML} from '../lib/Object2HTML/Object2HTML.js';
import {NyaPlayerCore,
		addEvents,
		requestFullscreen,
		exitFullscreen,
		isFullscreen,
		formatTime,
		setAttrs,
		padTime,
		limitIn,
		toArray} from './NyaPCore.js';

const _=i18n._;

//NyaPTouch options
const NyaPTouchOptions={
	//autoHideDanmakuInput:true,//hide danmakuinput after danmaku sending
	danmakuColors:['fff','6cf','ff0','f00','0f0','00f','f0f','000'],//colors in the danmaku style pannel
	danmakuModes:[0,3,2,1],//0:right	1:left	2:bottom	3:top
	danmakuSizes:[20,24,36],
	dragToSeek:true,
	dragToChangeVolume:true,
}

//touch player
class NyaPTouch extends NyaPlayerCore{
	constructor(opt){
		super(Object.assign({},NyaPTouchOptions,opt));
		opt=this.opt;
		const NP=this,
			$=NP.$,
			video=NP.video;

		const icons={
		}
		function icon(name,event,attr={}){
			const ico=icons[name];
			return O2H({_:'span',event,attr,prop:{id:`icon_span_${name}`,
				innerHTML:`<svg height=${ico[1]} width=${ico[0]} id="icon_${name}"">${ico[2]}</svg>`}});
		}
		NP.loadingInfo(_('Creating player'));

		NP._.player=Object2HTML({
			_:'div',attr:{class:'NyaPTouch',id:'NyaPTouch'},child:[
				NP.videoFrame,
				{_:'div',attr:{id:'controls'},child:[

				]},
				{_:'div',attr:{id:'msg_box'}}
			]
		});

		NP.collectEles(NP._.player);

		Object.assign(NP._,{
			currentDragMode:null,
			touchStartPoint:[0,0],
		});

		//add touch drag event to video
		extendEvent.touchdrag($.main_video,{allowMultiTouch:false,preventDefaultX:true});

		//events
		//todo:上下滑变音量
		//左右滑拖进度条，拖进度条时和初始纵向位置越远就跨度越大
		//双击播放暂停
		//单击显隐控制界面
		const events={
			main_video:{
				click:e=>{
					e.preventDefault();
					NP.playToggle();
				},
				touchstart:e=>{
					let T=e.changedTouches[0];
					if(NP._.currentDragMode)return;
					NP._.touchStartPoint=[T.clientX,T.clientY];
				},
				touchdrag:e=>{
					if(!NP._.currentDragMode){//make sure the drag mode:seek,volume
						if(opt.dragToSeek&&Math.abs(e.deltaX)>Math.abs(e.deltaY)){//seek
							NP._.currentDragMode='seek';
							NP._.seekTo=video.currentTime;
						}
					}
					switch(NP._.currentDragMode){
						case 'volume':{
							video.volume=limitIn(video.volume-e.deltaY/200,0,1);
							break;
						}
						case 'seek':{
							let mu=Math.pow(1.016,Math.abs(e.touches[0].clientY-NP._.touchStartPoint[1]));
							NP._.seekTo=limitIn(NP._.seekTo+(e.deltaX/200)*mu,0,video.duration);
							NP.emit('seekMark',NP._.seekTo);
							break;
						}
					}
				},
				touchend:e=>{
					if(NP._.currentDragMode==='seek'){
						video.currentTime=NP._.seekTo;
					}
					NP._.currentDragMode=null;
				},
				contextmenu:e=>{
					e.preventDefault();
					if(!opt.dragToChangeVolume)return;
					NP._.currentDragMode='volume';
				},
			}
		};

		for(let eleid in $){//add events to elements
			let eves=events[eleid];
			eves&&addEvents($[eleid],eves);
		}

		if(opt.playerFrame instanceof HTMLElement)
			opt.playerFrame.appendChild(NP.player);
	}
	danmakuInput(){}
	playerMode(mode='normal'){}
	send(){}

	msg(text,type='tip'){//type:tip|info|error
		let msg=new MsgBox(text,type);
		this.$.msg_box.appendChild(msg.msg);
		requestAnimationFrame(()=>msg.show());
	}
}

class MsgBox{
	constructor(text,type){
		this.using=false;
		let msg=this.msg=O2H({_:'div',attr:{class:`msg_type_${type}`},child:[text]});
		msg.addEventListener('click',()=>this.remove());
		if(text instanceof HTMLElement)text=text.textContent;
		let texts=String(text).match(/\w+|\S/g);
		this.timeout=setTimeout(()=>this.remove(),Math.max((texts?texts.length:0)*0.6*1000,5000));
	}
	show(){
		this.msg.style.opacity=0;
		setTimeout(()=>{
			this.using=true;
			this.msg.style.opacity=1;
		},0);
	}
	remove(){
		if(!this.using)return;
		this.using=false;
		this.msg.style.opacity=0;
		if(this.timeout){
			clearTimeout(this.timeout);
			this.timeout=0;
		}
		setTimeout(()=>{
			this.msg.parentNode.removeChild(this.msg);
		},600);
	}
}

var extendEventDefaultOpt={
	touchdrag:{
		preventDefault:false,
		preventDefaultX:false,
		preventDefaultY:false,
		allowMultiTouch:false,
	},
	doubletouch:{
		preventDefault:true,
	}
}
var extendEvent={//扩展事件
	touchdrag:function(element,opt){
		let stats={};
		opt=Object.assign({},extendEventDefaultOpt.touchdrag,opt);
		element.addEventListener('touchstart',function(e){
			if(!opt.allowMultiTouch && e.changedTouches.length>1){stats={};return;}
			let ct=e.changedTouches;
			for(let t=ct.length;t--;){
				stats[ct[t].identifier]=[ct[t].clientX,ct[t].clientY];
			}
		});
		element.addEventListener('touchmove',function(e){
			if(!opt.allowMultiTouch && e.touches.length>1){return;}
			let ct=e.changedTouches;
			for(let t=ct.length;t--;){
				let id=ct[t].identifier;
				if(!id in stats)continue;//不属于这个元素的事件
				let event=new TouchEvent('touchdrag',e);
				event.deltaX=ct[t].clientX-stats[id][0];
				event.deltaY=ct[t].clientY-stats[id][1];
				stats[id]=[ct[t].clientX,ct[t].clientY];
				if(opt.preventDefault
					||(opt.preventDefaultX && Math.abs(event.deltaX)>Math.abs(event.deltaY))
					||(opt.preventDefaultY && Math.abs(event.deltaX)<Math.abs(event.deltaY))){
					e.preventDefault();
				}
				element.dispatchEvent(event);
			}
		});
	},
	doubletouch:function(element,opt){
		let lastTouches=[],lastStartTime=0,fired=false,checking=false,started=false;
		opt=Object.assign({},extendEventDefaultOpt.doubletouch,opt);
		element.addEventListener('touchstart',function(e){
			let Ts=(e.touches.length>1)?toArray(e.touches):[e.touches[0]],lT=lastTouches;
			lastTouches=Ts;
			if(!started){
				lastStartTime=e.timeStamp;
				started=true;
			}else if(e.timeStamp-lastStartTime>400){
				started=false;
				return;
			}
			if(Ts.length!==lT.length || !checking)return;
			let lP=[];
			for(let i=Ts.length;i--;)
				lP.push([lT[i].clientX,lT[i].clientY]);
			for(let i=Ts.length;i--;){
				for(let i2=lP.length;i2--;){
					if(lineLength(Ts[i].clientX,Ts[i].clientY,lP[i2][0],lP[i2][1])<=6){
						lP.splice(i2,1);
					}
				}
			}
			if(lP.length!==0)return;
			if(opt.preventDefault)e.preventDefault();
			let event=new TouchEvent('doubletouch',e);
			event.points=Ts.length;
			element.dispatchEvent(event);
			started=checking=false;
			fired=true;
		});
		element.addEventListener('touchend',function(e){
			if(e.touches.length===0 && !fired){
				checking=true;
			}
			fired=false;
		});
		return listeners;
	}
}

function lineLength(ax,ay,bx,by){
	return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
}


window.NyaPTouch=NyaPTouch;
