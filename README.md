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
* NyaP-Core : 播放器核心，实现组合各个插件的功能
* NyaP-Danmaku : 弹幕功能组件

## log
* 2019/1/20 : 添加插件功能，插件样本请看`demo/plugin-demo.js`。更具体的用法还是有人想用我再写文档吧。
* 2020/3/3	: 改变文件结构，核心和弹幕部分从外部模块转换为功能组件
