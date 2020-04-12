/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';
import {NyaPCommon,
	DomTools,
	Utils,
} from './NyaPCommon.js';
const O2H=DomTools.Object2HTML;


//NyaPTouch options
const NyaPTouchOptions={
	danmakuColors:['fff','6cf','ff0','f00','0f0','00f','f0f','000'],//colors in the danmaku style pannel
	danmakuModes:[0,3,2,1],//0:right	1:left	2:bottom	3:top   ;; mode in the danmaku style pannel
	danmakuSizes:[20,24,36],//danmaku size buttons in the danmaku style pannel
	dragToSeek:true,//drag ←→ direction on the video to seek
	dragToChangeVolume:true,//drag ↑↓ direction on the video to change volume
	bottomControlHeight:50,//control bar height
	progressBarHeight:14,
	progressPad:10,//progress bar side margin
	fullScreenToFullPageIfNotSupported:true,
}

//touch player
class NyaPTouch extends NyaPCommon{
	constructor(opt){
		super(Utils.deepAssign({},NyaPTouchOptions,opt));
		opt=this.opt;
		const NP=this,
			_t=this._t,
			$=this.$,
			video=this.video;

		//set icons
		function icon(name,event,attr={}){
			const ico=opt.icons[name];
			return O2H({_:'span',event,attr,prop:{id:`icon_span_${name}`,
				innerHTML:`<svg height="${NP.opt.bottomControlHeight}" width="${NP.opt.bottomControlHeight/ico[1]*ico[0]}" viewBox="0,0,${ico[0]},${ico[1]}" id="icon_${name}"">${ico[2]}</svg>`}});
		}

		this.stat('creating_player');

		let fullScreenToFullPage=opt.fullScreenToFullPageIfNotSupported&&this._.ios;
		//create player elements
		this._.player=O2H({
			_:'div',attr:{class:'NyaPTouch',id:'NyaPTouch'},child:[
				this.videoFrame,
				{_:'div',prop:{id:'controls'},child:[
					{_:'div',prop:{id:'control_bottom'},child:[
						{_:'div',attr:{id:'control_bottom_first'},child:[
							{_:'div',attr:{id:'progress_leftside_button'},child:[
								icon('play',{click:e=>this.playToggle()})
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
								icon(fullScreenToFullPage?'fullPage':'fullScreen',{click:e=>this.playerMode(fullScreenToFullPage?'fullPage':'fullScreen')}),
							]},
						]},
						{_:'div',attr:{id:'control_bottom_second'},child:[
							{_:'span',attr:{id:'danmakuStyleEditor',tabindex:0},child:[
								icon('danmakuStyle',{click:e=>this.danmakuStyleToggle()}),
								{_:'div',attr:{id:'danmaku_size_box'}},
								{_:'div',attr:{id:'danmaku_mode_box'}},
								{_:'div',attr:{id:'danmaku_color_box'}},
							]},
							{_:'input',attr:{id:'danmaku_input',placeholder:_t('Input danmaku here')}},
							icon('danmakuToggle',{click:e=>this.Danmaku.toggle()},{class:'active_icon'}),
							icon('loop',{click:e=>video.loop=!video.loop}),
							icon('volume',{click:e=>video.muted=!video.muted}),
						]},
					]},
				]},
			]
		});

		//add private vars
		Object.assign(NP._,{
			currentDragMode:null,
			touchStartPoint:[0,0],
			bottomControlDraging:undefined,
			bottomControlTransformY:0,
			preVideoStat:false,
			seekTo:0,
		});

		//calc progress and control_bottom styles
		Object.assign($('#progress_wrap').style,{
			left:this.opt.progressPad+'px',
			right:this.opt.progressPad+'px',
			height:this.opt.progressBarHeight+'px',
			marginTop:(-this.opt.progressBarHeight/2+1)+'px',
		});
		$('#control_bottom').style.marginTop=`-${this.opt.bottomControlHeight}px`;

		//add extra touch event to video
		extendEvent.doubletouch($('#main_video'));
		extendEvent.touchdrag($('#main_video'),{allowMultiTouch:false,preventDefaultX:true});
		extendEvent.touchdrag($('#control_bottom'),{allowMultiTouch:false,preventDefaultY:true});

		//events
		const events={
			main_video:{
				playing:e=>NP._iconActive('play',true),
				pause:e=>{
					NP._iconActive('play',false);
				},
				loadedmetadata:e=>{
					NP._setDisplayTime(null,Utils.formatTime(video.duration,video.duration));
				},
				volumechange:e=>{
					//show volume msg
					NP._.volumeBox.renew(`${_t('volume')}:${(video.volume*100).toFixed(0)}%`+`${video.muted?('('+_t('muted')+')'):''}`,3000);
					//change icon style
					Utils.setAttrs($('#volume_circle'),{'stroke-dasharray':`${video.volume*12*Math.PI} 90`,style:`fill-opacity:${video.muted?.2:.6}!important`});
				},
				progress:e=>NP.drawProgress(),
				click:e=>{
					e.preventDefault();
					NP.controlsToggle();
				},
				doubletouch:e=>NP.playToggle(),
				timeupdate:(e)=>{
					let t=Date.now();
					if(t-NP._.lastTimeUpdate <30)return;
					NP._setDisplayTime(Utils.formatTime(video.currentTime,video.duration));
					NP.drawProgress();
					NP._.lastTimeUpdate=t;
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
							video.volume=Utils.clamp(video.volume-e.deltaY/200,0,1);
							break;
						}
						case 'seek':{
							let mu=1+Math.abs(e.touches[0].clientY-NP._.touchStartPoint[1])/5;
							NP._.seekTo=Utils.clamp(NP._.seekTo+(e.deltaX/100)*mu,0,video.duration);
							NP.emit('seekMark',NP._.seekTo);
							break;
						}
					}
				},
				touchend:e=>{
					if(NP._.currentDragMode==='seek'){
						video.currentTime=NP._.seekTo;
						$('#progress_bar').style.width=`${(NP._.seekTo/video.duration*100).toFixed(2)}%`;
						NP.$('#seekTo_bar').hidden=true;
						NP._setDisplayTime(null,Utils.formatTime(video.duration,video.duration));
					}
					NP._.currentDragMode=null;
				},
				contextmenu:e=>{
					e.preventDefault();
					if(!opt.dragToChangeVolume)return;
					NP._.currentDragMode='volume';
					NP._.volumeBox.renew(`${_t('volume')}:${(video.volume*100).toFixed(0)}%`+`${video.muted?('('+_t('muted')+')'):''}`,3000);
				},
			},
			control_bottom:{
				touchdrag:e=>{
					if(NP._.bottomControlDraging===undefined){
						NP._.bottomControlDraging=(Math.abs(e.deltaY)>Math.abs(e.deltaX));
					}
					if(NP._.bottomControlDraging)
						NP._bottomControlTransformY(
							Utils.clamp(
								NP._.bottomControlTransformY-e.deltaY,
								0,
								$('#control_bottom').offsetHeight-NP.opt.bottomControlHeight
							)
						);
				},
				touchend:e=>{
					if(NP._.bottomControlDraging==undefined)return;
					NP._.bottomControlDraging=undefined;
					let R=$('#control_bottom').offsetHeight-NP.opt.bottomControlHeight;
					NP._bottomControlTransformY(NP._.bottomControlTransformY<(R/2)?0:R);
				},
			},
			progress_frame:{
				click:e=>{
					let t=e.target,pad=NP.opt.progressPad,
						pre=Utils.clamp((e.offsetX-pad)/(t.offsetWidth-2*pad),0,1);
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
					if(!DomTools.isFullscreen())return;
					$('#control_bottom').style.top=0;
					NP._bottomControlTransformY(0);
				},
				blur:e=>{
					setTimeout(()=>{if(NP._.preVideoStat)video.play();},100);
					if($('#control_bottom').style.top=='')return;
					$('#control_bottom').style.top='';
					NP._bottomControlTransformY($('#control_bottom').offsetHeight-NP.opt.bottomControlHeight);
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
							$(`#icon_span_danmakuMode${NP._.danmakuMode}`).classList.remove('active');
						$(`#icon_span_danmakuMode${m}`).classList.add('active');
						NP._.danmakuMode=m;
					}
				}
			},
			danmaku_size_box:{
				click:e=>{
					let t=e.target;
					if(!t.size)return;
					Utils.toArray($('#danmaku_size_box').childNodes).forEach(sp=>{
						if(NP._.danmakuSize===sp.size)sp.classList.remove('active');
					});
					t.classList.add('active');
					NP._.danmakuSize=t.size;
				}
			},
			danmaku_color_box:{
				click:e=>{
					if(e.target.color){
						let c=NP.Danmaku.isVaildColor(e.target.color);
						if(c){//match valid hex color code
							NP._.danmakuColor=c;
							Utils.toArray($('#danmaku_color_box').childNodes).forEach(cp=>{
								if(cp===e.target)cp.classList.add('active');
								else cp.classList.remove('active');
							});
						}else{
							NP._.danmakuColor=undefined;
							c=NP.Danmaku.isVaildColor(NP.opt.danmaku.defaultDanmakuColor);
							Utils.toArray($('#danmaku_color_box').childNodes).forEach(cp=>cp.classList.remove('active'));
						}
					}
				}
			},
		};
		for(let eleid in events){//add events to elements
			let el=$(`#${eleid}`);
			if(!el)continue;
			let eves=events[eleid];
			eves&&DomTools.addEvents($(`#${eleid}`),eves);
		}
		DomTools.addEvents(this,{
			video_loopChange:value=>NP._iconActive('loop',value),
			danmakuFrameToggle:bool=>this._iconActive('danmakuToggle',bool),//listen danmakuToggle event to change button style
			seekMark:t=>{
				if($('#seekTo_bar').hidden)$('#seekTo_bar').hidden=false;
				$('#seekTo_bar').style.width=`${(t/video.duration*100).toFixed(2)}%`;
				NP._setDisplayTime(null,Utils.formatTime(t,video.duration));
			},
			playerModeChange:mode=>{
				['fullScreen'].forEach(m=>{
					NP._iconActive(m,mode===m);
				});
			},
		});
		DomTools.addEvents(document,{
			'fullscreenchange,mozfullscreenchange,webkitfullscreenchange,msfullscreenchange':e=>{
				if(NP.currentPlayerMode=='fullScreen' && !DomTools.isFullscreen())
					NP.playerMode('normal');
			},
			visibilitychange:e=>{
				if(document.hidden)NP._.preVideoStat=false;
			},
		});


		//danmaku ui
		if(this._danmakuEnabled){
			//danmaku sizes
			opt.danmakuSizes&&opt.danmakuSizes.forEach((s,ind)=>{
				let el=O2H({_:'span',attr:{style:`font-size:${16+ind*3}px;`,title:s},prop:{size:s},child:['A']});
				$('#danmaku_size_box').appendChild(el);
				if(typeof opt.defaultDanmakuSize === 'number' && s===opt.defaultDanmakuSize){
					el.click();
				}
			});
			//danmaku colors
			opt.danmakuColors&&opt.danmakuColors.forEach(c=>{
				let el=O2H({_:'span',attr:{style:`background-color:#${c};`,title:c},prop:{color:c}});
				$('#danmaku_color_box').appendChild(el);
			});
			//danmaku modes
			opt.danmakuModes&&opt.danmakuModes.forEach(m=>{
				let el=icon(`danmakuMode${m}`);
				$('#danmaku_mode_box').appendChild(el);
				if(Number.isInteger(opt?.uiOptions?.danmakuMode)&&(m===opt.uiOptions.danmakuMode)){
					el.click();
				}
			});
		}else{
			this.$$('[id*=danmaku]').forEach(el=>{//remove danmaku buttons
				el.parentNode,removeChild(el);
			});
		}

		//put into the container
		if(opt.playerContainer instanceof HTMLElement)
			opt.playerContainer.appendChild(NP.player);

		this.statResult('creating_player');
	}

	controlsToggle(bool=this.$('#controls').hidden){
		this.$('#controls').hidden=!bool;
	}
	danmakuStyleToggle(bool=!this.$('#danmakuStyleEditor').style.overflow){
		this.$('#danmakuStyleEditor').style.overflow=bool?'initial':'';
	}
	_bottomControlTransformY(y=this._.bottomControlTransformY){
		this._.bottomControlTransformY=y;
		this.$('#control_bottom').style.transform=`translate3d(0,-${y}px,0)`;
	}
	drawProgress(){
		const V=this.video,
				B=V.buffered,
				D=V.duration;
		let lastBuffered=0;
		if(B.length)lastBuffered=B.end(B.length-1);
		this.$('#buffed_bar').style.width=`${(lastBuffered/D*100).toFixed(2)}%`;
		this.$('#progress_bar').style.width=`${(V.currentTime/D*100).toFixed(2)}%`;
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
	doubletouch:function(element,opt){//enable doubletouch event
		//触摸中出现离开则开始定时
		//定时400毫秒内出现离开事件后判断触点位置组，
		let lastTouches=[],//store touches array of a previous event
			currentTouches=[],//e.touches
			checking=false,//checking if the event should be fired
			checkTimeout=0;//setTimeout
		function reset(){
			clearTimeout(checkTimeout);
			lastTouches=[];
			currentTouches=[];
			checking=false;
		}
		opt=Object.assign({},extendEventDefaultOpt.doubletouch,opt);
		element.addEventListener('touchstart',function(e){
			currentTouches=e.touches;//touches of this touch event
		});
		element.addEventListener('touchend',function(e){
			if(e.touches.length!==0)return;
			let _lastTouches=lastTouches;
			lastTouches=currentTouches;
			if(checking){
				clearTimeout(checkTimeout);
				do{
					if(_lastTouches.length!==currentTouches.length)break;//points not match
					//compare evert points' position
					let lP=[];
					for(let i=_lastTouches.length;i--;)//get points of last touches
						lP.push([_lastTouches[i].clientX,_lastTouches[i].clientY]);
					for(let i=currentTouches.length;i--;){
						for(let i2=lP.length;i2--;){
							//remove points that are not more than 6 pixels far from last point
							if(lineLength(currentTouches[i].clientX,currentTouches[i].clientY,lP[i2][0],lP[i2][1])<=6){
								lP.splice(i2,1);
							}
						}
					}
					if(lP.length!==0)break;//some points are not at the same place
					//ok
					if(opt.preventDefault)e.preventDefault();
					let event=new TouchEvent('doubletouch',e);
					event.points=currentTouches.length;
					element.dispatchEvent(event);
				}while(0);
				reset();
			}else{
				checking=true;
				checkTimeout=setTimeout(()=>{
					checking=false;
				},400);
			}
		});
	}
}

function lineLength(ax,ay,bx,by){
	return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
}


window.NyaPTouch=NyaPTouch;
