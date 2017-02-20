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
		this.eles={};
		const icons={
			play:[30,30,'<path d="m5.662,4.874l18.674,10.125l-18.674,10.125l0,-20.251l0,0.000z" stroke-width="3" stroke-linejoin="round"/>'],
			addDanmaku:[30,30,'<path stroke-width="2" d="m20.514868,20.120359l0.551501,-1.365456l2.206013,-0.341365l-2.757514,1.706821l-13.787251,0l0,-10.240718l16.544766,0l0,8.533897"/>'
								+'<path style="fill:" fill="#000" stroke-width="0" d="m12.081653,13.981746l1.928969,0l0,-1.985268l1.978756,0l0,1.985268l1.92897,0l0,2.036509l-1.92897,0l0,1.985268l-1.978756,0l0,-1.985268l-1.928969,0l0,-2.036509z"/>'],
		}
		function icon(name,event){
			const ico=icons[name];
			return Object2HTML({_:'span',event,prop:{id:`NyaP_icon_div_${name}`,style:`height:${ico[0]}px;width:${ico[1]}px`,
				innerHTML:`<svg height=${ico[0]} width=${ico[1]} id="NyaP_icon_${name}"">${ico[2]}</svg>`}},elementSaver);
		}
		const elementSaver=ele=>{
			if(ele.id)this.eles[ele.id]=ele;
		}
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
						{_:'div',prop:{hidden:true,id:'danmaku_input_frame'}}
					]},
					{_:'span',attr:{id:'control_right'},child:[
						icon('addDanmaku'),
					]},
				]}
			]
		},elementSaver);
		setTimeout(()=>{
			this.eles.control.ResizeSensor=new ResizeSensor(this.eles.control,()=>this.calcProgressStyle());
			this.calcProgressStyle();
		},0);

		//events
		addEvents(this.video,{
			playing:()=>{
				this.eles.NyaP_icon_div_play.classList.add('active_icon');
			},
			pause:()=>{
				this.eles.NyaP_icon_div_play.classList.remove('active_icon');
			},
			stalled:()=>{
				this.eles.NyaP_icon_div_play.classList.remove('active_icon');
			},
		});

		console.log(this.eles)
	}
	calcProgressStyle(){
		Object.assign(this.eles.control_center.style,{
			left:this.eles.control_left.offsetWidth+'px',
			width:(this.eles.control.offsetWidth-this.eles.control_left.offsetWidth-this.eles.control_right.offsetWidth)+'px',
		});
	}
	danmakuInput(bool){
		this.eles.danmaku_input_frame.hidden=!bool;
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

window.NyaP=NyaP;
window.TouchNyaP=TouchNyaP;