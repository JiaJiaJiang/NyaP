/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {DanmakuFrame,DanmakuFrameModule} from '../lib/danmaku-frame/src/danmaku-frame.js'
import ResizeSensor from '../lib/danmaku-frame/lib/ResizeSensor.js';
import initText2d from '../lib/danmaku-text/src/danmaku-text.js'
import {Object2HTML} from '../lib/Object2HTML/Object2HTML.js'
import {i18n} from './i18n.js';

const _=i18n._;

initText2d(DanmakuFrame,DanmakuFrameModule);//init text2d mod


//default options
const NyaPOptions={
	//touchMode:false,
}


class NyaPlayerCore{
	constructor(opt){
		this.opt=Object.assign({},NyaPOptions,opt);
		this._video=Object2HTML({_:'video',attr:{id:'main_video'}});
		this.danmakuFrame=new DanmakuFrame();
		this.danmakuFrame.enable('text2d');

		this._={};
		//this.danmakuFrame.container
	}
	play(){
		this.paused&&this.video.play();
	}
	pause(){
		this.paused||this.video.pause();
	}
	playOrPause(){
		if(this.video.paused){
			this.video.play();
		}else{
			this.video.pause();
		}
	}
	seek(time){//msec
		this.video.currentTime=time/1000;
	}
	listenVideoEvent(){
		addEvents(this.video,{
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
		});
	}
	get player(){return this._player;}
	get video(){return this._video;}
	get src(){return this.video.src;}
	set src(s){this.video.src=s;}
}

//normal player
class NyaP extends NyaPlayerCore{
	constructor(opt){
		super(opt);
		const NP=this;
		const $=this.eles={};
		this._playerMode='normal';
		const video=this.video;
		const icons={
			play:[30,30,'<path d="m10.18814,7.48238l12.08183,7.51799l-12.08183,7.51799l0,-15.03673l0,0l0,0.00074z" stroke-width="3" stroke-linejoin="round"/>'],
			addDanmaku:[30,30,'<path stroke-width="2" d="m20.514868,20.120359l0.551501,-1.365456l2.206013,-0.341365l-2.757514,1.706821l-13.787251,0l0,-10.240718l16.544766,0l0,8.533897"/>'
								+'<path style="fill-opacity:1;stroke-width:0" d="m12.081653,13.981746l1.928969,0l0,-1.985268l1.978756,0l0,1.985268l1.92897,0l0,2.036509l-1.92897,0l0,1.985268l-1.978756,0l0,-1.985268l-1.928969,0l0,-2.036509z"/>'],
			danmakuStyle:[40,30,'<path d="m29.15377,16.14291l0.02111,-2.1431c0.00509,-0.54056 -0.42875,-0.98198 -0.96992,-0.98787l-1.34434,-0.013l-0.03905,4.09902l1.34419,0.01376c0.54106,0.00467 0.98357,-0.42842 0.98801,-0.96881l0,0zm-13.90662,-3.25468l-0.03893,4.09917l10.63621,0.10205l0.03855,-4.10088l-10.63583,-0.10035l0,0zm-2.63743,0.99919l-1.78463,1.00731l1.7653,1.04142l1.63913,0.9686l0.03869,-3.9553l-1.65849,0.93797l0,0l0,0z" stroke-width="1.5"/>'],
			fullPage:[30,30,'<path d="m11.16677,9.76127l-5.23735,5.23922l5.23783,5.23825l1.90512,-1.90509l-3.33364,-3.33316l3.33295,-3.33316l-1.90491,-1.90606l0,0zm7.66526,0l-1.90374,1.90557l3.33296,3.33316l-3.33296,3.33275l1.90374,1.90508l5.23853,-5.23873l-5.23853,-5.23784z" stroke-width="1.3" />'],
			fullScreen:[30,30,'<rect height="11.1696" width="17.65517" y="9.4152" x="6.17241" stroke-width="1.5"/>'
							  +'<path d="m12.36171,11.39435l-3.6047,3.60599l3.60503,3.60532l1.31123,-1.31121l-2.29444,-2.29411l2.29396,-2.29411l-1.31109,-1.31188l0,0zm5.27576,0l-1.31028,1.31155l2.29397,2.29411l-2.29397,2.29383l1.31028,1.3112l3.60552,-3.60565l-3.60552,-3.60504z"/>'],
			loop:[30,30,'<path stroke-width="1" d="m14.63235,10.09759l5.52492,0l0,0c2.37326,0 4.29716,2.14736 4.29716,4.79625l0,0l0,0c0,1.27204 -0.45273,2.49198 -1.2586,3.39146c-0.80587,0.89946 -1.89888,1.40478 -3.03855,1.40478l-0.61387,0l0,1.37036l-2.45552,-2.74071l2.45552,-2.74071l0,1.37036l0.61387,0c1.01711,0 1.84164,-0.9203 1.84164,-2.05553l0,0l0,0c0,-1.13524 -0.82452,-2.05554 -1.84164,-2.05554l-5.52492,0l0,-2.74071z"/>'
					   +'<path stroke-width="1" d="m15.36766,19.90241l-5.52493,0l0,0c-2.37325,0 -4.29716,-2.14734 -4.29716,-4.79624l0,0l0,0c0,-1.27204 0.45273,-2.49199 1.25862,-3.39146c0.80587,-0.89948 1.89886,-1.40479 3.03854,-1.40479l0.61389,0l0,-1.37036l2.45552,2.74071l-2.45552,2.74071l0,-1.37036l-0.61389,0c-1.0171,0 -1.84164,0.9203 -1.84164,2.05554l0,0l0,0c0,1.13524 0.82454,2.05553 1.84164,2.05553l5.52493,0l0,2.74071z"/>'],
			volume:[30,30,'<ellipse id="volume_circle" style="fill-opacity:.4 !important;" ry="4.5" rx="4.5" cy="15" cx="15" stroke-dasharray="26 300" stroke-width="4"/>'
						 /* +'<ellipse id="volume_circle" style="fill-opacity:1 !important;" ry="6" rx="6" cy="15" cx="15" fill-opacity="1" stroke-width="0"/>'*/],
		}
		function icon(name,event,attr={}){
			const ico=icons[name];
			return Object2HTML({_:'span',event,attr,prop:{id:`icon_span_${name}`,
				innerHTML:`<svg height=${ico[1]} width=${ico[0]} id="icon_${name}"">${ico[2]}</svg>`}});
		}

		this._player=Object2HTML({
			_:'div',attr:{'class':'NyaP'},child:[
				{_:'div',attr:{id:'video_frame'},child:[
					video,
					this.danmakuFrame.container
				]},
				{_:'div',attr:{id:'control'},child:[
					{_:'span',attr:{id:'control_left'},child:[
						icon('play',{click:e=>this.playOrPause()},{title:_('play')}),
					]},
					{_:'span',attr:{id:'control_center'},child:[
						{_:'div',prop:{id:'progress_info'},child:[
							{_:'span',child:[
								{_:'canvas',attr:{id:'progress'}},
							]},
							{_:'span',prop:{id:'time'},child:[
								{_:'span',prop:{id:'current_time'},child:['00:00']},
								'/',
								{_:'span',prop:{id:'total_time'},child:['00:00']},
							]},
						]},
						{_:'div',prop:{id:'danmaku_input_frame'},child:[
							{_:'div',attr:{id:'danmaku_style_pannel'}},
							icon('danmakuStyle',{click:e=>this.danmakuStylePannel()}),
							{_:'input',attr:{id:'danmaku_input',placeholder:_('Input danmaku here')}},
							{_:'span',prop:{id:'danmaku_submit',innerHTML:_('Send')}},
						]}
					]},
					{_:'span',attr:{id:'control_right'},child:[
						icon('addDanmaku',{click:e=>this.danmakuInput()},{title:_('danmaku input')}),
						icon('volume',{},{title:_('volume')}),
						icon('loop',{click:e=>this.loop()},{title:_('loop')}),
						{_:'span',prop:{id:'player_mode'},child:[
							icon('fullPage',{click:e=>this.playerMode('fullPage')},{title:_('full page')}),
							icon('fullScreen',{click:e=>this.playerMode('fullScreen')},{title:_('full screen')})
						]}
					]},
				]}
			]
		});

		//add elements with id to eles prop
		[].slice.call(this._player.querySelectorAll('*')).forEach(e=>{
			if(e.id&&!$[e.id])$[e.id]=e;
		});

		//progress
		setTimeout(()=>{
			$.control.ResizeSensor=new ResizeSensor($.control,()=>this.refreshProgress());
			this.refreshProgress();
		},0);
		this._.progressContext=$.progress.getContext('2d');

		//events
		addEvents(window,{
			keydown:e=>{
				switch(e.code){
					case 'Escape':{//exit full page mode
						if(this._playerMode==='fullPage'){
							this.playerMode('normal');
						}
						break;
					}
				}
			}
		});
		const events={
			main_video:{
				playing:e=>{
					$.icon_span_play.classList.add('active_icon');
				},
				pause:e=>{
					$.icon_span_play.classList.remove('active_icon');
				},
				stalled:e=>{
					$.icon_span_play.classList.remove('active_icon');
				},
				timeupdate:(e,notevent)=>{
					if(Date.now()-this._.lastTimeUpdate <30)return;
					if(this._.progressX===undefined)$.current_time.innerHTML=formatTime(video.currentTime,video.duration);
					this.drawProgress();
					this._.lastTimeUpdate=Date.now();
					notevent||setTimeout(events.main_video.timeupdate,250,null,true);
				},
				loadedmetadata:e=>{
					$.total_time.innerHTML=formatTime(video.duration,video.duration);
				},
				volumechange:e=>{
					$.volume_circle.setAttribute('stroke-dasharray',`${video.volume*28.2744} 300`);
					$.volume_circle.setAttribute('style',`fill-opacity:${video.muted?0:0.4} !important;`);
				},
				progress:e=>{this.drawProgress();},
			},
			progress:{
				mousemove:e=>{
					this._.progressX=e.layerX;this.drawProgress();
					$.current_time.innerHTML=formatTime(e.layerX/e.target.offsetWidth*video.duration,video.duration);
				},
				mouseout:e=>{
					this._.progressX=undefined;this.drawProgress();
					$.current_time.innerHTML=formatTime(video.currentTime,video.duration);
				},
				click:e=>{
					video.currentTime=e.layerX/e.target.offsetWidth*video.duration;
				}
			},
			danmaku_container:{
				click:e=>this.playOrPause(),
			},
			icon_span_volume:{
				click:e=>{
					video.muted=!video.muted;
				},
				wheel:e=>{
					e.preventDefault();
					let v=video.volume+(e.deltaY/100);
					if(v<0)v=0;else if(v>1)v=1;
					video.volume=v;
				}
			}
		}
		for(let eleid in events){//add events to elements
			addEvents($[eleid],events[eleid]);
		}

		console.debug(this.eles)
	}
	danmakuInput(bool=!this.eles.danmaku_input_frame.offsetHeight){
		let $=this.eles;
		$.danmaku_input_frame.style.display=bool?'flex':'';
		$.icon_span_addDanmaku.classList[bool?'add':'remove']('active_icon');
		bool&&$.danmaku_input.focus();
	}
	playerMode(mode='normal'){
		if(mode==='normal' && this._playerMode===mode)return;
		let $=this.eles;
		if(this._playerMode==='fullPage'){
			this.player.style.position='';
			$.icon_span_fullPage.classList.remove('active_icon');
		}else if(this._playerMode==='fullScreen'){
			$.icon_span_fullScreen.classList.remove('active_icon');
			exitFullscreen();
		}
		if(mode!=='normal' && this._playerMode===mode)mode='normal';//back to normal mode
		switch(mode){
			case 'fullPage':{
				this.player.style.position='fixed';
				$.icon_span_fullPage.classList.add('active_icon');
				break;
			}
			case 'fullScreen':{
				$.icon_span_fullScreen.classList.add('active_icon');
				requestFullscreen(this.player);
				break;
			}
		}
		this._playerMode=mode;
	}
	loop(bool){
		if(bool===undefined)
			bool=!this.video.loop;
		this.eles.icon_span_loop.classList[bool?'add':'remove']('active_icon');
		this.video.loop=bool;
	}
	refreshProgress(){
		const c=this.eles.progress;
		c.width=c.offsetWidth;
		c.height=c.offsetHeight;
		this.drawProgress();
	}
	drawProgress(){
		const ctx=this._.progressContext,
				c=this.eles.progress,
				w=c.width,
				h=c.height,
				v=this.video,
				d=v.duration,
				cT=v.currentTime;
		ctx.clearRect(0,0,w,h);
		ctx.lineCap = "round";
		//already played
		ctx.beginPath();
		ctx.strokeStyle = '#888ead';
		ctx.lineWidth = 5;
		let tr = v.played;
		for (var i = tr.length;i--;) {
			ctx.moveTo(tr.start(i) / d * w, 9);
			ctx.lineTo(tr.end(i) / d * w, 9);
			
		}
		ctx.stroke();
		//progress
		ctx.beginPath();
		ctx.lineWidth = 7;
		ctx.moveTo(0,13);
		ctx.lineTo(w*cT/d,13);
		ctx.stroke();
		//buffered
		ctx.beginPath();
		ctx.strokeStyle = '#C0BBBB';
		ctx.lineWidth = 2;
		tr = v.buffered;
		for (var i = tr.length;i--;) {
			ctx.moveTo(tr.start(i) / d * w, 18);
			ctx.lineTo(tr.end(i) / d * w, 18);
			
		}
		ctx.stroke();
		//mouse
		if(this._.progressX!==undefined){
			ctx.beginPath();
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.moveTo(this._.progressX-1,0);
			ctx.lineTo(this._.progressX-1,h-1);
			ctx.stroke();
		}
	}
}

//touch player
class TouchNyaP extends NyaPlayerCore{
	constructor(opt){
		super(opt);
		this._player=Object2HTML({
			_:'div',attr:{'class':'NyaP_Mini'}
		});
	}
	

}

function addEvents(target,events={}){
	for(let e in events)target.addEventListener(e,events[e]);
}
function requestFullscreen(dom) {
	try{
		(dom.requestFullscreen||
		dom.msRequestFullscreen||
		dom.mozRequestFullScreen||
		dom.webkitRequestFullscreen)
		.call(dom);
	}catch(e){
		console.error(e)
		alert(_('Failed to change to fullscreen mode'));
	}
}
function exitFullscreen() {
	const d=document;
	(document.exitFullscreen||
	document.msExitFullscreen||
	document.mozCancelFullScreen||
	document.webkitCancelFullScreen)
	.call(d);
}
function isFullscreen() {
	const d=document;
	return !!(d.fullscreen || d.mozFullScreen || d.webkitIsFullScreen || d.msFullscreenElement);
}
function formatTime(sec,total){
	let h,r,s=sec|0;
	h=(s/3600)|0;
	if(total>=3600)s=s%3600;
	r=[padTime((s/60)|0),padTime(s%60)];
	(total>=3600)&&r.unshift(h);
	return r.join(':');
}
function padTime(n){
	return n>9&&n||`0${n}`;
}
window.NyaP=NyaP;
window.TouchNyaP=TouchNyaP;