#Mat.js
*基于矩阵对象的矩阵运算库*

# 简介
* 本库可以使用不同的数组构造矩阵类，如`Array`，`Float32Array`，`Float64Array`等（默认为`Float32Array`类矩阵）。
* 本库所生成的矩阵数据保存于`.array`数组中，数组内容为按行展开的矩阵。

# 使用
* 直接引用Mat.js，并使用Mat全局对象。（根据需要可以先使用babel转码，已兼容babel es2015模式）
* 作为模块引用，兼容作为es6（需转码）、AMD、CMD模块使用。

**请不要手动修改矩阵对象的属性，以免造成错误。**


----------


## Mat(row,column[,fill])
新建矩阵

* row : 矩阵的行数
* column : 矩阵列数
* fill : （可选）填充。为数字时，将用此数字填充矩阵。为一个有length属性的对象时，将调用矩阵的`set`方法设置矩阵内容。

**返回一个矩阵对象`Matrix`。**

#### 示例
```
new Mat(3,3);	//创建一个3x3的矩阵
new Mat(3,3,[1,2,3,4,5,6,7,8,9])	//创建一个3x3的矩阵并填入该数组的内容
new Mat(3,3,0)	//创建一个3x3的矩阵并把每个元素填充为0
new Mat(3,3,另一个矩阵) //创建一个3x3矩阵，并用另一个矩阵填充
```

## Mat的方法

### Mat.Identity(n)
创建单位矩阵

* n : 矩阵维数

**返回一个新的单位矩阵。**

### Mat.Perspective(fovy,aspect,znear,zfar[,result])(n)
透视矩阵

* fovy : 视角
* aspect : 宽高比
* znear : 近截面出距离
* zfar : 远截面距离
* result : （可选）用于保存结果的矩阵，只能为4x4矩阵。如果未指定，将生成一个新的矩阵。

**返回结果矩阵。**

### Mat.multiply(a,b[,result])
矩阵相乘

* a,b : 两个参与乘法的矩阵
* result : （可选）用于保存结果的矩阵。如果未指定，将生成一个新的矩阵。

**返回结果矩阵。**

### Mat.multiplyString(a,b[,array,ignoreZero=true])
矩阵相乘，保留运算过程，不计算结果。用于调试和手动合并一些固定的运算。
只能用于支持以字符串作为元素的矩阵类。

* a,b : 参与乘法的矩阵
* array : （可选）用于保存结果的矩阵。如果未指定，将生成一个新的矩阵。
* ignoreZero : （可选）是否忽略计算过程中的0值。（默认值：true）

**返回结果矩阵。**


### Mat.add(a,b[,result])
矩阵按元素相加

* a,b : 参与加法的矩阵
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.minus(a,b[,result])
矩阵按元素相减

* a,b : 参与减法的矩阵
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.rotate2d(m,t[,result])
计算2D旋转矩阵(仅适用于3x3矩阵)

* m : 基础矩阵
* t : 弧度
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.scale2d(m,x,y[,result])
计算2D缩放矩阵(仅适用于3x3矩阵)

* m : 基础矩阵
* x : x轴缩放比例
* y : y轴缩放比例
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.translate2d(m,x,y[,result])
计算2D位移矩阵(仅适用于3x3矩阵)

* m : 基础矩阵
* x : x轴位移
* y : y轴位移
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.rotate3d(m,tx,ty,tz[,result])
计算3D旋转矩阵(仅适用于4x4矩阵)

* m : 基础矩阵
* tx : 绕x轴旋转弧度
* ty : 绕y轴旋转弧度
* tz : 绕z轴旋转弧度
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.rotateX(m,t[,result])
计算3D绕x轴旋转矩阵(仅适用于4x4矩阵)

* m : 基础矩阵
* t : 绕x轴旋转弧度
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.rotateY(m,t[,result])
计算3D绕y轴旋转矩阵(仅适用于4x4矩阵)

* m : 基础矩阵
* t : 绕y轴旋转弧度
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.rotateZ(m,t[,result])
计算3D绕z轴旋转矩阵(仅适用于4x4矩阵)

* m : 基础矩阵
* t : 绕z轴旋转弧度
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.scale3d(m,x,y,z[,result])
计算3D缩放矩阵(仅适用于4x4矩阵)

* m : 基础矩阵
* x : x轴方向缩放比例
* y : y轴方向缩放比例
* z : z轴方向缩放比例
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.translate3d(m,x,y,z[,result])
计算3D位移矩阵(仅适用于4x4矩阵)

* m : 基础矩阵
* x : x轴方向位移
* y : y轴方向位移
* z : z轴方向位移
* result : （可选）用于保存结果的矩阵。

**返回结果矩阵。**


### Mat.put(m,sub,row,column)
把一个矩阵保持阵型放入另一个矩阵，超出原矩阵范围的数据将被忽略。

* m : 基础矩阵
* sub : 要放入的矩阵
* row : sub矩阵左上角的元素位于m中的行数（从0开始）
* column : sub矩阵左上角的元素位于m中的列数（从0开始）

**无返回。**

#### 示例
```
new Mat(5,5,0).put( Mat(2,2,1) ,2,2)
/*
0 0 0 0 0
0 0 0 0 0 
0 0 1 1 0
0 0 1 1 0
0 0 0 0 0
*/

new Mat(5,5,0).put( Mat(2,2,1) ,4,2)
/*
0 0 0 0 0
0 0 0 0 0 
0 0 0 0 0
0 0 0 0 0
0 0 1 1 0
*/
```

### Mat.createClass(Constructor)
新建一个基于`Constructor`数组的矩阵类。
以此创建出来的矩阵类的方法和Mat一样，只是基于不同的数组类。（默认的Mat基于Float32Array类）

#### 示例

```
var ArrayMat=Mat.createClass(Array);    //创建一个以Array为数组的矩阵类
var Int32ArrayMat=Mat.createClass(Int32Array);    //创建一个以Int32Array为数组的矩阵类（大概不会有人用到）
```

### Mat.Matrixes
存放了一些用于计算而生成的矩阵，**请勿修改这些矩阵的值，否则会造成运算错误**。

**可用矩阵**

* Mat.Matrixes.I2 : 一个2阶单位矩阵
* Mat.Matrixes.I3 : 一个3阶单位矩阵
* Mat.Matrixes.I4 : 一个4阶单位矩阵


----------


## 矩阵对象

#### 新建矩阵对象
```
var Matrix=new Mat(3,3);
```

### 属性
* length : 矩阵元素个数
* column : 矩阵列数
* row : 矩阵行数

> 以下方法中的变换方法结果均会填充回原矩阵。

### Matrix.leftMultiply(m)
在左边乘一个矩阵m，结果存入原矩阵。

**返回原矩阵对象。**

### Matrix.rightMultiply(m)
在右边乘一个矩阵m，结果存入原矩阵。

**返回原矩阵对象。**

### Matrix.fill(n)
将矩阵所有元素填充为n。

**返回原矩阵对象。**
```
new Mat(3,3).fill(1)
/*
1 1 1
1 1 1
1 1 1
*/
//等同于
new Mat(3,3,1)
```

### Matrix.set(arr,offset=1)
将数组arr放到从offset开始的位置。（由于此库的矩阵实质也是数组，所以可以使用此方法填充矩阵）

**返回原矩阵对象。**

#### 示例
```
new Mat(3,3).set([1,0,0,0,1,0,0,0,1])
/*
1 0 0
0 1 0
0 0 1
*/
//等同于
new Mat(3,3,[1,0,0,0,1,0,0,0,1])
```

### Matrix.put(m,row=0,column=0)
调用`Mat.put(Matrix,m,row,column)`

**返回原矩阵对象。**

### Matrix.clone()
**返回一个一样的矩阵。**

### Matrix.rotate2d(t)
调用`Mat.rotate2d`将此矩阵二维旋转t弧度。

**返回原矩阵对象。**

### Matrix.translate2d(x,y)
调用`Mat.translate2d`将此矩阵进行二维平移变换。

**返回原矩阵对象。**

### Matrix.scale2d(x,y)
调用`Mat.scale2d`将此矩阵进行二维平移变换。

**返回原矩阵对象。**

### Matrix.rotate3d(tx,ty,tz)
调用`Mat.rotate3d`将此矩阵进行三维旋转变换。

**返回原矩阵对象。**

### Matrix.scale3d(x,y,z)
调用`Mat.scale3d`将此矩阵进行三维缩放变换。

**返回原矩阵对象。**

### Matrix.translate3d(x,y,z)
调用`Mat.translate3d`将此矩阵进行三维平移变换。

**返回原矩阵对象。**

### Matrix.rotateX|rotateY|rotateZ(t)
调用`Mat.rotateX|rotateY|rotateZ`将此矩阵进行三维绕轴旋转变换。

**返回原矩阵对象。**

### Matrix.toString()
以字符串形式表示当前的矩阵。
#### 示例
```
new Mat(2,2,[2,3,4,5]).toString()
//返回字符串
'2 3
4 5'
```


----------
## Tip
由于矩阵对象的变换方法都返回原矩阵对象，所以一些操作可以写成链式的。
```
new Mat.Identity(3) //创建一个三阶单位矩阵
    .translate2d(4,5)   //平移(4,5)
    .rotate2d(1)        //旋转一个弧度
    .scale2d(2,5)       //缩放(2,5)
    .toString()
//结果
"1.0806045532226562	-1.6829419136047363	-4.092290878295898
4.207354545593262	2.7015113830566406	30.33697509765625
0	0	1"
```