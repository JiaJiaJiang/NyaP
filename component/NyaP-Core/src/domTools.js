import {ResizeObserver as ResizeObserverPolyfill} from '@juggle/resize-observer';
import {Object2HTML as O2H} from '../lib/Object2HTML.js';
import {Utils} from './utils.js';

export class DomTools{
	static addEvents(target,events){
		if(!Array.isArray(target))target=[target];
		target.forEach(function(t){
			if(!Utils.isObject(t.__NyaPEvents__)){
				t.__NyaPEvents__=[];
			}
			for(let e in events)
				e.split(/\,/g).forEach(function(e2){
					t.addEventListener(e2,events[e]);
					t.__NyaPEvents__.push([e2,events[e]]);
				});
		});
	}
    static setAttrs(ele,obj){//set multi attrs to a Element
        for(let a in obj)
            ele.setAttribute(a,obj[a]);
        return ele;
    }
	static fullscreenElement(){
		const d=document;
		return d.webkitFullscreenElement
				||d.msFullscreenElement
				||d.mozFullScreenElement
				||d.fullscreenElement;
	}
	static requestFullscreen(d=document){
		try{
			return (d.requestFullscreen||
			d.msRequestFullscreen||
			d.mozRequestFullScreen||
			d.webkitRequestFullScreen||
			d.webkitEnterFullScreen)
			.call(d);
		}catch(e){
			return Promise.reject(e);
		}
	}
	static exitFullscreen(d=document){
		try{
			return (d.exitFullscreen||
				d.msExitFullscreen||
				d.mozCancelFullScreen||
				d.webkitExitFullScreen||
				d.webkitCancelFullScreen).call(d);
		}catch(e){
			return Promise.reject(e);
		}
	}
	static isFullscreen(d=document){
		return !!(d.fullscreen || d.mozFullScreen || d.webkitIsFullScreen || d.msFullscreenElement || d.webkitDisplayingFullscreen);
	}
	static Object2HTML(...args){
		return O2H(...args);
	}
	static resizeEvent={
		resizeObserverInstance:null,
		observe(dom){
			if(!this.resizeObserverInstance){
				let ResizeObserver=window.ResizeObserver;
				if(typeof  ResizeObserver!== 'function'){
					ResizeObserver=ResizeObserverPolyfill;
				}
				this.resizeObserverInstance=new ResizeObserver(entries => {
					for (let entry of entries) {
						let el = entry.target;
						let e=new Event('resize',{bubbles:false,cancelable:true});
						e.contentRect=entry.contentRect;
						el.dispatchEvent(e);
					}
				});
			}
			this.resizeObserverInstance.observe(dom);
		},
		unobserve(dom){
			if(!this.resizeObserverInstance)
				throw(new Error('resizeObserver not initialized'));
			this.resizeObserverInstance.unobserve(dom);
		},
	}
}

 