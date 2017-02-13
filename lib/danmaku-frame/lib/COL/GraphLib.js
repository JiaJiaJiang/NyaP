(function(){

class GraphLib{
	constructor(COL){
		if(COL instanceof CanvasObjLibrary === false)
			throw(new TypeError('CanvasObjectLibrary instance required'));
		this.COL=COL;
		for(let c in graphs)this[c]=graphs[c](this);

	}
}

const graphs={
	arc:lib=>{
		return class pie extends lib.COL.class.FunctionGraph{
			constructor(){
				super();
				this.setRadius(5);
				this.color='#000';
				this.startAngle=0;
				this.endAngle=Math.PI*2;
				this.anticlockwise=false;
				this.borderColor='#000';
				this.borderWidth=0;
				this.onoverCheck=false;
			}
			setRadius(r){
				this.r=r;
				this.style.height=this.style.width=2*r;
			}
			drawer(ct){
				this.hitRange(ct);
				if(this.color){
					ct.fillStyle=this.color;
					ct.fill();
				}
				if(this.borderWidth>0){
					ct.strokeStyle=this.borderColor;
					ct.lineWidth=this.borderWidth;
					ct.stroke();
				}
				this.checkIfOnOver(false);
			}
			hitRange(ct){
				ct.beginPath();
				ct.arc(this.r, this.r, this.r, this.startAngle, this.endAngle, this.anticlockwise);
				ct.closePath();
			}
		}
	},
	pie:lib=>{
		return class pie extends lib.arc{
			constructor(){
				super();
			}
		}
	},
	ring:lib=>{
		return class ring extends lib.pie{
			constructor(){
				super();
				this.color=null;
				this.borderWidth=1;
			}
		}
	},
	star:lib=>{
		return class star extends lib.ring{
			constructor(){
				super();
			}
			drawer(ct){
				this.hitRange(ct);
				if(this.color){
					ct.fillStyle=this.color;
					ct.fill();
				}
				if(this.borderWidth>0){
					ct.strokeStyle=this.borderColor;
					ct.stroke();
				}
				this.checkIfOnOver(false);
			}
			hitRange(ct){
				ct.translate(this.r,this.r);
				ct.beginPath();
				ct.moveTo(0,-this.r);
				ct.lineTo(0.2245139883*this.r,-0.3090169944*this.r);
				ct.lineTo(0.9510565163*this.r,-0.3090169944*this.r);
				ct.lineTo(0.36327126*this.r,0.1180339887*this.r);//
				ct.lineTo(0.5877852523*this.r,0.8090169944*this.r);
				ct.lineTo(0,0.3819660113*this.r);
				ct.lineTo(-0.5877852523*this.r,0.8090169944*this.r);
				ct.lineTo(-0.36327126*this.r,0.1180339887*this.r);
				ct.lineTo(-0.9510565163*this.r,-0.3090169944*this.r);
				ct.lineTo(-0.2245139883*this.r,-0.3090169944*this.r);
				ct.closePath();
			}
		}
	},
	rect:lib=>{
		return class rect extends lib.COL.class.FunctionGraph{
			constructor(){
				super();
			}
			drawer(ct){
				this.hitRange(ct);
				if(this.color){
					ct.fillStyle=this.color;
					ct.fill();
				}
				if(this.borderWidth>0){
					ct.strokeStyle=this.borderColor;
					ct.stroke();
				}
				this.checkIfOnOver(false);
			}
			hitRange(ct){
				ct.beginPath();
				ct.rect(0, 0, this.style.width, this.style.height);
				ct.closePath();
			}
		}
	},
}

window.GraphLib=GraphLib;
})();

