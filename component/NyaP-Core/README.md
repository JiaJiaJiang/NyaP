# NyaP-Core

NyaPlayer core

![logo](https://jiajiajiang.github.io/staticRepo/NyaP/logo.png)

## Dev

This is the core module of NyaP.

Want to build a customized NyaP ? Take a look at project [NyaP](https://github.com/JiaJiaJiang/NyaP) as an example.

### Exports

* class : [NyaPlayerCore](#Class: NyaPlayerCore)
* class : [DomTools](#Class: DomTools)
* class : [i18n](#Class: i18n)
* class: [Utils](#Class: Utils)


## Concepts

#### URL Resolve

Sometimes we get a url of the video source which may can't be loaded by the browser directly(such as ipfs links and magnet links), so the player core presents a url resolve mechanism to resolve a raw url to another url which can be loaded by the browser.

The url resolvers are added by method [addURLResolver](#addURLResolver(func,priority=0)), a url resolver is an async functoin that can resolve a url to another url. By default, the resolvers are used by video src resolving, but you can also resolve a url manually using the method [resolveURL](#resolveURL(url)).

Resolvers are ordered by their priority number(can be negative),  smaller number represents higher priority.

There's a default resolver(priority:999) which directly returns the input url, so the src set by [setVideoSrc](#setVideoSrc(src)) will become video src by default.

**If your plugin adds resolvers to the core, please set src after 'coreLoad' event.**

#### Plugins

Plugins can extend functions of this player, the player instance will be passed to each plugin's 'init' method to active it. 

A plugin is a js file which contains an object. The object should have a 'name' property to let the core know what the plugin is and prevent initializing the plugin multi times. The object can have a 'init(player)' function, which will be called when the plugin be loaded.

```javascript
({
	name:"plugin_name",
	init:NP=>{
		NP.log('wow, loading a plugin!');
	},
  otherPropertyOrFunctions:...
})
```

*Remember to add brackets around the object, otherwise it will throw an error.*

## Class: NyaPEventEmitter

### Methods

---

#### emit(e,...args)

Emit an event on NyaP instance.

- e : (string) Event name.
- args : arguments for the event.

*Return this.*

#### on(e,listener,top=false)

Add a listener to the NyaP instance.

- e : (string) Event name.
- listener : (function) The listener function, which will be call with arguments when the event is emited.
- top : (boolean) Whether to add the listener to the top of the event array.

*Return this*

#### addEventListener

Alias of 'on' method.

#### removeEvent(e,listener)

Remove the event listener.

- e : (string) Event name.
- listener : (function) The added listener function.

If listener not defined, all listeners of the event will be removed.

#### globalListener(e,...args)

All events will be passed to this function.

- e : (string) Event name.
- args : arguments of the event.



## Class: NyaPlayerCore

### constructor(options)

* options : (object) An object contains following options.
  * muted : (bool) Mute the video.
  * volume : (float 0-1) Set the volume.
  * loop : (bool) Video loop.
  * src : (string) Video src.
  * plugins : (array[string,…]) URLs for the plugins.

### Events

------

#### 'srcChanged' : src

'setVideoSrc' is called.

* src : (string) The new src.

#### 'video_loopChange' : loop

The video's 'loop' attribute changed.

* loop : (bool) Loop value.

#### 'stat' : statObj

A new stat is created.

* statObj : (array)[timestamp,promise]. The promise resolves the result of the stat.

#### 'coreLoad'

NyaP core loaded (all plugins loaded).

#### 'coreLoadError' : err

NyaP core loading failed.

*  err : (Error) A error caught some where when creating the core.

#### 'debug' : debugObj

A debug message pushed.

* debugObj : (array) content of the array:[timestamp,…msgs]

### Properties

------

#### static NyaPCoreOptions 

Default options for NyaP Core.

#### static DomTools

class : [DomTools](#Class: DomTools)

#### static i18n

class : [i18n](#Class: i18n)

#### static Utils

class: [Utils](#Class: Utils)

#### debugs 

**[[timestamp,message],…]**

Array for storing debug messages. 

The message should be a string.

#### stats

**[[timestamp,stat_name,promise_or_result],...]**

Array for storing stats messages. Each item is an array.

#### plugins

**{plugin_name=>plugin_object}**

The entry for all plugins.

#### i18n

**[i18n](file:///Users/luojia/Dev/GitHub/NyaP-Core/#Class: i18n) instanse**

#### getter video

The video element

#### getter videoSize

#### getter videoSrc

The raw src set by [setVideoSrc](#setVideoSrc(src))



### Methods

------

#### log(content,type='log',...styles)

Log to console.

* content : (string) Content to be logged.
* type : (string) Logging type. The same as console object's.
* styles : (string) Styles for the log. The same as console object's.

This functoin will add a prefix 'NyaP' to the log.

#### debug(msg)

Push the debug message into debugs array and emit a 'debug' event with that data array.

* msg : (string) The debug message.

#### stat(statusName[,callback])

Push a status message to the stats array and emit a 'stat' event with the data array.

* statusName : (string) The status name.
* callback : (function||async function) A function for the procedure, can be an async function or a function. The stat will fill the result when the callback finishs. 

*Return a function which should be called when the stat changes.*

#### statResult(statusName,result)

Update the result of the last stat with the name.

* statusName : (string) The status name.
* result : (string||Error) The result of the stat.

If result is an instance of Error, the stat promise will throw an exception, which could be caught by catch function.

#### addURLResolver(func[,priority=0])

Add a url resolver to the core.

* func : (async function) The function for resolving th url.
* priority : (number) A number represents the resolver's priority, the smaller number the higher priority.

About [URL Resolve](#URL Resolve).

#### resolveURL(url)

Resolve the url to another url using added url resolver.

* url : (string) url string to be resolved.

*Return a promise which will resolve to the result.*

About [URL Resolve](#URL Resolve).

#### setVideoSrc(src)

Set the raw url for the video. The raw url will be resolved by [resolveURL](#resolveURL(url)) and the result will be passed to the [video](#video : getter).

* src : (string) The raw video url.

#### playToggle([switch=this.video.paused])

Play or pause the video.

* switch : (bool) 'ture' to play, 'false' to pause.

*Return a promise which returned by the play or pause method.*

If switch is undefined, this method will play the video if it's paused or pause the video if it's playing.

#### loadPlugin(url[,name])

Load a NyaP plugin from the url.

* url : (string) Relative path or absolute url of the plugin.
* name : (string) Optional. Check if the name of the plugin exists.

*Return a promise which will resolve to the pulgin object.*

About [plugins](#Plugins).



## Class: i18n

### constructor([langs={},langsArr=navigator.languages])

* langs : (object{langCode:{textMap}}) Optional. To fill translate texts.
* langsArr : (array) Optional. Language priority list. Defaults to `navigator.languages`.

### Properties

---

#### langsArr

**[language code,...]**

User language priority list.

Example:

```javascript
["zh-CN", "ja-JP", "ja", "zh", "en", "zh-TW"]
```

#### langs

**{lang code=>{text=>translate},…}**

Translation texts.

Example:

```javascript
{
    "zh":{
        "play":"播放",
        "send":"发送"
    },
    "ja":{
        "play":"再生",
        "send":"送信"
    },
    "ja-JP":{
        ...
    }
}
```



### Mathods

---

#### add(langCode,texts)

Add a language to the translation instance.

* langCode : (string) **ISO Language Code**.
* texts : (object {raw text => translation}) Translation map.

*Return translation text.*

#### _(str,...args)

Translate and fill arguments in the text.

* str : The raw text provided in the code (can be a default language version or just a placeholder).

*Return translated text.*

#### findTranslation(text)

Find the translation text.

* text : (string) raw text,

*Return available translation in the translation map.*

## Class: DomTools

#### static addEvents(targets,events)

Add events to element(s).

* targets : (a element||any event target||array of them) The target to add events.
* events : (object) events to add to the target(s).

Example:

```javascript
DomTools.addEvents([window,document],{
    load:e=>{/*do sth*/},
    "click,keypress,scroll":e=>{/*do sth*/}
});
```

#### static fullscreenElement()

*Return current fullscreen element.*

#### static requestFullscreen(element=document)

Request fullscreen for the element.

* element : (HTMLElement) You know.

*Return the promise returned by the requestFullscreen function.*

#### static exitFullscreen(element=document)

Exit fullscreen.

* element : Specify the element in some plantforms.

*Return the promise returned by the exitFullscreen function.*

#### static isFullscreen(element=document)

Check if the broswer is in fullscreen mode.

* element : Specify the element in some plantforms.

*Return true or false.*

#### static Object2HTML(o2hObj)

See : (Object2HTML)[https://github.com/JiaJiaJiang/Object2HTML]

## Class: Utils

#### static clamp(num,min,max)

Limit a number between the range.

* num : Input number.
* min : lower border.
* max : higher border.

*Return the result.*

#### static isObject(obj)

*Return if the input is an object, not null or other things.*

#### static deepAssign(target,...args)

Just like `Object.assign`, but also works with objects on properties.

#### static setAttrs(ele,obj)

Set multi attributes on an element.

* ele : The element.
* obj : Attributes in the object.

*Return the element.*

#### static rand(min, max)

*Return an integer between `min` and `max`.*

#### static animationFrameLoop(cb)

Do a loop call to the cb using `requestAnimationFrame`, until the cb returns `false`.

#### static requestIdleCallback(cb)

A simple polyfill of global requestIdleCallback.