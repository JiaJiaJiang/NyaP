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
	'pause':'暂停',
	'muted':'静音',
	'settings':'设置',
	'loop(L)':'循环(L)',
	'hex color':'Hex颜色',
	'full page(P)':'全页模式(P)',
	'Creating player':'创建播放器',
	'full screen(F)':'全屏模式(F)',
	'danmaku toggle(D)':'弹幕开关(D)',
	'Input danmaku here':'在这里输入弹幕',
	'Loading danmaku frame':'加载弹幕框架',
	'danmaku input(Enter)':'弹幕输入框(回车)',
	'volume($0)([shift]+↑↓)':'音量($0)([shift]+↑↓)',
	'Failed to change to fullscreen mode':'无法切换到全屏模式',
}



//automatically select a language

if(!navigator.languages){
	navigator.languages=[navigator.language];
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
console.debug('Language:'+i18n.lang)

export {i18n};