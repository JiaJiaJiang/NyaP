NyaP
====

一个HTML5播放器框架

![logo](https://jiajiajiang.github.io/staticRepo/NyaP/logo.png)

在线演示:[SimpleDanmakuSite](https://danmaku.luojia.me/player/?id=3)

## 功能
* 播放视频
* 处理弹幕
* 普通模式`NyaP`和触摸屏模式`NyaPTouch`

## 说明

播放器创建方式见`demo/demo.html`，喂进NyaP对象的参数见[NyaP核心](https://github.com/JiaJiaJiang/NyaP/blob/master/component/NyaP-Core/index.js#L14),[NyaP](https://github.com/JiaJiaJiang/NyaP/blob/master/src/NyaP.js#L24)与[NyaP触摸版](https://github.com/JiaJiaJiang/NyaP/blob/master/src/NyaPTouch.js#L22)

创建好NyaP对象后该对象的`video`属性就是视频对象。

之后可能还会有结构上的变动，所以目前还不会写文档。

## 子模块
* [Object2HTML](https://github.com/JiaJiaJiang/Object2HTML) : 把js对象转换为DOM对象
* [danmaku-frame](https://github.com/JiaJiaJiang/danmaku-frame) : 弹幕框架
* [danmaku-text](https://github.com/JiaJiaJiang/danmaku-text) : 用于弹幕框架的文本弹幕模块

## log
* 2019/1/20 : 添加插件功能，插件样本请看`demo/plugin-demo.js`。更具体的用法还是有人想用我再写文档吧。


用于被更外层播放器外壳引用
核心
	事件
	配置
	log
	播放控制
	i18n功能
	UI接口信息提供
		log
	插件加载
		多插件单文件加载
	组件加载（编译时）