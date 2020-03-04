const {
	NyaPlayerCore,
	DomTools,
	i18n,
	Object2HTML,
}=require('NyaP-Core');

//load languages to the core



//default options
const NyaPCoreOptions={
	//for danmaku
	danmaku:{
		enable:true,
		TextDanmaku:{
			defaultStyles:{},
			options:{},
			// for settings
			defaultOptions:{
				danmakuColor:null,//a hex color(without #),when the color inputed is invalid,this color will be applied
				danmakuMode:0,//0: right to left.
				danmakuSize:1,//times of the default size
			}
			send:d=>{return Promise.reject();}//the method for sending danmaku
		},

	},
	// enableDanmaku:true,//set to false to disable danmaku feature (related buttons will not be created)
	// danmakuModule:['TextDanmaku'],//not your option now
	// danmakuModuleArg:{
	// 	TextDanmaku:{
	// 		defaultStyle:{},
	// 		options:{},
	// 	}
	// },
	loadingInfo:{//text replacement at loading time (for left-bottom message)
		doneText:'ok',
		contentSpliter:'...',
	},
	//for sending danmaku
	// defaultDanmakuColor:null,//a hex color(without #),when the color inputed is invalid,this color will be applied
	// defaultDanmakuMode:0,//0: right to left. see: https://github.com/JiaJiaJiang/danmaku-text#%E5%BC%B9%E5%B9%95%E5%AF%B9%E8%B1%A1%E6%A0%BC%E5%BC%8F
	// defaultDanmakuSize:24,
	//danmakuSend:(d,callback)=>{callback(false);},//the func for sending danmaku

	//other common options
	playerFrame:null,//the element for containing the player
}

//NyaP classic theme Core
class NyaPCore extends NyaPlayerCore{
	frame=null;//the player's frame
	constructor(){
		super();

		Object.assign(this._,{
			playerMode:'normal'
		});

		//the video frame for NyaP and NyaPTouch
		this.videoFrame=O2H(
			{_:'div',attr:{id:'video_frame'},child:[
				this.video,
				//this.container,
				{_:'div',attr:{id:'loading_frame'},child:[
					{_:'div',attr:{id:'loading_anime'},child:['(๑•́ ω •̀๑)']},
					{_:'div',attr:{id:'loading_info'}},
				]}
			]}
		);
	}
	$(selector){//querySelector for the frame element
		return this.frame.querySelector(selector);
	}
	$$(selector){//querySelectorAll for the frame element
		return this.frame.querySelectorAll(selector);
	}
}

module.exports={
	NyaPCore,
	DomTools,
	Object2HTML,
}