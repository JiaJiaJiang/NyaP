/*
Copyright luojia@luojia.me
LGPL license
*/
import Template from './textModuleTemplate.js';

class TextOff extends Template{
	constructor(dText){
		super(dText);
		this.supported=true;
        this.container=document.createElement('div');
        this.container.style.display='none';
	}
}

export default TextOff;
