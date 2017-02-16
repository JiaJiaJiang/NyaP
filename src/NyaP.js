/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {DanmakuFrame,DanmakuFrameModule} from '../lib/danmaku-frame/src/danmaku-frame.js'
import initText2d from '../lib/danmaku-text/src/danmaku-text.js'
import {Object2HTML} from '../lib/Object2HTML/Object2HTML.js'


initText2d(DanmakuFrame,DanmakuFrameModule);//init text2d mod


//default options
const NyaPOptions={
	//touchMode:false,
}
//UIEvent
class NyaPlayerCore{
	constructor(opt){
		this.opt=Object.assign({},NyaPOptions,opt);
		this.danmakuFrame=new DanmakuFrame();
		this.danmakuFrame.enable('text2d');
		this._video=Object2HTML({_:'video',attr:{id:'main_video'}});
		//this.danmakuFrame.container
	}
	play(){
		this.video.play();
	}
	pause(){
		this.video.pause();

	}
	seek(time){

	}
	listenVideoEvent(){
		addEvents(this.video,{

		});
	}
	get player(){
		return this._player;
	}
	get video(){
		return this._video;
	}
}

//normal player
class NyaP extends NyaPlayerCore{
	constructor(opt){
		super(opt);
		this._player=Object2HTML({
			_:'div',attr:{'class':'NyaP'},child:[
				{_:'div',attr:{id:'video_frame'},child:[
					this.video,
					this.danmakuFrame.container
				]},
				{_:'control',attr:{id:'control'},child:[
					{_:'canvas',attr:{id:'process'}}
				]}
			]
		});
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