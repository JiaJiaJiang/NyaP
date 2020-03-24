/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';
import {Utils} from '../NyaP-Core/index.js';//load DomTools from NyaP-Core project
import {DanmakuFrame} from './src/danmaku-frame.js'
import initTextDanmaku from './src/danmaku-text/danmaku-text.js'
initTextDanmaku(DanmakuFrame);//init TextDanmaku mod

const colorChars='0123456789abcdef';
const danmakuProp=['color','text','size','mode','time'];
class NyaPDanmaku extends DanmakuFrame{
	get opt(){return this.core.opt.danmaku};
	constructor(core){
		super(core,core.opt.danmaku);

		//init mods
		for(let mod in DanmakuFrame.availableModules){
			if(this.opt.modules[mod]?.enable===true)
				this.initModule(mod);
				this.enable(mod);
		}

		this.setMedia(core.video);
	}
	toggle(name,bool){
		if(typeof name==='boolean' || name==undefined){//danmaku frame switch mode
			bool=(name!=undefined)?name:!this.enabled;
			this[bool?'enable':'disable']();
			return bool;
		}
		try{//module switch mode
			if(bool==undefined)bool=!this.module(name).enabled;
			this[bool?'enable':'disable'](name);
			this.core.emit('danmakuModuleToggle',name,this.module(name)?.enabled);
		}catch(e){
			this.core.log('','error',e);
			return false;
		}
		return true;
	}
	module(name){
		return super.modules[name];
	}
	send(obj,callback){
		for(let i of danmakuProp)
			if((i in obj)===false)return false;
		if((obj.text||'').match(/^\s*$/))return false;
		obj.color=this.isVaildColor(obj.color);
		if(obj.color){
			obj.color=obj.color.replace(/\$/g,()=>{
				return colorChars[Utils.clamp((16*Math.random())|0,0,15)];
			});
		}else{
			obj.color=null;
		}
		if(this.opt.send instanceof Function){
			this.opt.send(obj,callback||(()=>{}));
			return true;
		}
		return false;
	}
	isVaildColor(co){
		if(typeof co !== 'string')return false;
		return (co=co.match(/^\#?(([\da-f\$]{3}){1,2})$/i))?co[1]:false;
	}
}

export default NyaPDanmaku;
