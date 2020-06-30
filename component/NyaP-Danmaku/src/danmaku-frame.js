/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';
import {
	DomTools,
	Utils
} from '../../NyaP-Core/index.js';//load from NyaP-Core project

export {
	DomTools,
	Utils
} 

class DanmakuFrameModule{
	constructor(frame){
		this.frame=frame;
		this.enabled=false;
	}
	get width(){return this.frame.width;}
	get height(){return this.frame.height;}
}


class DanmakuFrame{
	static availableModules={};
	static addModule(name,module){
		if(name in this.availableModules){
			console.warn('The module "'+name+'" has already been added.');
			return;
		}
		this.availableModules[name]=module;
	} 
	get availableModules(){return this.constructor.availableModules;}
	get opt(){return this._opt||{}};
	set time(t){//current media time (ms)
		this.media||(this.timeBase=Date.now()-t);
		this.moduleFunction('time',t);//let all mods know when the time be set
	}
	get time(){return this.media?(this.media.currentTime*1000):(Date.now()-this.timeBase);}
	get area(){return this.width*this.height;}
	_opt;
	rate=1;
	timeBase=0;//for no fixed duration evn
	width=0;
	height=0;
	fpsLimit=0;
	fps=0;//fps result
	fpsRec=new Uint32Array(9);//frame time record
	media=null;
	working=false;//set working stat
	enabled=true;//is enabled
	modules={};//constructed module list
	constructor(core,opt){
		this.core=core;
		this._opt=opt;
		this.container=core.danmakuContainer||document.createElement('div');
		// create a styleSheet
		const style=document.createElement("style");
		document.head.appendChild(style);
		this.styleSheet=style.sheet;
		
		setImmediate(()=>{//container size sensor
			DomTools.resizeEvent.observe(this.container);
			DomTools.addEvents(this.container,{
				resize:e=>this.resize(e.contentRect),
			});
			this.resize();
		},0);
		
		Utils.animationFrameLoop(()=>{//fps recorder
			let rec=this.fpsRec,length=rec.length;
			//move left
			rec.copyWithin(rec,1);
			rec[length-1]=Date.now();//set this frame's time
			let result=0;
			for(let i=1;i<length;i++){//weighted average
				result+=i*(rec[i]-rec[i-1]);
			}
			result/=length*(length-1)/2;
			this.fps=1000/result;
		});

		this.draw=this.draw.bind(this);

	}
	enable(name){//enable a amdule
		if(name===undefined){//no name means enable this frame
			this.enabled=true;
			if(this.media){
				this.media.paused||this.play();
			}
			this.container.style.display='';
			this.core.emit('danmakuFrameToggle',true);
			this.core.debug('danmaku frame enabled');
			return;
		}else if(!name){
			throw(new Error(`Wrong name: ${name}`));
		}
		let module=this.modules[name]||this.initModule(name);
		if(!module)return false;
		module.enabled=true;
		module.enable&&module.enable();
		return true;
	}
	disable(name){
		if(name===undefined){
			this.pause();
			this.moduleFunction('clear');
			this.enabled=false;
			this.container.style.display='none';
			this.core.emit('danmakuFrameToggle',false);
			this.core.debug('danmaku frame disabled');
			return;
		}
		let module=this.modules[name];
		if(!module)return false;
		module.enabled=false;
		module.disable&&module.disable();
		return true;
	}
	addStyle(s){
		if(typeof s === 'string')s=[s];
		if(s instanceof Array === false)return;
		s.forEach(r=>this.styleSheet.insertRule(r,this.styleSheet.cssRules.length));
	}
	initModule(name,arg=this.opt.modules[name]){
		if(this.modules[name]){
			console.warn(`The module [${name}] has already inited.`);
			return this.modules[name];
		}
		let mod=DanmakuFrame.availableModules[name];
		if(!mod)throw('Module ['+name+'] does not exist.');
		let module=new mod(this,arg);
		if(module instanceof DanmakuFrameModule === false)
			throw('Constructor of '+name+' is not child class of DanmakuFrameModule');
		this.modules[name]=module;
		console.debug(`Mod Inited: ${name}`);
		return module;
	}
	draw(force){
		if(!this.working)return;
		this.moduleFunction('draw',force);
		if(this.fpsLimit<=0){
			requestAnimationFrame(()=>this.draw());
		}else{
			setTimeout(this.draw,1000/this.fpsLimit);
		}
	}
	load(...danmakuObj){
		this.moduleFunction('load',...danmakuObj);
	}
	loadList(danmakuArray){
		this.moduleFunction('loadList',danmakuArray);
	}
	unload(danmakuObj){
		this.moduleFunction('unload',danmakuObj);
	}
	play(){
		if(this.working||!this.enabled)return;
		this.working=true;
		this.moduleFunction('play');
		this.draw(true);
	}
	pause(){
		if(!this.enabled)return;
		this.working=false;
		this.moduleFunction('pause');
	}
	resize(rect=this.container.getBoundingClientRect()){
		this.width=rect.width;
		this.height=rect.height;
		this.moduleFunction('resize',rect);
	}
	moduleFunction(name,...arg){
		let m;
		for(let n in this.modules){
			m=this.modules[n];
			if(m.enabled&&m[name])m[name](...arg);
		}
	}
	setMedia(media){
		const F=this;
		F.media=media;
		DomTools.addEvents(media,{
			playing:()=>F.play(),
			'pause,stalled,seeking,waiting':e=>{
				console.log(e);
				let pTime=F.media.currentTime;
				requestAnimationFrame(()=>{
					if(F.media.currentTime===pTime)
						F.pause();
				});
			},
			ratechange:()=>{
				F.rate=F.media.playbackRate;
				F.moduleFunction('rate',F.rate);
			},
		});
		F.moduleFunction('media',media);
	}
}


export {DanmakuFrame,DanmakuFrameModule}
