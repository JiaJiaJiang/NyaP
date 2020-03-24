/*
Copyright luojia@luojia.me
LGPL license
*/
import Template from './textModuleTemplate.js';

class TextCss extends Template{
	constructor(dText){
		super(dText);
		this.supported=dText.text2d.supported;
		if(!this.supported)return;
		dText.frame.addStyle([`#${dText.randomText}_textCanvasContainer canvas{will-change:transform;top:0;left:0;position:absolute;}`,
								`#${dText.randomText}_textCanvasContainer.moving canvas{transition:transform 500s linear;}`,
								`#${dText.randomText}_textCanvasContainer{will-change:transform;pointer-events:none;overflow:hidden;}`]);

		this.container=document.createElement('div');//for text canvas
		this.container.classList.add(`${dText.randomText}_fullfill`);
		this.container.id=`${dText.randomText}_textCanvasContainer`;
		// dText.container.appendChild(this.container);
	}
	_toggle(s){
		let D=this.dText,T=D.frame.time;
		this.container.classList[s?'add':'remove']('moving');
		for(let i=D.DanmakuText.length,t;i--;){
			if((t=D.DanmakuText[i]).danmaku.mode>=2)continue;
			if(s){requestAnimationFrame(()=>this._move(t));}
			else{this._move(t,T);}
		}
	}
	pause(){
		this._toggle(false);
	}
	play(){
		this._toggle(true);
	}
	rate(){
		this.resetPos();
	}
	_move(t,T){
		if(!t.danmaku)return;
		if(T===undefined)T=this.dText.frame.time+500000;
		t._cache.style.transform=`translate3d(${(((this.dText._calcSideDanmakuPosition(t,T)-t.estimatePadding)*10)|0)/10}px,${t.style.y-t.estimatePadding}px,0)`;
	}
	resetPos(){
		this.pause();
		this.dText.paused||requestAnimationFrame(()=>this.play());
	}
	resize(){
		this.resetPos();
	}
	remove(t){
		t._cache.parentNode&&this.container.removeChild(t._cache);
	}
	enable(){
		requestAnimationFrame(()=>{
			this.dText.DanmakuText.forEach(t=>this.newDanmaku(t));
		});
	}
	disable(){
		this.container.innerHTML='';
	}
	newDanmaku(t){
		t._cache.style.transform=`translate3d(${t.style.x-t.estimatePadding}px,${t.style.y-t.estimatePadding}px,0)`;
		this.container.appendChild(t._cache);
		t.danmaku.mode<2&&!this.dText.paused&&requestAnimationFrame(()=>this._move(t));
	}
}


export default TextCss;
