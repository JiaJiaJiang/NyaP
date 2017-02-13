/*
Copyright luojia@luojia.me
LGPL license
*/

function Object2HTML(obj){
	let ele,o,e;
	if('_' in obj === false)return;
	if(typeof obj._ !== 'string' || obj._=='')return;
	ele=document.createElement(obj._);
	//attributes
	if(typeof obj.attr === 'object'){
		for(o in obj.attr){
			ele.setAttribute(o,obj.attr[o]);
		}
	}
	//properties
	if(typeof obj.prop === 'object'){
		for(o in obj.prop){
			ele[o]=obj.prop[o];
		}
	}
	//events
	if(typeof obj.event === 'object'){
		for(o in obj.event){
			ele.addEventListener(o,obj.event[o]);
		}
	}
	//childNodes
	if(typeof obj.child === 'object' && obj.child.length>0){
		for(o of obj.child){
			e=Object2HTML(o);
			(e instanceof HTMLElement)&&ele.appendChild(e);
		}
	}
	return ele;
}

export {Object2HTML}