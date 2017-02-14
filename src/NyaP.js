/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {DanmakuFrame,DanmakuFrameModule} from '../lib/danmaku-frame/src/danmaku-frame.js'
import {init as initText2d} from '../lib/danmaku-text/src/danmaku-text.js'
import {Object2HTML} from '../lib/Object2HTML/Object2HTML.js'


initText2d(DanmakuFrame,DanmakuFrameModule);//init text2d mod


//default options
const NyaPOptions={
	//touchMode:false,
}

class NyaPlayerCore{
	constructor(opt){
		this.opt=Object.assign({},NyaPOptions,opt);

	}
	play(){

	}
	pause(){

	}
	seek(){

	}
	get player(){
		return this._player;
	}
}

//normal player
class NyaP extends NyaPlayerCore{
	constructor(opt){
		super(opt);
		this._player=Object2HTML({
			_:'div',attr:{'class':'NyaP'}
		});
	}
	

}

//touch player
class TouchNyaP extends NyaPlayerCore{
	constructor(opt){
		super(opt);
		this._player=Object2HTML({
			_:'div',attr:{'class':'NyaP'}
		});
	}
	

}

window.NyaP=NyaP;