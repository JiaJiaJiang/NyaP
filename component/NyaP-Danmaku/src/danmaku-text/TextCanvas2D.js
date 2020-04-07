/*
Copyright luojia@luojia.me
LGPL license
*/
import Template from './textModuleTemplate.js';

class TextCanvas2D extends Template{
	canvas;
	context2d;
	get container(){return this.canvas;}
	constructor(dText){
		super(dText);
		this.canvas=document.createElement('canvas');//the canvas
		this.context2d=this.canvas.getContext('2d');//the canvas contex
		if(!this.context2d){
			console.warn('text 2d not supported');
			return;
		}
		this.canvas.classList.add(`${dText.randomText}_fullfill`);
		this.canvas.id=`${dText.randomText}_text2d`;
		this.supported=true;
	}
	draw(force){
		let ctx=this.context2d,
			cW=ctx.canvas.width,
			dT=this.dText.DanmakuText,
			i=dT.length,
			t,
			left,
			right,
			vW;
		let debug=false;
		ctx.globalCompositeOperation='destination-over';
		this.clear(force);
		for(;i--;){
			if(!(t=dT[i]).drawn)(t.drawn=true);
			left=t.style.x-t.estimatePadding;
			right=left+t._cache.width;
			if(left>cW || right<0){continue;}//ignore danmakus out of the screen
			if(debug){
				ctx.save();
				ctx.fillStyle='rgba(255,255,255,0.3)';
				ctx.fillRect(left,t.style.y-t.estimatePadding,t._cache.width,t._cache.height);
				ctx.restore();
			}
			if(cW>=t._cache.width){//danmaku which is smaller than canvas width
				ctx.drawImage(t._bitmap||t._cache, left, t.style.y-t.estimatePadding);
			}else{//only draw the part on screen if the danmau overflow
				vW=t._cache.width+(left<0?left:0)-(right>cW?right-cW:0)
				ctx.drawImage(t._bitmap||t._cache,
					(left<0)?-left:0,0,
							vW,t._cache.height,
					(left<0)?0:left,t.style.y-t.estimatePadding,
							vW,t._cache.height);
			}
		}
	}
	clear(force){
		const D=this.dText;
		if(force||this._evaluateIfFullClearMode()){
			this.context2d.clearRect(0,0,this.canvas.width,this.canvas.height);
			return;
		}
		for(let i=D.DanmakuText.length,t;i--;){
			t=D.DanmakuText[i];
			if(t.drawn)
				this.context2d.clearRect(t.style.x-t.estimatePadding,t.style.y-t.estimatePadding,t._cache.width,t._cache.height);
		}
	}
	_evaluateIfFullClearMode(){
		if(this.dText.DanmakuText.length>3)return true;
		return false;
	}
	deleteRelatedTextObject(t){
		if(t._bitmap){
			t._bitmap.close();
			t._bitmap=null;
		}
	}
	resize(){
		let D=this.dText,C=this.canvas;
		C.width=D.width;
		C.height=D.height;
	}
	enable(){
		this.draw();
		this.dText.useImageBitmap=true;
	}
	disable(){
		for(let tobj of this.dText.DanmakuText){
			this.deleteRelatedTextObject(tobj);
		}
		this.clear(true);
	}
}

export default TextCanvas2D;