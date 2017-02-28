const i18n={
	lang:null,
	langs:{},
	_:(str,...args)=>{
		let s=(i18n.lang&&i18n.langs[i18n.lang][str])||str;
		args.length&&args.forEach((arg,ind)=>{s=s.replace(`$${ind}`,arg)});
		return s;
	}
};

//Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith)
String.prototype.startsWith = function(searchString, position){
	position = position || 0;
	return this.substr(position, searchString.length) === searchString;
};


i18n.langs['zh-CN']={
	'play':'播放',
	'loop':'循环',
	'Send':'发送',
	'pause':'暂停',
	'muted':'静音',
	'full page':'全页模式',
	'full screen':'全屏模式',
	'volume($0)':'音量（$0）',
	'danmaku input':'弹幕输入框',
	'Input danmaku here':'在这里输入弹幕',
	'Failed to change to fullscreen mode':'无法切换到全屏模式',
}






for(let lang of navigator.languages){
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