/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import {i18n} from './i18n.js';
import {NyaPlayerCore} from './NyaPCore.js';
import {Object2HTML} from '../lib/Object2HTML/Object2HTML.js'
import ResizeSensor from '../lib/danmaku-frame/lib/ResizeSensor.js';

const _=i18n._;

//touch player
class TouchNyaP extends NyaPlayerCore{
	constructor(opt){
		super(opt);
		this._player=Object2HTML({
			_:'div',attr:{'class':'NyaP_Mini'}
		});
	}
	

}


window.TouchNyaP=TouchNyaP;
