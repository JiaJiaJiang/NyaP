/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

(function(f){
	if (typeof define === "function" && define.amd) {
	    define(f);
	}else if (typeof exports === "object") {
	    module.exports = f();
	}else {
	    (0,eval)('this').Mat = f();
	}
})(function(){
const global= (0,eval)('this');
const TypedArray=global.Float32Array&&global.Float32Array.prototype;

function createClass(Constructor){
	class Matrix{
		constructor(l,c,fill=0){
			this.array=new Constructor(l*c);
			Object.defineProperty(this.array,'row',{value:l});
			Object.defineProperty(this.array,'column',{value:c});
			if(arguments.length==3){
				if(Matrix._instanceofTypedArray&&(fill===0)){}
				else if(typeof fill === 'number'){
					this.fill(fill);
				}else if(fill.length){
					this.set(fill);
				}
			}
		}
		get length(){return this.array.length;}
		get row(){return this.array.row;}
		get column(){return this.array.column;}
		leftMultiply(m){
			return this.set(Matrix.multiply(m,this,new Matrix(m.row,this.column)));
		}
		rightMultiply(m){
			return this.set(Matrix.multiply(this,m,new Matrix(this.row,m,column)));
		}
		fill(n){
			arguments.length||(n=0);
			for(let i=this.length;i--;)this.array[i]=n;
			return this;
		}
		set(arr,offset){
			offset||(offset=0);
			(arr instanceof Matrix)&&(arr=arr.array);
			for(let i=(arr.length+offset)<=this.length?arr.length:(this.length-offset);i--;)
				this.array[offset+i]=arr[i];
			return this;
		}
		put(m,row,column){
			Matrix.put(this,m,row||0,column||0);
			return this;
		}
		rotate2d(t){
			return this.set(Matrix.rotate2d(this,t,Matrix.Matrixes.T3));
		}
		translate2d(x,y){
			return this.set(Matrix.translate2d(this,x,y,Matrix.Matrixes.T3));
		}
		scale2d(x,y){
			return this.set(Matrix.scale2d(this,x,y,Matrix.Matrixes.T3));
		}
		rotate3d(tx,ty,tz){
			return this.set(Matrix.rotate3d(this,tx,ty,tz,Matrix.Matrixes.T4));
		}
		scale3d(x,y,z){
			return this.set(Matrix.scale3d(this,x,y,z,Matrix.Matrixes.T4));
		}
		translate3d(x,y,z){
			return this.set(Matrix.translate3d(this,x,y,z,Matrix.Matrixes.T4));
		}
		rotateX(t){
			return this.set(Matrix.rotateX(this,t,Matrix.Matrixes.T4));
		}
		rotateY(t){
			return this.set(Matrix.rotateY(this,t,Matrix.Matrixes.T4));
		}
		rotateZ(t){
			return this.set(Matrix.rotateZ(this,t,Matrix.Matrixes.T4));
		}
		clone(){
			return new Matrix(this.row,this.column,this);
		}
		toString(){
			if(this.length === 0)return '';
			for(var i=0,lines=[],tmp=[];i<this.length;i++){
				if(i && (i%this.column === 0)){
					lines.push(tmp.join('\t'));
					tmp.length=0;
				}
				tmp.push(this.array[i]||0);
			}
			lines.push(tmp.join('	'));
			return lines.join('\n');
		}

		//static methods
		static Identity(n){//return a new Identity Matrix
			let m=new Matrix(n,n,0);
			for(let i=n;i--;)m.array[i*n+i]=1;
			return m;
		}
		static Perspective(fovy,aspect,znear,zfar,result){
			var y1=znear*Math.tan(fovy*Math.PI/360.0),
				x1=y1*aspect,
				m=result||new Matrix(4,4,0),
				arr=m.array;

			arr[0]=2*znear/(x1+x1);
			arr[5]=2*znear/(y1+y1);
			arr[10]=-(zfar+znear)/(zfar-znear);
			arr[14]=-2*zfar*znear/(zfar-znear);
			arr[11]=-1;
		    if(result)arr[1]=arr[2]=arr[3]=arr[4]=arr[6]=arr[7]=arr[8]=arr[9]=arr[12]=arr[13]=arr[15]=0;
		    return m;
		}
		static multiply(a,b,result){
			if(a.column!==b.row)throw('wrong matrix');
			let row=a.row,column=Math.min(a.column,b.column),r=result||new Matrix(row,column),c,i,ind;
			for(let l=row;l--;){
				for(c=column;c--;){
					r.array[ind=(l*r.column+c)]=0;
					for(i=a.column;i--;){
						r.array[ind]+=(a.array[l*a.column+i]*b.array[c+i*b.column]);
					}
				}
			}
			return r;
		}
		static multiplyString(a,b,array,ignoreZero=true){//work out the equation for every elements,only for debug and only works with Array matrixes
			if(a.column!==b.row)throw('wrong matrix');
			var r=array||new Matrix(a.row,b.column),l,c,i,ind;
			for(l=a.row;l--;){
				for(c=b.column;c--;){
					r.array[ind=(l*b.column+c)]='';
					for(i=0;i<a.column;i++){
						if(ignoreZero && (a.array[l*a.column+i]==0 ||b.array[c+i*b.column]==0))continue;
						r.array[ind]+=(((i&&r.array[ind])?'+':'')+'('+a.array[l*a.column+i]+')*('+b.array[c+i*b.column])+')';
					}
				}
			}
			return r;
		}
		static add(a,b,result){
			if(a.column!==b.column || a.row!==b.row)throw('wrong matrix');
			let r=result||new Matrix(a.row,b.column);
			for(let i=a.length;i--;)r.array[i]=a.array[i]+b.array[i];
			return r;
		}
		static minus(a,b,result){
			if(a.column!==b.column || a.row!==b.row)throw('wrong matrix');
			let r=result||new Matrix(a.row,b.column);
			for(let i=a.length;i--;)r.array[i]=a.array[i]-b.array[i];
			return r;
		}
		static rotate2d(m,t,result){
			const Mr=Matrix.Matrixes.rotate2d;
			Mr.array[0]=Mr.array[4]=Math.cos(t);
			Mr.array[1]=-(Mr.array[3]=Math.sin(t));
			return Matrix.multiply(Mr,m,result||new Matrix(3,3));
		}
		static scale2d(m,x,y,result){
			const Mr=Matrix.Matrixes.scale2d;
			Mr.array[0]=x;
			Mr.array[4]=y;
			return Matrix.multiply(Mr,m,result||new Matrix(3,3));
		}
		static translate2d(m,x,y,result){
			const Mr=Matrix.Matrixes.translate2d;
			Mr.array[2]=x;
			Mr.array[5]=y;
			return Matrix.multiply(Mr,m,result||new Matrix(3,3));
		}
		static rotate3d(m,tx,ty,tz,result){
			const Xc=Math.cos(tx),Xs=Math.sin(tx),
				Yc=Math.cos(ty),Ys=Math.sin(ty),
				Zc=Math.cos(tz),Zs=Math.sin(tz),
				Mr=Matrix.Matrixes.rotate3d;
			Mr.array[0]=Zc*Yc;
			Mr.array[1]=Zc*Ys*Xs-Zs*Xc;
			Mr.array[2]=Zc*Ys*Xc+Zs*Xs;
			Mr.array[4]=Zs*Yc;
			Mr.array[5]=Zs*Ys*Xs+Zc*Xc;
			Mr.array[6]=Zs*Ys*Xc-Zc*Xs;
			Mr.array[8]=-Ys;
			Mr.array[9]=Yc*Xs;
			Mr.array[10]=Yc*Xc;
			return Matrix.multiply(Mr,m,result||new Matrix(4,4));
		}
		static rotateX(m,t,result){
			const Mr=Matrix.Matrixes.rotateX;
			Mr.array[10]=Mr.array[5]=Math.cos(t);
			Mr.array[6]=-(Mr.array[9]=Math.sin(t));
			return Matrix.multiply(Mr,m,result||new Matrix(4,4));
		}
		static rotateY(m,t,result){
			const Mr=Matrix.Matrixes.rotateY;
			Mr.array[10]=Mr.array[0]=Math.cos(t);
			Mr.array[8]=-(Mr.array[2]=Math.sin(t));
			return Matrix.multiply(Mr,m,result||new Matrix(4,4));
		}
		static rotateZ(m,t,result){
			const Mr=Matrix.Matrixes.rotateZ;
			Mr.array[5]=Mr.array[0]=Math.cos(t);
			Mr.array[1]=-(Mr.array[4]=Math.sin(t));
			return Matrix.multiply(Mr,m,result||new Matrix(4,4));
		}
		static scale3d(m,x,y,z,result){
			const Mr=Matrix.Matrixes.scale3d;
			Mr.array[0]=x;
			Mr.array[5]=y;
			Mr.array[10]=z;
			return Matrix.multiply(Mr,m,result||new Matrix(4,4));
		}
		static translate3d(m,x,y,z,result){
			const Mr=Matrix.Matrixes.translate3d;
			Mr.array[12]=x;
			Mr.array[13]=y;
			Mr.array[14]=z;
			return Matrix.multiply(Mr,m,result||new Matrix(4,4));
		}
		static put(m,sub,row,column){
			let c,ind,i;
			row||(row=0);
			column||(column=0);
			for(let l=sub.row;l--;){
				if(l+row>=m.row)continue;
				for(c=sub.column;c--;){
					if(c+column>=m.column)continue;
					m.array[(l+row)*m.column+c+column]=sub.array[l*sub.column+c];
				}
			}
		}
		static createClass(Constructor){
			return createClass(Constructor);
		}
	}

	var testArray=new Constructor(1);
	Object.defineProperty(Matrix,'_instanceofTypedArray',{value:!!(TypedArray&&TypedArray.isPrototypeOf(testArray))});
	testArray=null;

	Matrix.Matrixes={//do not modify these matrixes manually and dont use them
		I2:Matrix.Identity(2),
		I3:Matrix.Identity(3),
		I4:Matrix.Identity(4),
		T3:new Matrix(3,3,0),
		T4:new Matrix(4,4,0),
		rotate2d:Matrix.Identity(3),
		translate2d:Matrix.Identity(3),
		scale2d:Matrix.Identity(3),
		translate3d:Matrix.Identity(4),
		rotate3d:Matrix.Identity(4),
		rotateX:Matrix.Identity(4),
		rotateY:Matrix.Identity(4),
		rotateZ:Matrix.Identity(4),
		scale3d:Matrix.Identity(4),
	}
	return Matrix;
}
return createClass(global.Float32Array?Float32Array:Array);
});
