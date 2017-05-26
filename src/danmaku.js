/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';
import {DanmakuFrame,DanmakuFrameModule} from '../lib/danmaku-frame/src/danmaku-frame.js'
import initTextDanmaku from '../lib/danmaku-text/src/danmaku-text.js'
initTextDanmaku(DanmakuFrame,DanmakuFrameModule);//init TextDanmaku mod

const colorChars='0123456789abcdef';
const danmakuProp=['color','text','size','mode','time'];
class Danmaku{
	constructor(core){
		this.core=core;
		this.danmakuFrame=new DanmakuFrame(core.container);
		this.danmakuFrame.setMedia(core.video);
		this.danmakuFrame.enable('TextDanmaku');

		this.setTextDanmakuOptions(core.opt.danmakuOption);
		this.setDefaultTextStyle(core.opt.textStyle);
	}
	load(obj){
		return this.danmakuFrame.load(obj);
	}
	loadList(list){
		this.danmakuFrame.loadList(list);
	}
	remove(obj){
		this.danmakuFrame.unload(obj);
	}
	toggle(name,bool){
		try{
			if(bool==undefined)bool=!this.module(name).enabled;
			this.danmakuFrame[bool?'enable':'disable'](name);
			this.emit('danmakuToggle',name,this.module(name).enabled);
		}catch(e){
			return false;
		}
		return true;
	}
	at(x,y){
		return this.module('TextDanmaku').danmakuAt(x,y);
	}
	module(name){
		return this.danmakuFrame.modules[name];
	}
	send(obj,callback){
		for(let i of danmakuProp)
			if((i in obj)===false)return false;
		if((obj.text||'').match(/^\s*$/))return false;
		obj.color=this.isVaildColor(obj.color);
		if(obj.color){
			obj.color=obj.color.replace(/\$/g,()=>{
				return colorChars[limitIn((16*Math.random())|0,0,15)];
			});
		}else{
			obj.color=null;
		}
		if(this.core.opt.danmakuSend instanceof Function){
			this.core.opt.danmakuSend(obj,callback||(()=>{}));
			return true;
		}
		return false;
	}
	isVaildColor(co){
		if(typeof co !== 'string')return false;
		return (co=co.match(/^#?(([\da-f\$]{3}){1,2})$/i)?co[1]:false);
	}
	setDefaultTextStyle(opt){
		if(opt)for(let n in opt)this.module('TextDanmaku').defaultStyle[n]=opt[n];
	}
	setTextDanmakuOptions(opt){
		if(opt)for(let n in opt)this.module('TextDanmaku').options[n]=opt[n];
	}
}

export default Danmaku;
