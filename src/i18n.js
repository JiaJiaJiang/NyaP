/*
Copyright luojia@luojia.me
LGPL license
*/
const i18n={
	lang:null,
	langs:{},
	_:(str,...args)=>{
		let s=(i18n.lang&&i18n.langs[i18n.lang][str])||str;
		args.length&&args.forEach((arg,ind)=>{s=s.replace(`$${ind}`,arg)});
		return s;
	}
};


i18n.langs['zh-CN']={
	'play':'播放',
	'Send':'发送',
	'Done':'完成',
	'loop':'循环',
	'pause':'暂停',
	'muted':'静音',
	'volume':'音量',
	'settings':'设置',
	'wheeling':'滚轮',
	'hex color':'Hex颜色',
	'Loading core':'加载核心',
	'Loading video':'加载视频',
	'Loading plugin':'加载插件',
	'full page(P)':'全页模式(P)',
	'Loading danmaku':'加载弹幕',
	'Creating player':'创建播放器',
	'full screen(F)':'全屏模式(F)',
	'danmaku toggle(D)':'弹幕开关(D)',
	'Input danmaku here':'在这里输入弹幕',
	'Loading danmaku frame':'加载弹幕框架',
	'danmaku input(Enter)':'弹幕输入框(回车)',
	'Failed to change to fullscreen mode':'无法切换到全屏模式',
}



//automatically select a language

if(!navigator.languages){
	navigator.languages=[navigator.language||navigator.browserLanguage];
}

for(let lang of [...navigator.languages]){
	if(i18n.langs[lang]){
		i18n.lang=lang;
		break;
	}
	let code=lang.match(/^\w+/)[0];
	for(let cod in i18n.langs){
		if(cod.startsWith(code)){
			i18n.lang=cod;
			break;
		}
	}
	if(i18n.lang)break;
}

export {i18n};