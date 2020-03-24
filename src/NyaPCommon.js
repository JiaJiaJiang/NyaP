import {
    NyaPlayerCore,
	DomTools,
	Utils,
} from '../component/NyaP-Core/index.js';

import NyaPDanmaku from '../component/NyaP-Danmaku/index.js';

const O2H=DomTools.Object2HTML;

//default options
const NyaPCommonOptions={
	//for danmaku frame
	danmaku:{
		enable:true,
		modules:{
			TextDanmaku:{
				enable:true,
				defaultStyles:{},
				options:{},
			},
		},
		send:d=>{return Promise.reject();},//the method for sending danmaku
	},
	// for ui
	uiOptions:{
		danmakuColor:null,//a hex color(without #),when the color inputed is invalid,this color will be applied
		danmakuMode:0,//0: right to left.
		danmakuSize:24,
	},

	loadingInfo:{//text replacement at loading time (for left-bottom message)
		doneText:'ok',
		failText:'failed',
		contentSpliter:'...',
	},
	loadingAnimation:true,

	//other common options
	playerContainer:null,//the element for containing the player
	icons:{
		play:[30,30,'<path d="m10.063,8.856l9.873,6.143l-9.873,6.143v-12.287z" stroke-width="3" stroke-linejoin="round"/>'],
		addDanmaku:[30,30,'<path style="fill-opacity:0!important;" stroke-width="1.4" d="m21.004,8.995c-0.513,-0.513 -1.135,-0.770 -1.864,-0.770l-8.281,0c-0.729,0 -1.350,0.256 -1.864,0.770c-0.513,0.513 -0.770,1.135 -0.770,1.864l0,8.281c0,0.721 0.256,1.341 0.770,1.858c0.513,0.517 1.135,0.776 1.864,0.776l8.281,0c0.729,0 1.350,-0.258 1.864,-0.776c0.513,-0.517 0.770,-1.136 0.770,-1.858l0,-8.281c0,-0.729 -0.257,-1.350 -0.770,-1.864z" stroke-linejoin="round"/>'
							+'<path d="m12.142,14.031l1.888,0l0,-1.888l1.937,0l0,1.888l1.888,0l0,1.937l-1.888,0l0,1.888l-1.937,0l0,-1.888l-1.888,0l0,-1.937z" stroke-width="1"/>'],
		danmakuToggle:[30,30,'<path d="m8.569,10.455l0,0c0,-0.767 0.659,-1.389 1.473,-1.389l0.669,0l0,0l3.215,0l6.028,0c0.390,0 0.765,0.146 1.041,0.406c0.276,0.260 0.431,0.613 0.431,0.982l0,3.473l0,0l0,2.083l0,0c0,0.767 -0.659,1.389 -1.473,1.389l-6.028,0l-4.200,3.532l0.985,-3.532l-0.669,0c-0.813,0 -1.473,-0.621 -1.473,-1.389l0,0l0,-2.083l0,0l0,-3.473z"/>'],
		danmakuStyle:[30,30,'<path style="fill-opacity:1!important" d="m21.781,9.872l-1.500,-1.530c-0.378,-0.385 -0.997,-0.391 -1.384,-0.012l-0.959,0.941l2.870,2.926l0.960,-0.940c0.385,-0.379 0.392,-0.998 0.013,-1.383zm-12.134,7.532l2.871,2.926l7.593,-7.448l-2.872,-2.927l-7.591,7.449l0.000,0.000zm-1.158,2.571l-0.549,1.974l1.984,-0.511l1.843,-0.474l-2.769,-2.824l-0.509,1.835z" stroke-width="0"/>'],
		fullScreen:[30,30,'<path stroke-linejoin="round" d="m11.166,9.761l-5.237,5.239l5.237,5.238l1.905,-1.905l-3.333,-3.333l3.332,-3.333l-1.904,-1.906zm7.665,0l-1.903,1.905l3.332,3.333l-3.332,3.332l1.903,1.905l5.238,-5.238l-5.238,-5.237z" stroke-width="1.3" />'],
		fullPage:[30,30,'<rect stroke-linejoin="round" height="11.169" width="17.655" y="9.415" x="6.172" stroke-width="1.5"/>'
						  +'<path stroke-linejoin="round" d="m12.361,11.394l-3.604,3.605l3.605,3.605l1.311,-1.311l-2.294,-2.294l2.293,-2.294l-1.311,-1.311zm5.275,0l-1.310,1.311l2.293,2.294l-2.293,2.293l1.310,1.311l3.605,-3.605l-3.605,-3.605z"/>'],
		loop:[30,30,'<path stroke-linejoin="round" stroke-width="1" d="m20.945,15.282c-0.204,-0.245 -0.504,-0.387 -0.823,-0.387c-0.583,0 -1.079,0.398 -1.205,0.969c-0.400,1.799 -2.027,3.106 -3.870,3.106c-2.188,0 -3.969,-1.780 -3.969,-3.969c0,-2.189 1.781,-3.969 3.969,-3.969c0.720,0 1.412,0.192 2.024,0.561l-0.334,0.338c-0.098,0.100 -0.127,0.250 -0.073,0.380c0.055,0.130 0.183,0.213 0.324,0.212l2.176,0.001c0.255,-0.002 0.467,-0.231 0.466,-0.482l-0.008,-2.183c-0.000,-0.144 -0.085,-0.272 -0.217,-0.325c-0.131,-0.052 -0.280,-0.022 -0.379,0.077l-0.329,0.334c-1.058,-0.765 -2.340,-1.182 -3.649,-1.182c-3.438,0 -6.236,2.797 -6.236,6.236c0,3.438 2.797,6.236 6.236,6.236c2.993,0 5.569,-2.133 6.126,-5.072c0.059,-0.314 -0.022,-0.635 -0.227,-0.882z"/>'],
		volume:[30,30,'<ellipse id="volume_circle" style="fill-opacity:.6!important" ry="6" rx="6" cy="15" cx="15" stroke-dasharray="38 90" stroke-width="1.8"/>'],
		danmakuMode0:[30,30,'<path style="fill-opacity:1!important" stroke-width="0" d="m14.981,17.821l-7.937,-2.821l7.937,-2.821l0,1.409l7.975,0l0,2.821l-7.975,0l0,1.409l0,0.002z"/>'],
		danmakuMode1:[30,30,'<path style="fill-opacity:1!important" stroke-width="0" d="m15.019,12.178l7.937,2.821l-7.937,2.821l0,-1.409l-7.975,0l0,-2.821l7.975,0l0,-1.409l0,-0.002z"/>'],
		danmakuMode3:[30,30,'<path stroke-width="3" d="m7.972,7.486l14.054,0"/>'],
		danmakuMode2:[30,30,'<path stroke-width="3" d="m7.972,22.513l14.054,0"/>'],
	},
}

//NyaP classic theme Core
class NyaPCommon extends NyaPlayerCore{
	get frame(){return this._.player||this.videoFrame;}
	get player(){return this._.player;}
	get _danmakuEnabled(){return this.opt.danmaku.enable;}
	constructor(opt){
		super(Utils.deepAssign({},NyaPCommonOptions,opt));
		this.log('%c https://github.com/JiaJiaJiang/NyaP/ ','log',"background:#6f8fa2;color:#ccc;padding:.3em");
		opt=this.opt;

		this.$=this.$.bind(this);
		this.$$=this.$$.bind(this);

		//language
		const _t=this._t=this.i18n._.bind(this.i18n);//translate
		//load languages to the core
		let langs=require('./langs.json');
		for(let l in langs){
			this.i18n.add(l,langs[l]);
		}

		//the video frame for NyaP and NyaPTouch
		this.videoFrame=O2H(
			{_:'div',attr:{id:'video_frame'},child:[
				this.video,
				//this.container,
				{_:'div',attr:{id:'loading_frame'},child:[
					{_:'div',attr:{id:'loading_anime'}},
					{_:'div',attr:{id:'loading_info'}},
				]},
				{_:'div',attr:{id:'msg_box'}},
			]}
		);

		//add private vars
		this._.playerMode='normal';
		this._.selectorCache={};
		this._.volumeBox=new MsgBox('','info',this.$('#msg_box'));

		//receive stat requests
		this.on('stat',stat=>{
			let name=_t(stat[1]);
			this.debug('stat:',name);
			let d=O2H({_:'div',child:[name]});
			d.append(this.opt.loadingInfo.contentSpliter);
			this.$('#loading_info').appendChild(d);
			stat[2].then(result=>{//wait for the result
				d.append(result||this.opt.loadingInfo.doneText);
			}).catch(e=>{
				d.append(e.message||e||this.opt.loadingInfo.failText);
			});
		});

		//loading animation
		if(opt.loadingAnimation){
			this.$('#loading_anime').innerHTML='(๑•́ ω •̀๑)';
			this._.loadingAnimationInterval=setInterval(()=>{//loading animation
				this.$('#loading_anime').style.transform="translate("+Utils.rand(-20,20)+"px,"+Utils.rand(-20,20)+"px) rotate("+Utils.rand(-10,10)+"deg)";
			},80);
		}
		DomTools.addEvents(this.video,{
			
			loadedmetadata:e=>{
				this.statResult('loading_video',null);
				clearInterval(this._.loadingAnimationInterval);
				let lf=this.$('#loading_frame');
				if(lf.parentNode)//remove loading animation
					lf.parentNode.removeChild(lf);
			},
			error:e=>{
				this.statResult('loading_video',e);
				clearInterval(this._.loadingAnimationInterval);
				this.$('#loading_frame').style.transform="";
				this.$('#loading_frame').innerHTML='(๑• . •๑)';
			},
		});

		//load danmaku frame
		if(this._danmakuEnabled){
			this.danmakuContainer=O2H({_:'div',prop:{id:'danmaku_container'}});
			this.stat('loading_danmakuFrame',()=>{
				this.Danmaku=new NyaPDanmaku(this);
				this.videoFrame.insertBefore(this.danmakuContainer,this.$('#loading_frame'));
			});
		}
	}
	$(selector,useCache=true){//querySelector for the frame element
		if(useCache&&this._.selectorCache[selector])
			return this._.selectorCache[selector];
		let el=this.frame.querySelector(selector);
		if(el)this._.selectorCache[selector]=el;
		return el;
	}
	$$(selector){//querySelectorAll for the frame element
		return this.frame.querySelectorAll(selector);
	}
	playerMode(mode='normal'){
		if(mode==='normal' && this._.playerMode===mode)return;
		if(this._.playerMode==='fullPage'){
			this.player.style.position='';
		}else if(this._.playerMode==='fullScreen'){
			DomTools.exitFullscreen();
		}
		if(mode!=='normal' && this._.playerMode===mode)mode='normal';//back to normal mode
		switch(mode){
			case 'fullPage':{
				this.player.style.position='fixed';
				this.player.setAttribute('playerMode','fullPage');
				break;
			}
			case 'fullScreen':{
				this.player.setAttribute('playerMode','fullScreen');
				DomTools.requestFullscreen(this.player);
				break;
			}
			default:{
				this.player.setAttribute('playerMode','normal');
			}
		}
		this._.playerMode=mode;
		this.emit('playerModeChange',mode);
	}
	msg(text,type='tip'){//type:tip|info|error
		let msg=new MsgBox(text,type,this.$('#msg_box'));
		requestAnimationFrame(()=>msg.show());
	}
	_iconActive(name,bool){
		if(name==='loop')
		this.$(`#icon_span_${name}`).classList[bool?'add':'remove']('active_icon');
	}
	_setDisplayTime(current=null,total=null){
			if(current!==null)this.$('#current_time').innerHTML=current;
			if(total!==null)this.$('#total_time').innerHTML=total;
	}
}

class MsgBox{
	constructor(text,type,parentNode){
		this.using=false;
		let msg=this.msg=O2H({_:'div',attr:{class:`msg_type_${type}`}});
		msg.addEventListener('click',()=>this.remove());
		this.parentNode=parentNode;
		this.setText(text);
	}
	setTimeout(time){
		if(this.timeout)clearTimeout(this.timeout);
		this.timeout=setTimeout(()=>this.remove(),time||Math.max((this.texts?this.texts.length:0)*0.6*1000,5000));
	}
	setText(text){
		this.msg.innerHTML='';
		let e=O2H(text);
		e&&this.msg.appendChild(e);
		if(text instanceof HTMLElement)text=text.textContent;
		let texts=String(text).match(/\w+|\S/g);
		this.text=text;
		this.texts=texts;
	}
	renew(text,time){
		this.setText(text);
		this.setTimeout(time);
		if(!this.using)this.show();
	}
	show(){
		if(this.using)return;
		this.msg.style.opacity=0;
		if(this.parentNode && this.parentNode!==this.msg.parentNode){
			this.parentNode.appendChild(this.msg);
		}
		this.msg.parentNode&&setTimeout(()=>{
			this.using=true;
			this.msg.style.opacity=1;
		},0);
		this.setTimeout();
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
			this.msg.parentNode&&this.msg.parentNode.removeChild(this.msg);
		},600);
	}
}

export {
	NyaPCommon,
	DomTools,
	Utils,
}
