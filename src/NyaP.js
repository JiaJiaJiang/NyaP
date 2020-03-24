/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {NyaPCommon,
		DomTools,
		Utils
} from './NyaPCommon.js';
const O2H=DomTools.Object2HTML;


//NyaP options
const NyaPOptions={
	autoHideDanmakuInput:true,//hide danmakuinput after danmaku sending
	danmakuColors:['fff','6cf','ff0','f00','0f0','00f','f0f','000'],//colors in the danmaku style pannel
	danmakuModes:[0,3,2,1],//0:right	1:left	2:bottom	3:top  ;; mode in the danmaku style pannel
	danmakuSizes:[20,24,36],//danmaku size buttons in the danmaku style pannel
}

//normal player
class NyaP extends NyaPCommon{
	get icons(){return this.opt.icons;}
	constructor(opt){
		super(Utils.deepAssign({},NyaPOptions,opt));
		opt=this.opt;
		const NP=this,
			_t=this._t,
			$=this.$,
			video=this.video;
		//set icons
		function icon(name,event,attr={}){
			const ico=opt.icons[name];
			return O2H({_:'span',event,attr,prop:{id:`icon_span_${name}`,
				innerHTML:`<svg height=${ico[1]} width=${ico[0]} id="icon_${name}"">${ico[2]}</svg>`}});
		}
		
		this.stat('creating_player');

		//create player elements
		NP._.player=O2H({
			_:'div',attr:{class:'NyaP',id:'NyaP',tabindex:0},child:[
				NP.videoFrame,
				{_:'div',attr:{id:'controls'},child:[
					{_:'div',attr:{id:'control'},child:[
						{_:'span',attr:{id:'control_left'},child:[
							icon('play',{click:e=>NP.playToggle()},{title:_t('play')}),
						]},
						{_:'span',attr:{id:'control_center'},child:[
							{_:'div',prop:{id:'progress_info'},child:[
								{_:'span',child:[
									{_:'canvas',prop:{id:'progress',pad:10}},
								]},
								{_:'span',prop:{id:'time'},child:[
									{_:'span',prop:{id:'current_time'},child:['00:00']},
									'/',
									{_:'span',prop:{id:'total_time'},child:['00:00']},
								]},
							]},
							{_:'div',prop:{id:'danmaku_input_frame'},child:[
								{_:'span',prop:{id:'danmaku_style'},child:[
									{_:'div',attr:{id:'danmaku_style_pannel'},child:[
										{_:'div',attr:{id:'danmaku_color_box'}},
										{_:'input',attr:{id:'danmaku_color',placeholder:_t('hex color'),maxlength:"6"}},
										{_:'span',attr:{id:'danmaku_mode_box'}},
										{_:'span',attr:{id:'danmaku_size_box'}},
									]},
									icon('danmakuStyle'),
								]},
								{_:'input',attr:{id:'danmaku_input',placeholder:_t('Input danmaku here')}},
								{_:'span',prop:{id:'danmaku_submit',innerHTML:_t('Send')}},
							]}
						]},
						{_:'span',attr:{id:'control_right'},child:[
							icon('addDanmaku',{click:e=>NP.danmakuInput()},{title:_t('danmaku input(Enter)')}),
							icon('danmakuToggle',{click:e=>NP.Danmaku.toggle()},{title:_t('danmaku toggle(D)'),class:'active_icon'}),
							icon('volume',{},{title:`${_t('volume')}:(${video.muted?_t('muted'):(video.volume*100|0)+'%'})([shift]+↑↓)(${_t('wheeling')})`}),
							icon('loop',{click:e=>{video.loop=!video.loop;}},{title:_t('loop')+'(L)'}),
							{_:'span',prop:{id:'player_mode'},child:[
								icon('fullScreen',{click:e=>NP.playerMode('fullScreen')},{title:_t('full screen(F)')}),
								icon('fullPage',{click:e=>NP.playerMode('fullPage')},{title:_t('full page(P)')})
							]}
						]},
					]}
				]},
			]
		});


		//progress
		setTimeout(()=>{//add resize event
			DomTools.resizeEvent.observe($('#control'));
			DomTools.addEvents($('#control'),{
				resize:e=>NP.resizeProgress(),
			});
			NP.resizeProgress();
		},0);
		NP._.progressContext=$('#progress').getContext('2d');

		//events
		const events={
			main_video:{
				playing:e=>NP._iconActive('play',true),
				pause:e=>{
					NP._iconActive('play',false);
				},
				timeupdate:(e)=>{
					if(Date.now()-NP._.lastTimeUpdate <30)return;
					NP._setDisplayTime(Utils.formatTime(video.currentTime,video.duration));
					NP.drawProgress();
					NP._.lastTimeUpdate=Date.now();
				},
				loadedmetadata:e=>{
					NP._setDisplayTime(null,Utils.formatTime(video.duration,video.duration));
				},
				volumechange:e=>{
					//show volume msg
					NP._.volumeBox.renew(`${_t('volume')}:${(video.volume*100).toFixed(0)}%`+`${video.muted?('('+_t('muted')+')'):''}`,3000);
					//change icon style
					Utils.setAttrs($('#volume_circle'),{'stroke-dasharray':`${video.volume*12*Math.PI} 90`,style:`fill-opacity:${video.muted?.2:.6}!important`});
					//change icon tip
					$('#icon_span_volume').setAttribute('title',`${_t('volume')}:(${video.muted?_t('muted'):((video.volume*100|0)+'%')})([shift]+↑↓)(${_t('wheeling')})`);
				},
				progress:e=>NP.drawProgress(),
				click:e=>NP.playToggle(),
				contextmenu:e=>e.preventDefault(),
				error:()=>{
					NP.msg(`视频加载错误`,'error');
					this.log('video error','error');
				}
			},
			danmaku_container:{
				click:e=>NP.playToggle(),
				contextmenu:e=>e.preventDefault(),
			},
			progress:{
				'mousemove,click':e=>{
					let t=e.target,
						pre=Utils.clamp((e.offsetX-t.pad)/(t.offsetWidth-2*t.pad),0,1);
					if(e.type==='mousemove'){
						NP._.progressX=e.offsetX;NP.drawProgress();
						NP._setDisplayTime(null,Utils.formatTime(pre*video.duration,video.duration));	
					}else if(e.type==='click'){
						video.currentTime=pre*video.duration;
					}
				},
				mouseout:e=>{
					NP._.progressX=undefined;NP.drawProgress();
					NP._setDisplayTime(null,Utils.formatTime(video.duration,video.duration));
				},
			},
			danmaku_style_pannel:{
				click:e=>{if(e.target.tagName!=='INPUT')setImmediate(a=>NP.$('#danmaku_input').focus())},
			},
			danmaku_color:{
				'input,change':e=>{
					let i=e.target,c=NP.Danmaku.isVaildColor(i.value);
					if(c){//match valid hex color code
						i.style.backgroundColor=`#${c}`;
						NP._.danmakuColor=c;
					}else{
						NP._.danmakuColor=undefined;
						c=NP.Danmaku.isVaildColor(NP.opt.defaultDanmakuColor);
						i.style.backgroundColor=c?`#${c}`:'';
					}
				},
			},
			icon_span_volume:{
				click:e=>video.muted=!video.muted,
				wheel:e=>{
					e.preventDefault();
					if(e.deltaMode!==0)return;
					let delta;
					if(e.deltaY>10 || e.deltaY<-10)delta=-e.deltaY/10;
					else{delta=e.deltaY;}
					if(e.shiftKey)delta=delta>0?10:-10;
					video.volume=Utils.clamp(video.volume+(delta/100),0,1);
				}
			},
			danmaku_input:{
				keydown:e=>{if(e.key==='Enter'){NP.send();}else if(e.key==='Escape'){NP.danmakuInput(false);}}
			},
			danmaku_submit:{
				click:e=>NP.send(),
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
						$('#danmaku_color').value=e.target.color;
						$('#danmaku_color').dispatchEvent(new Event('change'));
					}
				}
			},
		}
		for(let eleid in events){//add events to elements
			let el=$(`#${eleid}`);
			if(!el)continue;
			let eves=events[eleid];
			eves&&DomTools.addEvents($(`#${eleid}`),eves);
		}
		DomTools.addEvents(this,{
			danmakuFrameToggle:bool=>NP._iconActive('danmakuToggle',bool),//listen danmakuToggle event to change button style
			playerModeChange:mode=>{
				['fullPage','fullScreen'].forEach(m=>{
					NP._iconActive(m,mode===m);
				});
			},
			video_loopChange:value=>NP._iconActive('loop',value),
		});
		DomTools.addEvents(this._.player,{
			keydown:e=>NP._playerKeyHandle(e),
			mousemove:e=>{
				this._userActiveWatcher(true);
			}
		});
		DomTools.addEvents(document,{
			'fullscreenchange,mozfullscreenchange,webkitfullscreenchange,msfullscreenchange':e=>{
				if(NP._.playerMode=='fullScreen' && !DomTools.isFullscreen())
					NP.playerMode('normal');
			}
		});


		
		//danmaku ui
		if(this._danmakuEnabled){
			//danmaku sizes
			opt.danmakuSizes&&opt.danmakuSizes.forEach((s,ind)=>{
				let e=O2H({_:'span',attr:{style:`font-size:${12+ind*3}px;`,title:s},prop:{size:s},child:['A']});
				$('#danmaku_size_box').appendChild(e);
				if(s===opt?.uiOptions?.danmakuSize){//click specified button
					e.click();
				}
			});
			//danmaku colors
			opt.danmakuColors&&opt.danmakuColors.forEach(c=>{
				let e=O2H({_:'span',attr:{style:`background-color:#${c};`,title:c},prop:{color:c}});
				$('#danmaku_color_box').appendChild(e);
			});
			if(opt?.uiOptions?.danmakuColor){//set default color
				$('#danmaku_color').value=opt.uiOptions.danmakuColor;
			}
			//danmaku modes
			opt.danmakuModes&&opt.danmakuModes.forEach(m=>{
				let e=icon(`danmakuMode${m}`);
				$('#danmaku_mode_box').appendChild(e);
				if(m===opt?.uiOptions?.danmakuMode){//click specified button
					e.click();
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
	_userActiveWatcher(active=false){//watch user active,for auto hiding ui
		let delay=5000,t=Date.now();
		if(active){
			this._.lastUserActive=t;
			if(this._.userInactive){
				this._.userInactive=false;
				this.player.classList.remove('user-inactive');
			}
		}
		if(this._.userActiveTimer)return;
		this._.userActiveTimer=setTimeout(()=>{
			this._.userActiveTimer=0;
			let now=Date.now();
			if(now-this._.lastUserActive<delay){
				this._userActiveWatcher();
			}else{
				this.player.classList.add('user-inactive');
				this._.userInactive=true;
			}
		},delay-t+this._.lastUserActive);
	}
	_playerKeyHandle(e){//hot keys
		if(e.target.tagName==='INPUT')return;
		const V=this.video,_SH=e.shiftKey,_RE=e.repeat;
		//to prevent default,use break.otherwise,use return.
		switch(e.key){
			case ' ':{
				if(_RE)return;//ignore repeat keys
				this.playToggle();break;
			}
			case 'ArrowRight':{//seek forward
				V.currentTime+=(3*(_SH?2:1));break;
			}
			case 'ArrowLeft':{//seek backward
				V.currentTime-=(1.5*(_SH?2:1));break;
			}
			case 'ArrowUp':{//volume up
				V.volume=Utils.clamp(V.volume+(0.03*(_SH?2:1)),0,1);break;
			}
			case 'ArrowDown':{//volume down
				V.volume=Utils.clamp(V.volume-(0.03*(_SH?2:1)),0,1);break;
			}
			case 'p':{//full page
				if(_RE)return;
				this.playerMode('fullPage');break;
			}
			case 'f':{//fullscreen
				this.playerMode('fullScreen');break;
			}
			case 'd':{//danmaku toggle
				if(_RE)return;
				this._danmakuEnabled&&this.Danmaku.toggle();break;
			}
			case 'm':{//mute
				if(_RE)return;
				this.video.muted=!this.video.muted;break;
			}
			case 'l':{//loop
				this.video.loop=!this.video.loop;break;
			}
			case 'Enter':{//danmaku input toggle
				if(_RE)return;
				this._danmakuEnabled&&this.danmakuInput();break;
			}
			case 'Escape':{//exit full page mode
				if(this._.playerMode==='fullPage'){
					this.playerMode('normal');break;
				}
				return;
			}
			default:return;
		}
		e.preventDefault();
	}
	danmakuInput(bool=!this.$('#danmaku_input_frame').offsetHeight){//hide or show danmaku input
		let $=this.$;
		$('#danmaku_input_frame').style.display=bool?'flex':'';
		this._iconActive('addDanmaku',bool);
		setImmediate(()=>{bool?$('#danmaku_input').focus():this._.player.focus();});
	}
	resizeProgress(){
		const c=this.$('#progress');
		c.width=c.offsetWidth;
		c.height=c.offsetHeight;
		this.drawProgress();
		this.emit('progressRefresh');
	}
	send(){
		let color=this._.danmakuColor||this.opt.defaultDanmakuColor,
			text=this.$('#danmaku_input').value,
			size=this._.danmakuSize,
			mode=this._.danmakuMode,
			time=this.time,
			d={color,text,size,mode,time};

		let S=this.Danmaku.send(d,danmaku=>{
			if(danmaku&&danmaku._==='text')
				this.$('#danmaku_input').value='';
			danmaku.highlight=true;
			this.load(danmaku,true);
			if(this.opt.autoHideDanmakuInput){this.danmakuInput(false);}
		});

		if(!S){
			this.danmakuInput(false);
			return;
		}
	}
	_progressDrawer(){
		const ctx=this._.progressContext,
				c=this.$('#progress'),
				w=c.width,
				h=c.height,
				v=this.video,
				d=v.duration,
				cT=v.currentTime,
				pad=c.pad,
				len=w-2*pad;
		let i;
		ctx.clearRect(0,0,w,h);
		ctx.lineCap = "round";
		//background
		ctx.beginPath();
		ctx.strokeStyle='#eee';
		ctx.lineWidth=7;
		ctx.moveTo(pad, 15);
		ctx.lineTo(pad+len, 15);
		ctx.stroke();
		//buffered
		ctx.beginPath();
		ctx.strokeStyle = '#C0BBBB';
		ctx.lineWidth = 2;
		let tr = v.buffered;
		for (i = tr.length;i--;) {
			ctx.moveTo(pad+tr.start(i) / d * len, 18);
			ctx.lineTo(pad+tr.end(i) / d * len, 18);
		}
		ctx.stroke();
		//progress
		ctx.beginPath();
		ctx.strokeStyle='#6cf';
		ctx.lineWidth = 5;
		ctx.moveTo(pad,15);
		ctx.lineTo(pad+len*cT/d,15);
		ctx.stroke();
		//already played
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(255,255,255,.3)';
		ctx.lineWidth = 5;
		tr = v.played;
		for (i = tr.length;i--;) {
			ctx.moveTo(pad+tr.start(i) / d * len, 15);
			ctx.lineTo(pad+tr.end(i) / d * len, 15);
		}
		ctx.stroke();
		//mouse
		if(this._.progressX){
			ctx.beginPath();
			ctx.strokeStyle='rgba(0,0,0,.05)';
			ctx.moveTo(pad+len*cT/d,15);
			ctx.lineTo(Utils.clamp(this._.progressX,pad,pad+len),15);
			ctx.stroke();
		}
		this._.drawingProgress=false;
	}
	drawProgress(){
		if(this._.drawingProgress)return;
		this._.drawingProgress=true;
		requestAnimationFrame(()=>this._progressDrawer());//prevent progress bar drawing multi times in a frame
	}
}




window.NyaP=NyaP;
