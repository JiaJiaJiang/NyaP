/*
Copyright luojia@luojia.me
LGPL license

danmaku-frame text2d mod
*/
'use strict';
/*
danmaku position is based on time
*/

function init(DanmakuFrame,DanmakuFrameModule){
	class Text2D extends DanmakuFrameModule{
		constructor(frame){
			super(frame);
			this.list=[];//danmaku object array
			this.indexMark=0;//to record the index of last danmaku in the list
			this.resetTunnel();
			this.paused=true;
			this.defaultStyle={//these styles can be overwrote by the 'font' property of danmaku object
				fontStyle: null,
				fontWeight: 600,
				fontVariant: null,
				color: "#fbfbfb",
				lineHeight: null,//when this style is was not a number,the number will be the same as fontSize
				fontSize: 30,
				fontFamily: "Arial",
				strokeWidth: 1,//outline width
				strokeColor: "#000",
				shadowBlur: 10,
				shadowColor: "#000",
				shadowOffsetX:0,
				shadowOffsetY:0,
				fill:true,//if the text should be filled
				reverse:false,
				speed:5,
				opacity:1,
			};
			this.COL_GraphCache=[];//COL text graph cache
			this.layer=new this.frame.COL.class.FunctionGraph();//text layer
			this.frame.COL.root.appendChild(this.layer);
			this.cacheCleanTime=0;
			this.danmakuMoveTime=0;
			this.options={
				allowLines:false,//allow multi-line danmaku
				screenLimit:0,//the most number of danmaku on the screen
				clearWhenTimeReset:true,//clear danmaku on screen when the time is reset
			}
		}
		start(){
			this.paused=false;
			this.resetTimeOfDanmakuOnScreen();
		}
		pause(){
			this.paused=true;
		}
		load(d){
			if(!d || d._!=='text'){return false;}
			const ind=dichotomy(this.list,d.time,0,this.list.length-1,false);
			this.list.splice(ind,0,d);
			if(ind<=this.indexMark)this.indexMark++;
			return true;
		}
		loadList(danmakuArray){
			for(let d of danmakuArray){
				this.load(d);
			}
		}
		unload(d){
			if(!d || d._!=='text')return false;
			const i=this.list.indexOf(d);
			if(i<0)return false;
			this.list.splice(i,1);
			if(i<this.indexMark)this.indexMark--;
			return true;
		}
		resetTunnel(){
			this.tunnels={
				right:[],
				left:[],
				bottom:[],
				top:[],
			};
		}
		draw(){
			if(!this.enabled || this.paused)return;
			//find danmaku from indexMark to current time
			const cTime=this.frame.time,
					cHeight=this.frame.COL.canvas.height,
					cWidth=this.frame.COL.canvas.width;
			let t,d;
			for(;this.list[this.indexMark].time<=cTime;this.indexMark++){//add new danmaku
				if(this.layer.childNodes.length>=this.options.screenLimit)break;//break if the number of danmaku on screen has up to limit
				d=this.list[this.indexMark];
				t=this.COL_GraphCache.length?
					this.COL_GraphCache.shift():
					new this.frame.COL.class.TextGraph();
				t.onoverCheck=false;
				t.danmaku=d;
				t.text=this.allowLines?d.text:d.text.replace(/\n/g,' ');
				t.time=cTime;
				t.font=Object.create(this.defaultStyle);
				Object.assign(t.font,d.style);
				t.style.opacity=t.font.opacity;

				t.prepare();
				//find tunnel number
				const size=t.style.height,tnum=this.getTunnel(d.tunnel,size);
				t.tunnelNumber=tnum;
				//calc margin
				let margin=(tnum<0?0:tnum)%cHeight;
				t.style.setPositionPoint(t.style.width/2,0);
				switch(d.tunnel){
					case 0:case 1:case 3:{
						t.style.top=margin;break;
					}
					case 2:{
						t.style.top=cHeight-margin;
					}
				}
				
				tunnel[tnum]=((t.style.top+size)>cHeight)?
								cHeight-t.style.top-1:
								size;
				this.layer.appendChild(t);
			}
			//calc all danmaku's position
			for(t of this.layer.childNodes){
				this.danmakuMoveTime=cTime;
				switch(t.danmaku.tunnel){
					case 0:case 1:{
						const direc=t.danmaku.tunnel;
						t.style.x=(direc?(cWidth+t.style.width/2):(-t.style.width/2))
									+(direc?-1:1)*this.frame.rate*520*(cTime-t.time)/t.font.speed/1000;
						if((direc||t.style.x<-t.style.width) || (direc&&t.style.x>cWidth+t.style.width)){//go out the canvas
							this.removeText(t);
						}else if(t.tunnelNumber>=0 && ((direc||(t.style.x+t.style.width/2)+30<cWidth) || (direc&&(t.style.x-t.style.width/2)>30))){
							delete this.tunnels[tunnels[t.danmaku.tunnel]][t.tunnelNumber];
							t.tunnelNumber=-1;
						}
						break;
					}
					case 2:case 3:{
						t.style.x=cWidth/2;
						if((cTime-t.time)>t.font.speed*1000/this.frame.rate){
							this.removeText(t);
						}
					}
				}
			}
			//clean cache
			if((Date.now()-this.cacheCleanTime)>5000){
				this.cacheCleanTime=Date.now();
				if(this.COL_GraphCache.length>20){//save 20 cached danmaku
					for(let ti = 0;ti<this.COL_GraphCache.length;ti++){
						if((Date.now()-this.COL_GraphCache[ti].removeTime) > 10000){//delete cache which has live over 10s
							this.COL_GraphCache.splice(ti,1);
						}else{break;}
					}
				}
			}
		}
		getTunnel(tid,size){//get the tunnel index that can contain the danmaku of the sizes
			let tunnel=this.tunnels[tunnels[tid]],tnum=-1,ti=0,
				cHeight=this.frame.COL.canvas.height;
			if(size>cHeight)return -1;

			while(tnum<0){
				for(let i2=0;i2<size;i2++){
					if(tunnel[ti+i2]!==undefined){//used
						ti+=i2+tunnel[ti+i2];
						break;
					}else if(((ti+i2)%cHeight)===0){//new page
						ti+=i2;
						break;
					}else if(i2===size-1){//get
						tnum=ti;
						break;
					}
				}

			}
			return tnum;
		}
		removeText(t){//remove the danmaku from screen
			this.layer.removeChild(t);
			t.danmaku=null;
			(t.tunnelNumber>=0)&&(delete this.tunnels[tunnels[t.danmaku.tunnel]][t.tunnelNumber]);
			t.removeTime=Date.now();
			this.COL_GraphCache.push(t);
		}
		clear(){//clear danmaku on the screen
			for(t of this.layer.childNodes){
				if(t.danmaku)this.removeText(t);
			}
			this.resetTunnel();
		}
		time(t){//reset time,you should invoke it when the media has seeked to another time
			this.indexMark=dichotomy(this.list,t,0,this.list.length-1,true);
			if(this.options.clearWhenTimeReset){this.clear();}
			else{this.resetTimeOfDanmakuOnScreen();}
		}
		resetTimeOfDanmakuOnScreen(){
			//cause the position of the danmaku is based on time
			//and if you don't want these danmaku on the screen to disappear,their time should be reset
			const cTime=Date.now();
			for(let t of this.layer.childNodes){
				if(!t.danmaku)continue;
				t.time=cTime-(this.danmakuMoveTime-t.time);
			}
		}
		danmakuAt(x,y){//return a list of danmaku which is over this position
			const list=[];
			if(!this.enabled)return list;
			for(let t of this.layer.childNodes){
				if(!t.danmaku)continue;
				if(t.x<=x && t.x+t.style.width>=x && t.y<=y && t.y+t.style.height>=y)
					list.push(t.danmaku);
			}
			return list;
		}
		enable(){//enable the plugin
			this.layer.style.hidden=false;
		}
		disable(){//disable the plugin
			this.layer.style.hidden=true;
			this.clear();
		}
	}

	const tunnels=['right','left','bottom','top'];

	function dichotomy(arr,t,start,end,position){
		if(arr.length===0)return -1;
		let m;
		while(start <= end){
			m=(start+end)>>1;
			if(t<=arr[m].time)start=m;
			else end=m-1;
		}
		if(position===true){//top
			while(arr[start-1] && (arr[start-1].time===arr[start].time))
				start--;
		}else if(position===false){//end
			while(arr[start+1] && (arr[start+1].time===arr[start].time))
				start++;
		}
		
		return start;
	}

	DanmakuFrame.addModule('text2d',Text2D);
};

export {init};