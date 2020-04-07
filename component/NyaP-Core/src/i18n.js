/*
Copyright luojia@luojia.me
LGPL license
*/


//polyfill
if(!navigator.languages){
	navigator.languages=[navigator.language||navigator.browserLanguage];
}


class i18n{
	/*
	*@param{object}langs Language text object indexed by language code
	*@param{array}langsArr Language priority array
	*/
	constructor(langs={},langsArr=[...navigator.languages]){
		this.langs=langs;//defines texts
		this.langsArr=langsArr;
		this.langsArr.push('zh-CN');//add zh-CN as default language
	}
	langsArr=[];//language priority array
	_(str,...args){//translate
		let s=this.findTranslation(str);
		args.length&&args.forEach((arg,ind)=>{s=s.replace(`$${ind}`,arg)});//fill args in the string
		return s;
	}
	findTranslation(text){
		for(let lang of this.langsArr){//find by language priority
			if((lang in this.langs) && (text in this.langs[lang])){
				return this.langs[lang][text];
			}
			//fallback to other same main code
			let code=lang.match(/^\w+/)[0];
			for(let c in this.langs){
				if(c.startsWith(code) && (text in this.langs[c])){
					return this.langs[c][text];
				}
			}
		}
		return text;
	}
	add(langCode,texts){
		this.langs[langCode]=texts;
	}
}

export {i18n};