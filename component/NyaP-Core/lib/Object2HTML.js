/*
Copyright luojia@luojia.me
LGPL license
*/
function Object2HTML(obj,func){
	let ele,o={},a=[];
	if(obj===null || typeof obj !=='object')ele=document.createTextNode(String(obj));//text node
	else if(obj instanceof Node)ele=obj;
	else{
		if(obj===undefined)throw(new TypeError(`'undefined' received, object or string expect.`));
		if(!obj._)obj._='div';
		ele||(ele=document.createElement(obj._));
		//attributes
		for(let [attr,value] of Object.entries(obj.attr||obj.a||o))
			ele.setAttribute(attr,value);
		//properties
		for(let [prop,value] of Object.entries(obj.prop||obj.p||o))
			ele[prop]=value;
		//events
		for(let [e,cb] of Object.entries(obj.event||obj.e||o))
			ele.addEventListener(e,cb);
		//childNodes
		for(let c of (obj.child||obj.c||a)){
			let e=Object2HTML(c,func);
			(e instanceof Node)&&ele.appendChild(e);
		}
	}
	func&&func(ele);
	return ele;
}

export default Object2HTML;
export {Object2HTML}