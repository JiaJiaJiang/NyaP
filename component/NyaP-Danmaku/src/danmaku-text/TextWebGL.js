/*
Copyright luojia@luojia.me
LGPL license
*/
import Mat from '../../lib/Mat/Mat.js'
import Template from './textModuleTemplate.js';
import {Utils} from '../danmaku-frame.js';

class TextWebGL extends Template{
	get container(){return this.c3d;}
	constructor(dText){
		super(dText);
		let c3d=this.c3d=document.createElement('canvas');
		c3d.classList.add(`${dText.randomText}_fullfill`);
		c3d.id=`${dText.randomText}_text3d`;
		//init webgl
		const gl=this.gl=c3d.getContext('webgl')||c3d.getContext('experimental-webgl');//the canvas3d context
		if(!gl){
			console.warn('text 3d not supported');
			return;
		}
		//shader
		var shaders={
			danmakuFrag:[gl.FRAGMENT_SHADER,`
				#pragma optimize(on)
				precision lowp float;
				varying lowp vec2 vDanmakuTexCoord;
				uniform sampler2D uSampler;
				void main(void) {
					vec4 co=texture2D(uSampler,vDanmakuTexCoord);
					if(co.a == 0.0)discard;
					gl_FragColor = co;
				}`
			],
			danmakuVert:[gl.VERTEX_SHADER,`
				#pragma optimize(on)
				attribute vec2 aVertexPosition;
				attribute vec2 aDanmakuTexCoord;
				uniform mat4 u2dCoordinate;
				varying lowp vec2 vDanmakuTexCoord;
				void main(void) {
					gl_Position = u2dCoordinate * vec4(aVertexPosition,0,1);
					vDanmakuTexCoord = aDanmakuTexCoord;
				}`
			],
		}
		function shader(name){
			var s=gl.createShader(shaders[name][0]);
			gl.shaderSource(s,shaders[name][1]);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s,gl.COMPILE_STATUS))
				throw("An error occurred compiling the shaders: " + gl.getShaderInfoLog(s));
			return s;
		}
		var fragmentShader = shader("danmakuFrag");
		var vertexShader = shader("danmakuVert");
		var shaderProgram = this.shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram,vertexShader);
		gl.attachShader(shaderProgram,fragmentShader);
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error("Unable to initialize the shader program.");
			return;
		}
		gl.useProgram(shaderProgram);

		//scene
		gl.clearColor(0, 0, 0, 0.0);
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ,gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		this.maxTexSize=gl.getParameter(gl.MAX_TEXTURE_SIZE);

		this.uSampler=gl.getUniformLocation(shaderProgram,"uSampler");
		this.u2dCoord=gl.getUniformLocation(shaderProgram,"u2dCoordinate");
		this.aVertexPosition=gl.getAttribLocation(shaderProgram,"aVertexPosition");
		this.atextureCoord=gl.getAttribLocation(shaderProgram,"aDanmakuTexCoord");

		gl.enableVertexAttribArray(this.aVertexPosition);
		gl.enableVertexAttribArray(this.atextureCoord);

		this.commonTexCoordBuffer=gl.createBuffer();
		this.commonVertCoordBuffer=gl.createBuffer();

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(this.uSampler,0);

		this.supported=true;
	}
	draw(force){
		const gl=this.gl,l=this.dText.DanmakuText.length;
		let cW=this.c3d.width,left,right,vW;
		for(let i=0,t;i<l;i++){
			t=this.dText.DanmakuText[i];
			if(!t || !t.glDanmaku)continue;
			left=t.style.x-t.estimatePadding;
			right=left+t._cache.width,
			vW=t._cache.width+(left<0?left:0)-(right>cW?right-cW:0);
			if(left>cW || right<0)continue;

			//vert
			t.vertCoord[0]=t.vertCoord[4]=(left<0)?0:left;
			t.vertCoord[2]=t.vertCoord[6]=t.vertCoord[0]+vW;
			gl.bindBuffer(gl.ARRAY_BUFFER,this.commonVertCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,t.vertCoord,gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(this.aVertexPosition,2,gl.FLOAT,false,0,0);

			//tex
			commonTextureCoord[0]=commonTextureCoord[4]=(left<0)?-left/t._cache.width:0;
			commonTextureCoord[2]=commonTextureCoord[6]=commonTextureCoord[0]+vW/t._cache.width;
			gl.bindBuffer(gl.ARRAY_BUFFER,this.commonTexCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,commonTextureCoord,gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(this.atextureCoord,2,gl.FLOAT,false,0,0);

			gl.bindTexture(gl.TEXTURE_2D,t.texture);

			gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
		}
		gl.flush();
	}
	clear(){
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}
	deleteTextObject(t){
		const gl=this.gl;
		if(t.texture)gl.deleteTexture(t.texture);
	}
	resize(w,h){
		const gl=this.gl,C=this.c3d;
		C.width=this.dText.width;
		C.height=this.dText.height;
		gl.viewport(0,0,C.width,C.height);
		gl.uniformMatrix4fv(this.u2dCoord,false,(Mat.Identity(4).translate3d(-1,1,0).scale3d(2/C.width,-2/C.height,0)).array);
	}
	enable(){
		this.dText.DanmakuText.forEach(t=>{
			this.newDanmaku(t,false);
		});
		this.dText.useImageBitmap=false;
		requestAnimationFrame(()=>this.draw());
	}
	disable(){
		this.clear();
	}
	newDanmaku(t,async=true){
		const gl=this.gl;
		t.glDanmaku=false;
		if(t._cache.height>this.maxTexSize || t._cache.width>this.maxTexSize){//ignore too large danmaku image
			console.warn('Ignore a danmaku width too large size',t.danmaku);
			return;
		}
		let tex;
		if(!(tex=t.texture)){
			tex=t.texture=gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D,tex);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
		}
		if(async){
			Utils.requestIdleCallback(()=>{
				gl.bindTexture(gl.TEXTURE_2D,tex);
				gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t._cache);
				t.glDanmaku=true;
			});
		}else{
			gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t._cache);
			t.glDanmaku=true;
		}

		//vert
		let y=t.style.y-t.estimatePadding;
		t.vertCoord=new Float32Array([
			0,y,
			0,y,
			0,y+t._cache.height,
			0,y+t._cache.height,
		]);
	}
}



const commonTextureCoord=new Float32Array([
	0.0,  0.0,//↖
	1.0,  0.0,//↗
	0.0,  1.0,//↙
	1.0,  1.0,//↘
]);


export default TextWebGL;
