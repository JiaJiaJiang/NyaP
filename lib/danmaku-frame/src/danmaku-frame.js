/*
Copyright luojia@luojia.me
LGPL license
*/
import '../lib/COL/CanvasObjLibrary.js';

'use strict';
class DanmakuFrame{
	constructor(canvas){
		if(canvas && (canvas instanceof HTMLCanvasElement === false))
			throw('The first arg should be a canvas or empty');
		this.canvas=canvas||document.createElement('canvas');//the canvas
		this.context2d=this.canvas.getContext('2d');//the canvas context
		this.COL=new CanvasObjLibrary(this.canvas);//the library

		this.rate=1;
		this.timeBase=0;
		this.media=null;
		this.fps=30;
		this.working=false;
		this.modules={};//constructed module list
		for(let m of DanmakuFrame.moduleList)//init all modules
			this.initModule(m[0]);
	}
	enable(name){
		let module=this.modules[name];
		if(!module)return this.initModule(name);
		module.enabled=true;
		module.enable&&module.enable();
		return true;
	}
	disable(name){
		let module=this.modules[name];
		if(!module)return false;
		module.enabled=false;
		module.disable&&module.disable();
		return true;
	}
	initModule(name){
		let mod=DanmakuFrame.moduleList.get(name);
		if(!mod)throw('Module ['+name+'] does not exist.');
		let module=new mod(this);
		if(module instanceof DanmakuFrameModule === false)
			throw('Constructor of '+name+' is not extended from DanmakuFrameModule');
		module.enabled=true;
		this.modules[name]=module;
		return true;
	}
	set time(t){//current media time (ms)
		this.media||(this.timeBase=Date.now()-t);
		for(let m in this.modules)//let all mods know when the time be set
			this.modules[m].time&&this.modules[m].time(t);
	}
	get time(){
		return this.media?this.media.currentTime*1000000:(Date.now()-this.timeBase);
	}
	load(danmakuObj){
		for(let m in this.modules)
			this.modules[m].load&&this.modules[m].load(danmakuObj);
	}
	loadList(danmakuArray){
		for(let m in this.modules)
			this.modules[m].loadList&&this.modules[m].loadList(danmakuObj);
	}
	unload(danmakuObj){
		for(let m in this.modules)
			this.modules[m].unload&&this.modules[m].unload(danmakuObj);
	}
	start(){
		this.working=true;
		for(let m in this.modules)
			this.modules[m].start&&this.modules[m].start();
		this.draw();
	}
	pause(){
		this.working=false;
		for(let m in this.modules)
			this.modules[m].pause&&this.modules[m].pause();
	}
	stop(){
		this.working=false;
		for(let m in this.modules)
			this.modules[m].stop&&this.modules[m].stop();
		this.COL.clear();//clear the canvas
	}
	draw(){
		if(this.working===false)return;
		if(this.fps===0){
			requestAnimationFrame(()=>{this.draw();});
		}else{
			setTimeout(()=>{this.draw();},1000/this.fps);
		}
		for(let m in this.modules)
			this.modules[m].draw&&this.modules[m].draw();
		this.COL.draw();
	}
	static addModule(name,module){
		if(this.moduleList.has(name)){
			console.warn('The module "'+name+'" has already been added.');
			return;
		}
		this.moduleList.set(name,module);
	} 
}

DanmakuFrame.moduleList=new Map();

class DanmakuFrameModule{
	constructor(frame){
		this.frame=frame;
		this.enabled=false;
	}
	/*enable(){}
	disable(){}
	load(){}
	frame(){}
	time(){}
	start(){}
	pause(){}
	stop(){}*/
}

export {DanmakuFrame,DanmakuFrameModule}