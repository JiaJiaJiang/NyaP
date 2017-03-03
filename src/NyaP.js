/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {i18n} from './i18n.js';
import {Object2HTML} from '../lib/Object2HTML/Object2HTML.js'
import ResizeSensor from '../lib/danmaku-frame/lib/ResizeSensor.js';
import {NyaPlayerCore,
		addEvents,
		requestFullscreen,
		exitFullscreen,
		isFullscreen,
		formatTime,
		setAttrs,
		padTime,
		limitIn} from './NyaPCore.js';

const _=i18n._;


//NyaP options
const NyaPOptions={
	autoHideDanmakuInput:true,//hide danmakuinput after danmaku sent
	danmakuColors:['fff','6cf','ff0','f00','0f0','00f','f0f','000'],//colors in the danmaku style pannel
	defaultDanmakuColor:null,//when the color inputed is invalid,this color will be applied
	defaultDanmakuMode:0,//right
	danmakuSend:(d,callback)=>{callback(false);},//the func for sending danmaku
	danmakuSizes:[25,30,45],
	defaultDanmakuSize:30,

}

//normal player
class NyaP extends NyaPlayerCore{
	constructor(opt){
		super(Object.assign({},NyaPOptions,opt));
		opt=this.opt;
		const NP=this;
		const $=this.eles={};
		this._.playerMode='normal';
		const video=this.video;
		const icons={
			play:[30,30,'<path d="m10.063,8.856l9.873,6.143l-9.873,6.143v-12.287z" stroke-width="3" stroke-linejoin="round"/>'],
			addDanmaku:[30,30,'<path stroke-width="1.5" d="m20.514,20.120l0.551,-1.365l2.206,-0.341l-2.757,1.706h-13.787v-10.240h16.544v8.533" stroke-linejoin="round"/>'
								+'<path style="fill-opacity:1;stroke-width:0" d="m12.081,13.981h1.928v-1.985h1.978v1.985h1.928v2.036h-1.928v1.985h-1.978v-1.985h-1.928v-2.036z"/>'],
			danmakuStyle:[30,30,'<path style="fill-opacity:1!important" d="m21.781,9.872l-1.500,-1.530c-0.378,-0.385 -0.997,-0.391 -1.384,-0.012l-0.959,0.941l2.870,2.926l0.960,-0.940c0.385,-0.379 0.392,-0.998 0.013,-1.383zm-12.134,7.532l2.871,2.926l7.593,-7.448l-2.872,-2.927l-7.591,7.449l0.000,0.000zm-1.158,2.571l-0.549,1.974l1.984,-0.511l1.843,-0.474l-2.769,-2.824l-0.509,1.835z" stroke-width="0"/>'],
			fullPage:[30,30,'<path stroke-linejoin="round" d="m11.166,9.761l-5.237,5.239l5.237,5.238l1.905,-1.905l-3.333,-3.333l3.332,-3.333l-1.904,-1.906zm7.665,0l-1.903,1.905l3.332,3.333l-3.332,3.332l1.903,1.905l5.238,-5.238l-5.238,-5.237z" stroke-width="1.3" />'],
			fullScreen:[30,30,'<rect stroke-linejoin="round" height="11.169" width="17.655" y="9.415" x="6.172" stroke-width="1.5"/>'
							  +'<path stroke-linejoin="round" d="m12.361,11.394l-3.604,3.605l3.605,3.605l1.311,-1.311l-2.294,-2.294l2.293,-2.294l-1.311,-1.311zm5.275,0l-1.310,1.311l2.293,2.294l-2.293,2.293l1.310,1.311l3.605,-3.605l-3.605,-3.605z"/>'],
			loop:[30,30,'<path stroke-linejoin="round" stroke-width="1" d="m14.632,10.097h5.524c2.373,0 4.297,2.147 4.297,4.796c0,1.272 -0.452,2.491 -1.258,3.391c-0.805,0.899 -1.898,1.404 -3.038,1.404h-0.613v1.370l-2.455,-2.740l2.455,-2.740v1.370h0.613c1.017,0 1.841,-0.920 1.841,-2.055c0,-1.135 -0.824,-2.055 -1.841,-2.055h-5.524v-2.740z"/>'
					   +'<path stroke-linejoin="round" stroke-width="1" d="m15.367,19.902h-5.524c-2.373,0 -4.297,-2.147 -4.297,-4.796c0,-1.272 0.452,-2.491 1.258,-3.391c0.805,-0.899 1.898,-1.404 3.038,-1.404h0.613v-1.370l2.455,2.740l-2.455,2.740v-1.370h-0.613c-1.017,0 -1.841,0.920 -1.841,2.055c0,1.135 0.824,2.055 1.841,2.055h5.524v2.740z"/>'],
			volume:[30,30,'<ellipse id="volume_circle" style="fill-opacity:.6!important" ry="5" rx="5" cy="15" cx="15" stroke-dasharray="32 90" stroke-width="1.8"/>'],
			danmakuMode0:[30,30,'<path style="fill-opacity:1!important" stroke-width="0" d="m14.981,17.821l-7.937,-2.821l7.937,-2.821l0,1.409l7.975,0l0,2.821l-7.975,0l0,1.409l0,0.002z"/>'],
			danmakuMode1:[30,30,'<path style="fill-opacity:1!important" stroke-width="0" d="m15.019,12.178l7.937,2.821l-7.937,2.821l0,-1.409l-7.975,0l0,-2.821l7.975,0l0,-1.409l0,-0.002z"/>'],
			danmakuMode3:[30,30,'<path stroke-width="3" d="m7.972,7.486l14.054,0"/>'],
			danmakuMode2:[30,30,'<path stroke-width="3" d="m7.972,22.513l14.054,0"/>'],
		}
		function icon(name,event,attr={}){
			const ico=icons[name];
			return Object2HTML({_:'span',event,attr,prop:{id:`icon_span_${name}`,
				innerHTML:`<svg height=${ico[1]} width=${ico[0]} id="icon_${name}"">${ico[2]}</svg>`}});
		}

		this._.player=Object2HTML({
			_:'div',attr:{'class':'NyaP'},child:[
				{_:'div',attr:{id:'video_frame'},child:[
					video,
					this.danmakuFrame.container
				]},
				{_:'div',attr:{id:'control'},child:[
					{_:'span',attr:{id:'control_left'},child:[
						icon('play',{click:e=>this.playToggle()},{title:_('play')}),
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
									{_:'input',attr:{id:'danmaku_color',placeholder:_('hex color'),maxlength:"6"}},
									{_:'span',attr:{id:'danmaku_mode_box'},child:[
										icon('danmakuMode0'),icon('danmakuMode2'),icon('danmakuMode3'),icon('danmakuMode1'),
									]},
									{_:'span',attr:{id:'danmaku_size_box'}},
								]},
								icon('danmakuStyle'),
							]},
							{_:'input',attr:{id:'danmaku_input',placeholder:_('Input danmaku here')}},
							{_:'span',prop:{id:'danmaku_submit',innerHTML:_('Send')}},
						]}
					]},
					{_:'span',attr:{id:'control_right'},child:[
						icon('addDanmaku',{click:e=>this.danmakuInput()},{title:_('danmaku input')}),
						icon('volume',{},{title:_('volume($0)','100%')}),
						icon('loop',{click:e=>this.loop()},{title:_('loop')}),
						{_:'span',prop:{id:'player_mode'},child:[
							icon('fullPage',{click:e=>this.playerMode('fullPage')},{title:_('full page')}),
							icon('fullScreen',{click:e=>this.playerMode('fullScreen')},{title:_('full screen')})
						]}
					]},
				]}
			]
		});

		//add elements with id to eles prop
		[].slice.call(this._.player.querySelectorAll('*')).forEach(e=>{
			if(e.id&&!$[e.id])$[e.id]=e;
		});

		//danmaku sizes
		opt.danmakuSizes.forEach((s,ind)=>{
			let e=Object2HTML({_:'span',attr:{style:`font-size:${12+ind*3}px;`,title:s},prop:{size:s},child:['A']});
			$.danmaku_size_box.appendChild(e);
		});

		//danmaku colors
		opt.danmakuColors.forEach(c=>{
			let e=Object2HTML({_:'span',attr:{style:`background-color:#${c};`,title:c},prop:{color:c}});
			$.danmaku_color_box.appendChild(e);
		});

		//progress
		setTimeout(()=>{
			$.control.ResizeSensor=new ResizeSensor($.control,()=>this.refreshProgress());
			this.refreshProgress();
		},0);
		this._.progressContext=$.progress.getContext('2d');

		//events
		addEvents(window,{
			keydown:e=>{
				switch(e.code){
					case 'Escape':{//exit full page mode
						if(this._.playerMode==='fullPage'){
							this.playerMode('normal');
						}
						break;
					}
				}
			}
		});
		const events={
			main_video:{
				playing:e=>{
					$.icon_span_play.classList.add('active_icon');
				},
				pause:e=>{
					$.icon_span_play.classList.remove('active_icon');
				},
				stalled:e=>{
					$.icon_span_play.classList.remove('active_icon');
				},
				timeupdate:(e,notevent)=>{
					if(Date.now()-this._.lastTimeUpdate <30)return;
					$.current_time.innerHTML=formatTime(video.currentTime,video.duration);
					this.drawProgress();
					this._.lastTimeUpdate=Date.now();
					notevent||setTimeout(events.main_video.timeupdate,250,null,true);//for smooth progress bar
				},
				loadedmetadata:e=>{
					$.total_time.innerHTML=formatTime(video.duration,video.duration);
				},
				volumechange:e=>{
					setAttrs($.volume_circle,{'stroke-dasharray':`${video.volume*10*Math.PI} 90`,style:`fill-opacity:${video.muted?.2:.6}!important`});
					$.icon_span_volume.setAttribute('title',_('volume($0)',video.muted?_('muted'):`${video.volume*100|0}%`));
				},
				progress:e=>{this.drawProgress();},
				_loopChange:e=>{
					this.eles.icon_span_loop.classList[e.value?'add':'remove']('active_icon');
				}
			},
			progress:{
				mousemove:e=>{
					this._.progressX=e.layerX;this.drawProgress();
					let t=e.target,
						pre=(e.layerX-t.pad)/(t.offsetWidth-2*t.pad);
					pre=limitIn(pre,0,1);
					$.total_time.innerHTML=formatTime(pre*video.duration,video.duration);
				},
				mouseout:e=>{
					this._.progressX=undefined;this.drawProgress();
					$.total_time.innerHTML=formatTime(video.duration,video.duration);
				},
				click:e=>{
					let t=e.target,
						pre=(e.layerX-t.pad)/(t.offsetWidth-2*t.pad);
					pre=limitIn(pre,0,1);
					video.currentTime=pre*video.duration;
				}
			},
			danmaku_container:{
				click:e=>this.playToggle(),
			},
			danmaku_color:{
				'input,change':e=>{
					let i=e.target,c;
					if(c=i.value.match(/^([\da-f]{3}){1,2}$/i)){//match valid hex color code
						c=c[0];
						i.style.backgroundColor=`#${c}`;
						this._.danmakuColor=c;
					}else{
						this._.danmakuColor=undefined;
						i.style.backgroundColor='';
					}
				},
			},
			icon_span_volume:{
				click:e=>{
					video.muted=!video.muted;
				},
				wheel:e=>{
					e.preventDefault();
					let v=video.volume+(e.deltaY/100);
					if(v<0)v=0;else if(v>1)v=1;
					video.volume=v;
				}
			},
			danmakuModeSwitch:{
				click:function(){
					let m=1*this.id.match(/\d$/)[0];
					if(NP._.danmakuMode!==undefined)
						$[`icon_span_danmakuMode${NP._.danmakuMode}`].classList.remove('active');
					$[`icon_span_danmakuMode${m}`].classList.add('active');
					NP._.danmakuMode=m;
				}
			},
			danmaku_input:{
				keydown:e=>{if(e.code==='Enter')this.send();}
			},
			danmaku_submit:{
				click:e=>{this.send();}
			},
			danmaku_size_box:{
				click:e=>{
					let t=e.target;
					if(!t.size)return;
					[...$.danmaku_size_box.childNodes].forEach(sp=>{
						if(this._.danmakuSize===sp.size)sp.classList.remove('active');
					});
					t.classList.add('active');
					this._.danmakuSize=t.size;
				}
			},
			danmaku_color_box:{
				click:e=>{
					if(e.target.color){
						$.danmaku_color.value=e.target.color;
						$.danmaku_color.dispatchEvent(new Event('change'));
					}
				}
			},
		}
		for(let eleid in $){//add events to elements
			let eves=events[eleid];
			if(eleid.startsWith('icon_span_danmakuMode')){
				eves=events.danmakuModeSwitch;
			}
			eves&&addEvents($[eleid],eves);
		}

		$['icon_span_danmakuMode'+opt.defaultDanmakuMode].click();//init to default danmaku mode
		[...$.danmaku_size_box.childNodes].forEach(sp=>{if(sp.size===opt.defaultDanmakuSize)sp.click()});

		console.debug(this.eles)
	}
	danmakuInput(bool=!this.eles.danmaku_input_frame.offsetHeight){
		let $=this.eles;
		$.danmaku_input_frame.style.display=bool?'flex':'';
		$.icon_span_addDanmaku.classList[bool?'add':'remove']('active_icon');
		bool&&$.danmaku_input.focus();
	}
	playerMode(mode='normal'){
		if(mode==='normal' && this._.playerMode===mode)return;
		let $=this.eles;
		if(this._.playerMode==='fullPage'){
			this.player.style.position='';
			$.icon_span_fullPage.classList.remove('active_icon');
		}else if(this._.playerMode==='fullScreen'){
			$.icon_span_fullScreen.classList.remove('active_icon');
			exitFullscreen();
		}
		if(mode!=='normal' && this._.playerMode===mode)mode='normal';//back to normal mode
		switch(mode){
			case 'fullPage':{
				this.player.style.position='fixed';
				$.icon_span_fullPage.classList.add('active_icon');
				break;
			}
			case 'fullScreen':{
				$.icon_span_fullScreen.classList.add('active_icon');
				requestFullscreen(this.player);
				break;
			}
		}
		this._.playerMode=mode;
		this.emit('playerModeChange',mode);
	}
	loop(bool){
		if(bool===undefined)bool=!this.video.loop;
		this.video.loop=bool;
	}
	refreshProgress(){
		const c=this.eles.progress;
		c.width=c.offsetWidth;
		c.height=c.offsetHeight;
		this.drawProgress();
		this.emit('progressRefresh');
	}
	send(){
		let color=this._.danmakuColor||this.opt.defaultDanmakuColor,
			content=this.eles.danmaku_input.value,
			mode=this._.danmakuMode

	}
	drawProgress(){
		const ctx=this._.progressContext,
				c=this.eles.progress,
				w=c.width,
				h=c.height,
				v=this.video,
				d=v.duration,
				cT=v.currentTime,
				pad=c.pad,
				len=w-2*pad;
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
		tr = v.buffered;
		for (var i = tr.length;i--;) {
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
		let tr = v.played;
		for (var i = tr.length;i--;) {
			ctx.moveTo(pad+tr.start(i) / d * len, 15);
			ctx.lineTo(pad+tr.end(i) / d * len, 15);
		}
		ctx.stroke();
		//mouse
		if(this._.progressX){
			ctx.beginPath();
			ctx.strokeStyle='rgba(0,0,0,.05)';
			ctx.moveTo(pad+len*cT/d,15);
			ctx.lineTo(limitIn(this._.progressX,pad,pad+len),15);
			ctx.stroke();
		}
	}
}

window.NyaP=NyaP;
