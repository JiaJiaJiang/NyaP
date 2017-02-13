#Object2HTML

用于把以下格式的对象转换成HTML元素

``````
{_:'tagname',
	attr:{},//attributes
	prop:{},//properties
	child:[/*other object*/]//childNodes
}
``````

## 使用

```
Object2HTML(object);
```
返回传入对象对应的HTML元素