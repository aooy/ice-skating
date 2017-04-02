# ice-skating

提供基础功能轻量级的滑块插件。大约250行代码，支持ie10+以上的标准浏览器。

# example 

* [移动端](https://aooy.github.io/iceSkating/example/mobile.html)
* [pc端](https://aooy.github.io/iceSkating/example/pc.html)

例子的源码位于example文件中

# install

npm:

    $ npm install ice-skating --save
    
# Usage

### 基本的HTML结构:

```HTML

<div class="ice-container">
    <div class="ice-wrapper" id="myIceId">
        <div class="ice-slide">Slide 1</div>
        <div class="ice-slide">Slide 2</div>
        <div class="ice-slide">Slide 3</div>
    </div>
</div>

```
### 引入js:
```js
//ES2015
import { iceSkating } from 'ice-skating'
//CommonJS
var iceSkating = require('ice-skating').iceSkating
//Browser globals
//iceSkating.js位于dist文件中
<script src="path/to/iceSkating.js"></script>
```
### 初始化:

```js
new iceSkating(parameters);
```
* **parameters**是一个传递初始化参数的对象。

```js
//example
var myIce = new iceSkating({
       containerId: '#myIceId'
   });
```

### parameters

参数     |   类型  |     默认    |                        描述
------- | ------- | ---------- | -------------------------------------------------
containerId  | string | null | 必须。指定需要位移的容器元素ID，如同上面例子的'#myIceId' 
animationDuration | number | 300 | 单位ms，动画的持续时间 
autoPlay | boolean | false | 是否进行自动轮播
autoplayDelay | number | 3000 | 单位ms，每次轮播的间隔时间
touchRatio  | number | 1 | 滑动系数，滑块的移动距离 = 触摸距离 * 滑动系数
direction  | string | x | 滑动方向，默认水平方向，y为垂直方向
critical  |  number | 0.1 | 触发切换滑块的系数，例如0.1，只要移动当前滑块宽度的10%以上才会触发切换
fastClickTime | number | 300 | 单位ms，判定此次操作为点击的最大时间，只要操作时间小于这个值，都认为是点击
clickCallback | function | null | 判定为点击操作时执行此函数
iceEndCallBack | function | null | 每次动画结束时执行此函数

### 实例提供的方法：
* **getIndex**

取得当前滑块的索引，索引从0开始。

```js
//example
var myIce = new iceSkating({
       containerId: '#myIceId'
   });
var  currIndex = myIce.getIndex(); // 0 
```

* **moveToIndex(index)**

index是一个number类型的索引参数,调用后会立即切换到相应的滑块。

```js
//example
var myIce = new iceSkating({
       containerId: '#myIceId'
   });
myIce.getIndex(); // 0 
myIce.moveToIndex(1);
myIce.getIndex(); // 1
```
**使用这两个方法可以实现点击按钮切换滑块的效果**

## License
[MIT](https://github.com/pakastin/redom/blob/master/LICENSE)
