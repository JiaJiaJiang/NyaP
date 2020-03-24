/*
Copyright luojia@luojia.me
LGPL license
*/
class textModuleTemplate{
	supported=false;
	constructor(dText){
		this.dText=dText;
	}
	draw(){}//draw call from danmaku-frame on every animation frame
	rate(){}//playback rate
	pause(){}//the media is paused
	play(){}//the media is starting
	clear(){}//clear all danmaku on screen
	resize(){}//the container is resized
	remove(){}//remove a danmaku freom the screen
	enable(){}//this module is enabled
	disable(){}//this module is disabled
	newDanmaku(){}//add danmaku to the screen
	deleteTextObject(){}
}

export default textModuleTemplate;
