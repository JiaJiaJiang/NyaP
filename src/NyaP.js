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
		this.eles={};
		this._playerMode='normal';
		const icons={
			play:[30,30,'<path d="m5.662,4.874l18.674,10.125l-18.674,10.125l0,-20.251l0,0.000z" stroke-width="3" stroke-linejoin="round"/>'],
			addDanmaku:[30,30,'<path stroke-width="2" d="m20.514868,20.120359l0.551501,-1.365456l2.206013,-0.341365l-2.757514,1.706821l-13.787251,0l0,-10.240718l16.544766,0l0,8.533897"/>'
								+'<path style="fill-opacity:1;stroke-width:0" d="m12.081653,13.981746l1.928969,0l0,-1.985268l1.978756,0l0,1.985268l1.92897,0l0,2.036509l-1.92897,0l0,1.985268l-1.978756,0l0,-1.985268l-1.928969,0l0,-2.036509z"/>'],
			danmakuStyle:[40,30,'<path d="m29.15377,16.14291l0.02111,-2.1431c0.00509,-0.54056 -0.42875,-0.98198 -0.96992,-0.98787l-1.34434,-0.013l-0.03905,4.09902l1.34419,0.01376c0.54106,0.00467 0.98357,-0.42842 0.98801,-0.96881l0,0zm-13.90662,-3.25468l-0.03893,4.09917l10.63621,0.10205l0.03855,-4.10088l-10.63583,-0.10035l0,0zm-2.63743,0.99919l-1.78463,1.00731l1.7653,1.04142l1.63913,0.9686l0.03869,-3.9553l-1.65849,0.93797l0,0l0,0z" stroke-width="1.5"/>'],
			fullPage:[30,30,'<path d="m11.16677,9.76127l-5.23735,5.23922l5.23783,5.23825l1.90512,-1.90509l-3.33364,-3.33316l3.33295,-3.33316l-1.90491,-1.90606l0,0zm7.66526,0l-1.90374,1.90557l3.33296,3.33316l-3.33296,3.33275l1.90374,1.90508l5.23853,-5.23873l-5.23853,-5.23784z" stroke-width="1.3" />'],
			fullScreen:[30,30,'<rect height="11.1696" width="17.65517" y="9.4152" x="6.17241" stroke-width="1.5"/>'
							  +'<path d="m12.36171,11.39435l-3.6047,3.60599l3.60503,3.60532l1.31123,-1.31121l-2.29444,-2.29411l2.29396,-2.29411l-1.31109,-1.31188l0,0zm5.27576,0l-1.31028,1.31155l2.29397,2.29411l-2.29397,2.29383l1.31028,1.3112l3.60552,-3.60565l-3.60552,-3.60504z"/>']
		}
		function icon(name,event){
			const ico=icons[name];
			return Object2HTML({_:'span',event,prop:{id:`NyaP_icon_span_${name}`,
				innerHTML:`<svg height=${ico[1]} width=${ico[0]} id="NyaP_icon_${name}"">${ico[2]}</svg>`}});
		}
		/*const elementSaver=ele=>{
			if(ele.id)this.eles[ele.id]=ele;
		}*/
		this._player=Object2HTML({
			_:'div',attr:{'class':'NyaP'},child:[
				{_:'div',attr:{id:'video_frame'},child:[
					this.video,
					this.danmakuFrame.container
				]},
				{_:'div',attr:{id:'control'},child:[
					{_:'span',attr:{id:'control_left'},child:[
						icon('play',{click:e=>this.playOrPause()}),
					]},
					{_:'span',attr:{id:'control_center'},child:[
						{_:'canvas',attr:{id:'progress'}},
						{_:'div',prop:{id:'danmaku_input_frame'},child:[
							{_:'div',attr:{id:'danmaku_style_pannel'}},
							icon('danmakuStyle',{click:e=>this.danmakuStylePannel()}),
							{_:'input',attr:{id:'danmaku_input',placeholder:_('Input danmaku here')}},
							{_:'span',prop:{id:'danmaku_submit',innerHTML:_('Send')}},
						]}
					]},
					{_:'span',attr:{id:'control_right'},child:[
						icon('addDanmaku',{click:e=>this.danmakuInput()}),
						{_:'span',prop:{id:'player_mode'},child:[
							icon('fullPage',{click:e=>this.playerMode('fullPage')}),
							icon('fullScreen',{click:e=>this.playerMode('fullScreen')})
						]}
					]},
				]}
			]
		});

		//add elements with id to eles prop
		[...this._player.querySelectorAll('*')].forEach(e=>{
			if(e.id&&!this.eles[e.id])this.eles[e.id]=e;
		});

		setTimeout(()=>{
			this.eles.control.ResizeSensor=new ResizeSensor(this.eles.control,()=>this.refreshProgress());
			this.refreshProgress();
		},0);

		//events
		addEvents(this.video,{
			playing:()=>{
				this.eles.NyaP_icon_span_play.classList.add('active_icon');
			},
			pause:()=>{
				this.eles.NyaP_icon_span_play.classList.remove('active_icon');
			},
			stalled:()=>{
				this.eles.NyaP_icon_span_play.classList.remove('active_icon');
			},
		});
		//addEvents(this.eles.NyaP_icon_span_addDanmaku,{click:()=>this.danmakuInput()});

		console.log(this.eles)
	}
	/*calcProgressStyle(){
		Object.assign(this.eles.control_center.style,{
			left:this.eles.control_left.offsetWidth+'px',
			width:(this.eles.control.offsetWidth-this.eles.control_left.offsetWidth-this.eles.control_right.offsetWidth)+'px',
		});
	}*/
	danmakuInput(bool=!this.eles.danmaku_input_frame.offsetHeight){
		this.eles.danmaku_input_frame.style.display=bool?'flex':'';
		this.eles.NyaP_icon_span_addDanmaku.classList[bool?'add':'remove']('active_icon');
	}
	playerMode(mode='normal'){
		if(mode==='normal' && this._playerMode===mode)return;
		if(this._playerMode==='fullPage'){
			this.player.style.position='';
			this.eles.NyaP_icon_span_fullPage.classList.remove('active_icon');
		}else if(this._playerMode==='fullScreen'){
			this.eles.NyaP_icon_span_fullScreen.classList.remove('active_icon');
			exitFullscreen();
		}
		if(mode!=='normal' && this._playerMode===mode)mode='normal';//back to normal mode
		switch(mode){
			case 'fullPage':{
				this.player.style.position='fixed';
				this.eles.NyaP_icon_span_fullPage.classList.add('active_icon');
				break;
			}
			case 'fullScreen':{
				this.eles.NyaP_icon_span_fullScreen.classList.add('active_icon');
				requestFullscreen(this.player);
				break;
			}
		}
		this._playerMode=mode;
	}
	refreshProgress(){

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
	if (dom.requestFullscreen) {
		dom.requestFullscreen();
	} else if (dom.msRequestFullscreen) {
		dom.msRequestFullscreen();
	} else if (dom.mozRequestFullScreen) {
		dom.mozRequestFullScreen();
	} else if (dom.webkitRequestFullscreen) {
		dom.webkitRequestFullscreen(dom['ALLOW_KEYBOARD_INPUT']);
	} else {
		alert(_('Failed to change to fullscreen mode'));
	}
}
function exitFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen();
	}
}
function isFullscreen() {
	return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement;
}

window.NyaP=NyaP;
window.TouchNyaP=TouchNyaP;