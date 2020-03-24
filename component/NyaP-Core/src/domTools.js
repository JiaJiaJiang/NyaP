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
	static fullscreenElement(){
		const d=document;
		return d.webkitFullscreenElement
				||d.msFullscreenElement
				||d.mozFullScreenElement
				||d.fullscreenElement;
	}
	static requestFullscreen(d){
		try{
			return (d.requestFullscreen||
			d.msRequestFullscreen||
			d.mozRequestFullScreen||
			d.webkitRequestFullscreen)
			.call(d);
		}catch(e){
			// console.error(e)
			return Promise.reject(e);
			// alert(_('Failed to change to fullscreen mode'));
		}
	}
	static exitFullscreen(){
		const d=document;
		return (d.exitFullscreen||
		d.msExitFullscreen||
		d.mozCancelFullScreen||
		d.webkitCancelFullScreen).call(d);
	}
	static isFullscreen(){
		const d=document;
		return !!(d.fullscreen || d.mozFullScreen || d.webkitIsFullScreen || d.msFullscreenElement);
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

 