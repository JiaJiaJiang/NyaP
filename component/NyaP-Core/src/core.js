/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {i18n} from './i18n.js';
import {DomTools} from './domTools.js';
import {Utils} from './utils.js';

//default options
const NyaPCoreOptions={
	//for video
	muted:false,//set video muted
	volume:1,//set volume (0 ~ 1) 
	loop:false,//set video loop
	videoSrc:'',
	plugins:[],//NyaP dynamic plugins list
}


class NyaPEventEmitter{
	constructor(){
		this._events={};
	}
	emit(e,...args){
		this._resolve(e,...args);
		this.globalListener(e,...args);
		return this;
	}
	_resolve(e,...args){
		if(e in this._events){
			const hs=this._events[e];
			try{
				for(let h of hs){
					if(h.apply(this,args)===false)return;
				}
			}catch(err){
				console.error(`NyaP event callback error for "${e}"`,err);
			}
		}
	}
	addEventListener(...args){
		return this.on(...args);
	}
	on(e,handle,top=false){
		if(!(handle instanceof Function))return this;
		if(!(e in this._events))this._events[e]=[];
		if(top)
			this._events[e].unshift(handle);
		else
			this._events[e].push(handle);
		return this;
	}
	removeEvent(e,handle){
		if(!(e in this._events))return this;
		if(arguments.length===1){delete this._events[e];return this;}
		let ind;
		if(ind=(this._events[e].indexOf(handle))>=0)this._events[e].splice(ind,1);
		if(this._events[e].length===0)delete this._events[e];
		return this;
	}
	globalListener(name,...args){}//all events will be passed to this function
}

class NyaPlayerCore extends NyaPEventEmitter{
	static i18n=i18n;
	static Utils=Utils;
	static DomTools=DomTools;
	static NyaPCoreOptions=NyaPCoreOptions;
	stats=[];//stats of the player. Item: [[time,name,promise or result],...]
	debugs=[];//debug messages. Item: [[time,...msgs],...]
	plugins={};//loaded core plugins. name=>plugin object
	i18n=new i18n();//core i18n instanse
	_={//for private variables, do not change vars here
		videoSrc:'',
		video:DomTools.Object2HTML({_:'video',attr:{id:'main_video',
													'webkit-playsinline':'',
													'playsinline':'',
													'x5-playsinline':'',
													'x-webkit-airplay':'allow',
													'controlsList':"nodownload" ,
													'x5-video-player-type':'h5',
													'preload':'auto',
													'poster':'',
												}}),
		urlResolvers:[],//functions to resolve urls. Item: [priority,func]
	};
	get video(){return this._.video;}//get video element
	get videoSize(){return [this.video.videoWidth,this.video.videoHeight];}
	get videoSrc(){return this._.videoSrc;}//get current video src

	constructor(opt){
		super();
		let _=this.i18n;
		{
			let done=this.stat('loading_core');
			this.on('coreLoad',()=>done());
			this.on('coreLoadError',e=>done(e));
		}
		this.log('%c https://github.com/JiaJiaJiang/NyaP-Core/ ','log',"background:#6f8fa2;color:#ccc;padding:.3em");
		this.debug('Languages:'+this.i18n.langsArr.join(','));

		opt=this.opt=Utils.deepAssign({},NyaPCoreOptions,opt);
		//add events
		{
			//video:video_loopChange
			let LoopDesc=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'loop');
			Object.defineProperty(this.video,'loop',{
				get:LoopDesc.get,
				set:bool=>{
					if(bool===this.video.loop)return;
					this.emit('video_loopChange',bool);
					LoopDesc.set.call(this.video,bool);
				}
			});
		};
		DomTools.addEvents(this.video,{
			loadedmetadata:e=>this.debug('Video loadded'),
			error:e=>this.debug('Video error:',e),
			loadstart:e=>{this.stat('loading_video')},
		});
		
		//define default src resolver
		this.addURLResolver((url)=>{
			return Promise.resolve(url);//return the url
		},999);//most lower priority

		/*opts*/
		requestAnimationFrame(()=>{//active after events are attached
			['muted','volume','loop'].forEach(o=>{//dont change the order
				(opt[o]!==undefined)&&(this.video[o]=opt[o]);
			});
			if(opt.videoSrc)this.setVideoSrc(opt.videoSrc);//videoSrc
		});


		if(Array.isArray(opt.plugins)){//load plugins,opt.plugins is a list of url for plugins
			let done=this.stat('loading_plugin');
			let pluginList=[];
			for(let url of opt.plugins){
				pluginList.push(this.loadPlugin(url));
			}
			Promise.all(pluginList).then(()=>{
				done();
				this.emit('coreLoad');
			}).catch(e=>{
				done(e);
				this.debug('coreLoadError',e);
				this.emit('coreLoadError',e);
			})
			return;
		}

		
		this.emit('coreLoad');
	}
	stat(statusName,cb){
		let doneFunc,failFunc;
		let resultFunc=r=>{
			if(r instanceof Error){
				this.debug(r);
				failFunc(r.message);
			}else{
				doneFunc(r);
			}
		}
		let p=new Promise((ok,no)=>{
			doneFunc=ok;
			failFunc=no;
		});
		p.catch(e=>{
			this.debug(`fail stat:${e}`);
		});
		let s=[Date.now(),statusName,p,doneFunc,failFunc];
		this.stats.push(s);//add to core debug log
		if(cb){
			(async ()=>{
				try{
					resultFunc(await cb());
				}catch(err){
					resultFunc(err);
				}
			})();
		}
		setTimeout(()=>this.emit('stat',s),0);
		return resultFunc;
	}
	statResult(statusName,result){
		for(let i=this.stats.length,s;i--;){
			s=this.stats[i];
			if(s[1]===statusName){
				if(result instanceof Error){
					s[4](result.message);
				}else{
					s[3](result);
				}
				return true;
			}
		}
		return false;
	}
	addURLResolver(func,priority=0){
		this._.urlResolvers.push([priority,func]);
		this._.urlResolvers.sort((a,b)=>a[0]-b[0]);//sort by priority
	}
	async resolveURL(url){//resolve the url by url resolvers
		for(let n of this._.urlResolvers){
			let func=n[1];
			let r=await func(url);
			if(r===false){
				this.debug(`Stop resolving url: ${url}`);
				return false;//stop resolving the url
			}
			if(r){
				this.debug('URL resolver: ['+url+'] => ['+r+']');
				return r;
			}
		}
		return Promise.reject('No url resolver hit');
	}
	async setVideoSrc(s){
		s=s.trim();
		let url=await this.resolveURL(s);
		if(url===false)return;//won't change the url if false returned
		this._.videoSrc=s;
		this.emit('srcChanged',s);
		this.video.src=url;
		return;
	}
	playToggle(Switch=this.video.paused){
		return this.video[Switch?'play':'pause']();
	}
	loadPlugin(url,name){//load js plugins for NyaP
		if(name&&this.plugins[name]){//check if exists
			this.debug(`Plugin already loaded: ${name}`);
			return this.plugins[name];
		}
		let p=fetch(url)
		.then(res=>res.text())
		.then(async script=>{
			script=script.trim();
			let plugin=eval(script);
			if((typeof plugin.name!=='string')||!plugin.name)
				throw(new TypeError('Invalid plugin name'));
			if(this.plugins[plugin.name]){//check if exists
				this.debug(`Plugin already loaded: ${plugin.name}`);
				return plugin;
			}
			if(typeof plugin.init==='function')
				await plugin.init(this);//init the plugin
			this.plugins[plugin.name]=plugin;
			this.debug('Plugin loaded',plugin.name);
			return plugin;
		});
		p.catch(e=>{
			this.debug('Plugin loading error:',e);
			// this.emit('pluginLoadError',e);
		});
		return p;
	}
	log(content,type='log',...styles){//log to console
		console[type](`%c NyaP %c${content}`,"background:#e0e0e0;padding:.2em","background:unset",...styles);
	}
	debug(...msg){//debug messages
		console.debug('NyaP[debug]',...msg);
		msg.unshift(Date.now());
		this.debugs.push(msg);
		this.emit('debug',msg);
	}
}

export {
	NyaPlayerCore,
}
