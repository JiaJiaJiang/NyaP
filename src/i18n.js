const i18n={
	lang:null,
	langs:{},
	_:(str)=>{
		return i18n.langs[i18n.lang][str]||str;
	}
};


i18n.langs['zh-CN']={
	'play':'播放',
}


export {i18n};