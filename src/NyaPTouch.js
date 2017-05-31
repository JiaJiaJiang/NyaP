/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {i18n} from './i18n.js';
import O2H from '../lib/Object2HTML/Object2HTML.js'
import {Object2HTML} from '../lib/Object2HTML/Object2HTML.js';
import {NyaPlayerCore,
		addEvents,
		requestFullscreen,
		exitFullscreen,
		formatTime,
		setAttrs,
		padTime,
		limitIn,
		toArray} from './NyaPCore.js';

const _=i18n._;

//NyaPTouch options
const NyaPTouchOptions={
	//autoHideDanmakuInput:true,//hide danmakuinput after danmaku sending
	danmakuColors:['fff','6cf','ff0','f00','0f0','00f','f0f','000'],//colors in the danmaku style pannel
	danmakuModes:[0,3,2,1],//0:right	1:left	2:bottom	3:top
	danmakuSizes:[20,24,36],
	dragToSeek:true,
	dragToChangeVolume:true,
	bottomControlHeight:50,
	progressBarHeight:14,
	progressPad:10,
}

//touch player
class NyaPTouch extends NyaPlayerCore{
	constructor(opt){
		super(Object.assign({},NyaPTouchOptions,opt));
		opt=this.opt;
		const NP=this,
			$=NP.$,
			video=NP.video;

		const icons={
			play:[30,30,'<path d="m10.063,8.856l9.873,6.143l-9.873,6.143v-12.287z" stroke-width="3" stroke-linejoin="round"/>'],
			fullScreen:[30,30,'<rect stroke-linejoin="round" height="11.169" width="17.655" y="9.415" x="6.172" stroke-width="1.5"/>'
							  +'<path stroke-linejoin="round" d="m12.361,11.394l-3.604,3.605l3.605,3.605l1.311,-1.311l-2.294,-2.294l2.293,-2.294l-1.311,-1.311zm5.275,0l-1.310,1.311l2.293,2.294l-2.293,2.293l1.310,1.311l3.605,-3.605l-3.605,-3.605z"/>'],
			loop:[30,30,'<path stroke-linejoin="round" stroke-width="1" d="m20.945,15.282c-0.204,-0.245 -0.504,-0.387 -0.823,-0.387c-0.583,0 -1.079,0.398 -1.205,0.969c-0.400,1.799 -2.027,3.106 -3.870,3.106c-2.188,0 -3.969,-1.780 -3.969,-3.969c0,-2.189 1.781,-3.969 3.969,-3.969c0.720,0 1.412,0.192 2.024,0.561l-0.334,0.338c-0.098,0.100 -0.127,0.250 -0.073,0.380c0.055,0.130 0.183,0.213 0.324,0.212l2.176,0.001c0.255,-0.002 0.467,-0.231 0.466,-0.482l-0.008,-2.183c-0.000,-0.144 -0.085,-0.272 -0.217,-0.325c-0.131,-0.052 -0.280,-0.022 -0.379,0.077l-0.329,0.334c-1.058,-0.765 -2.340,-1.182 -3.649,-1.182c-3.438,0 -6.236,2.797 -6.236,6.236c0,3.438 2.797,6.236 6.236,6.236c2.993,0 5.569,-2.133 6.126,-5.072c0.059,-0.314 -0.022,-0.635 -0.227,-0.882z"/>'],
			danmakuStyle:[30,30,'<path style="fill-opacity:1!important" d="m21.781,9.872l-1.500,-1.530c-0.378,-0.385 -0.997,-0.391 -1.384,-0.012l-0.959,0.941l2.870,2.926l0.960,-0.940c0.385,-0.379 0.392,-0.998 0.013,-1.383zm-12.134,7.532l2.871,2.926l7.593,-7.448l-2.872,-2.927l-7.591,7.449l0.000,0.000zm-1.158,2.571l-0.549,1.974l1.984,-0.511l1.843,-0.474l-2.769,-2.824l-0.509,1.835z" stroke-width="0"/>'],
			danmakuToggle:[30,30,'<path d="m8.569,10.455l0,0c0,-0.767 0.659,-1.389 1.473,-1.389l0.669,0l0,0l3.215,0l6.028,0c0.390,0 0.765,0.146 1.041,0.406c0.276,0.260 0.431,0.613 0.431,0.982l0,3.473l0,0l0,2.083l0,0c0,0.767 -0.659,1.389 -1.473,1.389l-6.028,0l-4.200,3.532l0.985,-3.532l-0.669,0c-0.813,0 -1.473,-0.621 -1.473,-1.389l0,0l0,-2.083l0,0l0,-3.473z"/>'],
			volume:[30,30,'<ellipse id="volume_circle" style="fill-opacity:.6!important" ry="6" rx="6" cy="15" cx="15" stroke-dasharray="38 90" stroke-width="1.8"/>'],
			danmakuMode0:[30,30,'<path style="fill-opacity:1!important" stroke-width="0" d="m14.981,17.821l-7.937,-2.821l7.937,-2.821l0,1.409l7.975,0l0,2.821l-7.975,0l0,1.409l0,0.002z"/>'],
			danmakuMode1:[30,30,'<path style="fill-opacity:1!important" stroke-width="0" d="m15.019,12.178l7.937,2.821l-7.937,2.821l0,-1.409l-7.975,0l0,-2.821l7.975,0l0,-1.409l0,-0.002z"/>'],
			danmakuMode3:[30,30,'<path stroke-width="3" d="m7.972,7.486l14.054,0"/>'],
			danmakuMode2:[30,30,'<path stroke-width="3" d="m7.972,22.513l14.054,0"/>'],
			
		}
		function icon(name,event,attr={}){
			const ico=icons[name];
			return O2H({_:'span',event,attr,prop:{id:`icon_span_${name}`,
				innerHTML:`<svg height="${NP.opt.bottomControlHeight}" width="${NP.opt.bottomControlHeight/ico[1]*ico[0]}" viewBox="0,0,${ico[0]},${ico[1]}" id="icon_${name}"">${ico[2]}</svg>`}});
		}
		NP.loadingInfo(_('Creating touch player'));

		NP._.player=Object2HTML({
			_:'div',attr:{class:'NyaPTouch',id:'NyaPTouch'},child:[
				NP.videoFrame,
				{_:'div',prop:{id:'controls'},child:[
					{_:'div',prop:{id:'control_bottom'},child:[
						{_:'div',attr:{id:'control_bottom_first'},child:[
							{_:'div',attr:{id:'progress_leftside_button'},child:[
								icon('play',{click:e=>NP.playToggle()})
							]},
							{_:'div',prop:{id:'progress_info'},child:[
								{_:'span',attr:{id:'progress_frame'},child:[
									{_:'div',prop:{id:'progress_wrap'},child:[
										{_:'div',prop:{id:'buffed_bar'}},
										{_:'div',prop:{id:'progress_bar'}},
										{_:'div',prop:{id:'seekTo_bar',hidden:true}},
									]},
								]},
								{_:'span',prop:{id:'time'},child:[
									{_:'span',prop:{id:'current_time'},child:['00:00']},
									'/',
									{_:'span',prop:{id:'total_time'},child:['00:00']},
								]},
							]},
							{_:'span',prop:{id:'progress_rightside_button'},child:[
								icon('fullScreen',{click:e=>NP.playerMode('fullScreen')}),
							]},
						]},
						{_:'div',attr:{id:'control_bottom_second'},child:[
							{_:'span',attr:{id:'danmakuStyleEditor',tabindex:0},child:[
								icon('danmakuStyle',{click:e=>NP.danmakuStyleToggle()}),
								{_:'div',attr:{id:'danmaku_size_box'}},
								{_:'div',attr:{id:'danmaku_mode_box'}},
								{_:'div',attr:{id:'danmaku_color_box'}},
							]},
							{_:'input',attr:{id:'danmaku_input',placeholder:_('Input danmaku here')}},
							icon('danmakuToggle',{click:e=>this.Danmaku.toggle()}),
							icon('loop',{click:e=>video.loop=!video.loop}),
							icon('volume',{click:e=>video.muted=!video.muted}),
						]},
					]},
				]},
			]
		});

		//msg box
		NP.videoFrame.appendChild(O2H({_:'div',attr:{id:'msg_box'}}));

		NP.collectEles(NP._.player);

		Object.assign(NP._,{
			currentDragMode:null,
			touchStartPoint:[0,0],
			bottomControlDraging:undefined,
			bottomControlTransformY:0,
			preVideoStat:false,
			volumeBox:new MsgBox('','info',$.msg_box),
		});

		Object.assign($.progress_wrap.style,{
			left:NP.opt.progressPad+'px',
			right:NP.opt.progressPad+'px',
			height:NP.opt.progressBarHeight+'px',
			marginTop:(-NP.opt.progressBarHeight/2+1)+'px',
		});

		$.control_bottom.style.marginTop=`-${NP.opt.bottomControlHeight}px`;

		//add touch drag event to video
		extendEvent.touchdrag($.main_video,{allowMultiTouch:false,preventDefaultX:true});
		extendEvent.touchdrag($.control_bottom,{allowMultiTouch:false,preventDefaultY:true});

		//danmaku sizes
		opt.danmakuSizes&&opt.danmakuSizes.forEach((s,ind)=>{
			let e=O2H({_:'span',attr:{style:`font-size:${16+ind*3}px;`,title:s},prop:{size:s},child:['A']});
			$.danmaku_size_box.appendChild(e);
		});

		//danmaku colors
		opt.danmakuColors&&opt.danmakuColors.forEach(c=>{
			let e=O2H({_:'span',attr:{style:`background-color:#${c};`,title:c},prop:{color:c}});
			$.danmaku_color_box.appendChild(e);
		});

		//danmaku modes
		opt.danmakuModes&&opt.danmakuModes.forEach(m=>{
			$.danmaku_mode_box.appendChild(icon(`danmakuMode${m}`));
		});
		NP.collectEles($.danmaku_mode_box);
		//events
		const events={
			document:{
				'fullscreenchange,mozfullscreenchange,webkitfullscreenchange,msfullscreenchange':e=>{
					if(NP._.playerMode=='fullScreen' && !NP.isFullscreen())
						NP.playerMode('normal');
				},
				visibilitychange:e=>{
					if(document.hidden)NP._.preVideoStat=false;
				},
			},
			main_video:{
				playing:e=>NP._iconActive('play',true),
				'pause,stalled':e=>{
					NP._iconActive('play',false);
				},
				loadedmetadata:e=>{
					NP._setTimeInfo(null,formatTime(video.duration,video.duration));
				},
				_loopChange:e=>NP._iconActive('loop',e.value),
				volumechange:e=>{
					NP._.volumeBox.renew(`${_('volume')}:${(video.volume*100).toFixed(0)}%`+`${video.muted?('('+_('muted')+')'):''}`);
					setAttrs($.volume_circle,{'stroke-dasharray':`${video.volume*12*Math.PI} 90`,style:`fill-opacity:${video.muted?.2:.6}!important`});
				},
				progress:e=>NP.drawProgress(),
				click:e=>{
					e.preventDefault();
					NP.controlsToggle();
				},
				dblclick:e=>NP.playToggle(),
				timeupdate:(e)=>{
					if(Date.now()-NP._.lastTimeUpdate <30)return;
					NP._setTimeInfo(formatTime(video.currentTime,video.duration));
					NP.drawProgress();
					NP._.lastTimeUpdate=Date.now();
				},
				touchstart:e=>{
					let T=e.changedTouches[0];
					if(NP._.currentDragMode)return;
					NP._.touchStartPoint=[T.clientX,T.clientY];
				},
				touchmove:e=>{
					if(NP._.currentDragMode)e.preventDefault();
				},
				touchdrag:e=>{
					if(!NP._.currentDragMode){//make sure the drag mode:seek,volume
						if(opt.dragToSeek&&Math.abs(e.deltaX)>Math.abs(e.deltaY)){//seek
							NP._.currentDragMode='seek';
							NP._.seekTo=video.currentTime;
						}
					}
					switch(NP._.currentDragMode){
						case 'volume':{
							video.volume=limitIn(video.volume-e.deltaY/200,0,1);
							break;
						}
						case 'seek':{
							let mu=1+Math.abs(e.touches[0].clientY-NP._.touchStartPoint[1])/5;
							NP._.seekTo=limitIn(NP._.seekTo+(e.deltaX/100)*mu,0,video.duration);
							NP.emit('seekMark',NP._.seekTo);
							break;
						}
					}
				},
				touchend:e=>{
					if(NP._.currentDragMode==='seek'){
						video.currentTime=NP._.seekTo;
						$.progress_bar.style.width=`${(NP._.seekTo/video.duration*100).toFixed(2)}%`;
						NP.$.seekTo_bar.hidden=true;
						NP._setTimeInfo(null,formatTime(video.duration,video.duration));
					}
					NP._.currentDragMode=null;
				},
				contextmenu:e=>{
					e.preventDefault();
					if(!opt.dragToChangeVolume)return;
					NP._.currentDragMode='volume';
					NP._.volumeBox.renew(`${_('volume')}:${(video.volume*100).toFixed(0)}%`+`${video.muted?('('+_('muted')+')'):''}`);
				},
			},
			control_bottom:{
				touchdrag:e=>{
					if(NP._.bottomControlDraging===undefined){
						NP._.bottomControlDraging=(Math.abs(e.deltaY)>Math.abs(e.deltaX));
					}
					if(NP._.bottomControlDraging)
						NP._bottomControlTransformY(
							limitIn(
								NP._.bottomControlTransformY-e.deltaY,
								0,
								$.control_bottom.offsetHeight-NP.opt.bottomControlHeight
							)
						);
				},
				touchend:e=>{
					if(NP._.bottomControlDraging==undefined)return;
					NP._.bottomControlDraging=undefined;
					let R=$.control_bottom.offsetHeight-NP.opt.bottomControlHeight;
					NP._bottomControlTransformY(NP._.bottomControlTransformY<(R/2)?0:R);
				},
			},
			progress_frame:{
				click:e=>{
					let t=e.target,pad=NP.opt.progressPad,
						pre=limitIn((e.offsetX-pad)/(t.offsetWidth-2*pad),0,1);
					video.currentTime=pre*video.duration;
				},
			},
			danmaku_input:{
				'keydown':e=>{
					if(e.key=='Enter')NP.send();
				},
				focus:e=>{
					NP._.preVideoStat=!video.paused;
					video.pause();
					if(!NP.isFullscreen())return;
					$.control_bottom.style.top=0;
					NP._bottomControlTransformY(0);
				},
				blur:e=>{
					setTimeout(()=>{if(NP._.preVideoStat)video.play();},100);
					if($.control_bottom.style.top=='')return;
					$.control_bottom.style.top='';
					NP._bottomControlTransformY($.control_bottom.offsetHeight-NP.opt.bottomControlHeight);
				},
			},
			danmakuStyleEditor:{
				blur:e=>NP.danmakuStyleToggle(false),
			},
			danmaku_mode_box:{
				click:e=>{
					let t=e.target;
					if(t.id.startsWith('icon_span_danmakuMode')){
						let m=1*t.id.match(/\d$/)[0];
						if(NP._.danmakuMode!==undefined)
							$[`icon_span_danmakuMode${NP._.danmakuMode}`].classList.remove('active');
						$[`icon_span_danmakuMode${m}`].classList.add('active');
						NP._.danmakuMode=m;
					}
				}
			},
			danmaku_size_box:{
				click:e=>{
					let t=e.target;
					if(!t.size)return;
					toArray($.danmaku_size_box.childNodes).forEach(sp=>{
						if(NP._.danmakuSize===sp.size)sp.classList.remove('active');
					});
					t.classList.add('active');
					NP._.danmakuSize=t.size;
				}
			},
			danmaku_color_box:{
				click:e=>{
					if(e.target.color){
						let i=e.target,c=NP.Danmaku.isVaildColor(e.target.color);
						if(c){//match valid hex color code
							NP._.danmakuColor=c;
							toArray($.danmaku_color_box.childNodes).forEach(cp=>{
								if(cp===e.target)cp.classList.add('active');
								else cp.classList.remove('active');
							});
						}else{
							NP._.danmakuColor=undefined;
							c=NP.Danmaku.isVaildColor(NP.opt.defaultDanmakuColor);
							toArray($.danmaku_color_box.childNodes).forEach(cp=>cp.classList.remove('active'));
						}
					}
				}
			},
			NP:{
				danmakuFrameToggle:bool=>this._iconActive('danmakuToggle',bool),//listen danmakuToggle event to change button style
				seekMark:t=>{
					if($.seekTo_bar.hidden)$.seekTo_bar.hidden=false;
					$.seekTo_bar.style.width=`${(t/video.duration*100).toFixed(2)}%`;
					NP._setTimeInfo(null,formatTime(t,video.duration));
				},
				playerModeChange:mode=>{
					['fullScreen'].forEach(m=>{
						NP._iconActive(m,mode===m);
					});
				},
			},
		};

		for(let eleid in $){//add events to elements
			let eves=events[eleid];
			eves&&addEvents($[eleid],eves);
		}

		Number.isInteger(opt.defaultDanmakuMode)
			&&$['icon_span_danmakuMode'+opt.defaultDanmakuMode].click();//init to default danmaku mode
		(typeof opt.defaultDanmakuSize === 'number')
			&&toArray($.danmaku_size_box.childNodes).forEach(sp=>{if(sp.size===opt.defaultDanmakuSize)sp.click()});

		
		if(NP.danmakuFrame.modules.TextDanmaku.enabled)NP._iconActive('danmakuToggle',true);

		if(opt.playerFrame instanceof HTMLElement)
			opt.playerFrame.appendChild(NP.player);
	}
	
	send(){
		let color=this._.danmakuColor||this.opt.defaultDanmakuColor,
			text=this.$.danmaku_input.value,
			size=this._.danmakuSize,
			mode=this._.danmakuMode,
			time=this.danmakuFrame.time,
			d={color,text,size,mode,time};

		let S=this.Danmaku.send(d,(danmaku)=>{
			if(danmaku&&danmaku._==='text')
				this.$.danmaku_input.value='';
			let result=this.danmakuFrame.modules.TextDanmaku.load(danmaku,this.video.paused);
			result.highlight=true;
		});
	}

	controlsToggle(bool=this.$.controls.hidden){
		this.$.controls.hidden=!bool;
	}
	danmakuStyleToggle(bool=!this.$.danmakuStyleEditor.style.overflow){
		this.$.danmakuStyleEditor.style.overflow=bool?'initial':'';
	}
	_bottomControlTransformY(y=this._.bottomControlTransformY){
		this._.bottomControlTransformY=y;
		this.$.control_bottom.style.transform=`translate3d(0,-${y}px,0)`;
	}
	drawProgress(){
		requestAnimationFrame(()=>{
			const V=this.video,
					B=V.buffered,
					D=V.duration;
			let lastBuffered=0;
			if(B.length)lastBuffered=B.end(B.length-1);
			this.$.buffed_bar.style.width=`${(lastBuffered/D*100).toFixed(2)}%`;
			this.$.progress_bar.style.width=`${(V.currentTime/D*100).toFixed(2)}%`;
		});
	}
	_iconActive(name,bool){
		this.$[`icon_span_${name}`].classList[bool?'add':'remove']('active_icon');
	}
	_setTimeInfo(a=null,b=null){
		requestAnimationFrame(()=>{
			if(a!==null){
				this.$.current_time.innerHTML=a;
			}
			if(b!==null){
				this.$.total_time.innerHTML=b;
			}
		});
	}

	msg(text,type='tip'){//type:tip|info|error
		let msg=new MsgBox(text,type,this.$.msg_box);
		requestAnimationFrame(()=>msg.show());
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
		let e=(text instanceof Node)?text:Object2HTML(text);
		this.msg.appendChild(e);
		if(text instanceof HTMLElement)text=text.textContent;
		let texts=String(text).match(/\w+|\S/g);
		this.text=text;
		this.texts=texts;
	}
	renew(text){
		this.setText(text);
		this.setTimeout();
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

var extendEventDefaultOpt={
	touchdrag:{
		preventDefault:false,
		preventDefaultX:false,
		preventDefaultY:false,
		allowMultiTouch:false,
	},
	doubletouch:{
		preventDefault:true,
	}
}
var extendEvent={//扩展事件
	touchdrag:function(element,opt){
		let stats={};
		opt=Object.assign({},extendEventDefaultOpt.touchdrag,opt);
		element.addEventListener('touchstart',function(e){
			if(!opt.allowMultiTouch && e.changedTouches.length>1){stats={};return;}
			let ct=e.changedTouches;
			for(let t=ct.length;t--;){
				stats[ct[t].identifier]=[ct[t].clientX,ct[t].clientY];
			}
		});
		element.addEventListener('touchmove',function(e){
			if(!opt.allowMultiTouch && e.touches.length>1){return;}
			let ct=e.changedTouches;
			for(let t=ct.length;t--;){
				let id=ct[t].identifier;
				if(!id in stats)continue;//不属于这个元素的事件
				let event=new TouchEvent('touchdrag',e);
				event.deltaX=ct[t].clientX-stats[id][0];
				event.deltaY=ct[t].clientY-stats[id][1];
				stats[id]=[ct[t].clientX,ct[t].clientY];
				if(opt.preventDefault
					||(opt.preventDefaultX && Math.abs(event.deltaX)>Math.abs(event.deltaY))
					||(opt.preventDefaultY && Math.abs(event.deltaX)<Math.abs(event.deltaY))){
					e.preventDefault();
				}
				element.dispatchEvent(event);
			}
		});
	},
	doubletouch:function(element,opt){
		let lastTouches=[],lastStartTime=0,fired=false,checking=false,started=false;
		opt=Object.assign({},extendEventDefaultOpt.doubletouch,opt);
		element.addEventListener('touchstart',function(e){
			let Ts=(e.touches.length>1)?toArray(e.touches):[e.touches[0]],lT=lastTouches;
			lastTouches=Ts;
			if(!started){
				lastStartTime=e.timeStamp;
				started=true;
			}else if(e.timeStamp-lastStartTime>400){
				started=false;
				return;
			}
			if(Ts.length!==lT.length || !checking)return;
			let lP=[];
			for(let i=Ts.length;i--;)
				lP.push([lT[i].clientX,lT[i].clientY]);
			for(let i=Ts.length;i--;){
				for(let i2=lP.length;i2--;){
					if(lineLength(Ts[i].clientX,Ts[i].clientY,lP[i2][0],lP[i2][1])<=6){
						lP.splice(i2,1);
					}
				}
			}
			if(lP.length!==0)return;
			if(opt.preventDefault)e.preventDefault();
			let event=new TouchEvent('doubletouch',e);
			event.points=Ts.length;
			element.dispatchEvent(event);
			started=checking=false;
			fired=true;
		});
		element.addEventListener('touchend',function(e){
			if(e.touches.length===0 && !fired){
				checking=true;
			}
			fired=false;
		});
		return listeners;
	}
}

function lineLength(ax,ay,bx,by){
	return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
}


window.NyaPTouch=NyaPTouch;
