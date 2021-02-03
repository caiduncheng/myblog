---
title: '手动配置babel项目'
tags: ['babel', 'javascript']
date: '2020-06-02'
template: 'post'
thumbnail: 'babel.png'
---
### 前言

> 为了更好的理解和使用babel，决定纯手动配置一个babel项目，篇幅应该很短，毕竟只是一个项目的普通配置

### 开始

#### 生成目录及基本文件

 在根目录下`npm init -y`，生成基本的`package.json`，创建`src`，并在`src`创建`index.js`文件，用于等会balel要编译的文件。然后在根目录创建`.babelrc`文件，作为`babel`的配置文件。

#### 安装依赖

按照[官网](https://www.babeljs.cn/docs/usage)的流程，安装`babel`的一些依赖模块

```
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save @babel/polyfill
```

这几个的具体作用是什么，是否一定需要安装，后面再看，先让流程走通。

#### 配置.babelrc

`babel`编译会自动读取更目录下的`.babelrc`文件，获取配置

```json
{
	"presets": [
		[
			"@babel/env",
			{
				"targets": {
					"edge": "17",
					"firefox": "60",
					"chrome": "67",
					"safari": "11.1"
				},
				"useBuiltIns": "usage"
			}
		]
	]
}
```

上述配置就不做解释了，本文只想跑下流程，具体细节，文末会提供一篇写的很好的文章供参考。

### 运行

基础配置完成了，现在我在`index.js`写两行代码，

```javascript
let a = 1;
const foo = () => {
    console.log("箭头函数")
}
```

运行下面命令

```js
./node_modules/.bin/babel src --out-dir lib
```

发现编译出来的没什么变化，去`mdn`查了下`let`和`箭头函数`在`chrome`的67版本是被支持了的，所以我将上面`targets`的`chrome`改成43版本，重新运行

```javascript
"use strict";

var a = 1;

var foo = function foo() {
  console.log("箭头函数");
};
```

确实被打包成了es5语法了。

现在尝试一下高版本的api

```javascript
let arr = [1, 2, 3];
console.log(arr.includes(1))
```

打包完后

```javascript
"use strict";

require("core-js/modules/es7.array.includes");

var arr = [1, 2, 3];
console.log(arr.includes(1));// true
```

可以看出高版本的api也会被做兼容。

#### babel-polyfill

其实上面的高版本语法并不是由`babel`进行转换的，而是通过`babel-polyfill`来进行转，说到这我们有必要好好讲讲`babel-polyfill`这个包了。先放上[官网地址](https://www.babeljs.cn/docs/babel-polyfill)。

**先简单解释一下**：babel默认只会转义js语法，但对于一些新的`API`是不会做转换的， 像`include`、`Array.from`等方法。`babel-polyfill`做的事情就是帮你兼容这些高版本语法。

**组成**：`babel-polyfill`包含了`core-js`和`regenerator-runtime`这两个包。

**core-js**: 一些高版本语法转低版本就是由这个库来实现的。

**regenerator-runtime**：好像是对`async await`提供转换的库。

但很奇怪🤔，我们并没有在项目中的任何地方引入`babel-polyfill`，怎么就生效了呢😳😳。其实这得益于我们在`.babelrc`中配置的预设`@babel/env`，这个具体是干嘛用的呢。

#### @babel/env

`env`是我们在babel中最常用的，env 的核心目的是通过配置得知目标环境的特点，然后只做必要的转换。例如目标浏览器支持 es2015，那么 es2015 这个 preset 其实是不需要的，于是代码就可以小一点(一般转化后的代码总是更长)，构建时间也可以缩短一些。

如果不写任何配置项，env 等价于 latest，也等价于 es2015 + es2016 + es2017 三个相加(不包含 stage-x 中的插件)。env 包含的插件列表维护在[这里](https://github.com/babel/babel-preset-env/blob/master/data/plugin-features.js)。

那我们现在来看下，为什么上面没有引入`polyfill`，它就直接生效了呢？不用想肯定也能猜到，是`env`这个预设去引入了。我们可以看下关于[babel/env](https://www.babeljs.cn/docs/babel-preset-env#usebuiltins)的里关于`useBuiltIns`的介绍

> `"usage"` | `"entry"` | `false`, defaults to `false`.
>
> This option configures how `@babel/preset-env` handles polyfills.
>
> When either the `usage` or `entry` options are used, `@babel-preset-env` will add direct references to `core-js` modules as bare imports (or requires). This means `core-js` will be resolved relative to the file itself and needs to be accessible.

当`useBuiltIns`值为`usage`,会自动帮我们帮我们引入`core-js`包，但如果是`entry`的话则需要我们自己手动在代码顶部去引一下`polyfill`

### 能不能按需引入polyfill

最近在开发中，出现了一个bug，在安卓5.0的机子上，Chrome版本为43，而我在页面中使用可`includes`方法，导致页面挂了。直接引入`polyfill`就能解决这个问题，可是`polyfill`是运行时的依赖，而且体积不小，所以在想能不能按需引入呢。下面来做下实践。

**根据网上的方法自己实践一下：**

假设有以下源码：

```javascript
const set = new Set();
set.add(1);
console.log([].includes)
```

#### 1. @babel/plugin-transform-runtime

参照[官网](https://babel.docschina.org/docs/en/babel-plugin-transform-runtime)进行操作，记得打包之前先安装下`@babel/runtime-corejs`

```bash
npm install --save @babel/runtime-corejs2
// 或
npm install --save @babel/runtime-corejs3
```

`.babelrc`配置

```json
{
	"plugins": [
	  [
		"@babel/plugin-transform-runtime",
		{
		  "corejs": 2
		}
	  ]
	]
} 
```

编译后

```javascript
import _Set from "@babel/runtime-corejs2/core-js/set";
const set = new _Set();
set.add(1);
console.log([].includes);
```

把`corejs`改成3，进行编译

```javascript
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";
import _Set from "@babel/runtime-corejs3/core-js-stable/set";
const set = new _Set();
set.add(1);
console.log(_includesInstanceProperty([]));
```

发现`core-js`的2版本只会对`Set`进行了处理，但是`findIndex`没有被处理，3却都处理了，所以版本2仅对代码中用到的类/静态方法进行处理，对原型链上的方法不会做处理。

#### 2.@babel/env + useBuiltIns

这个上文中有提到了一些，我们在这边写个`demo`，先安装一下依赖包：

```bash
npm install core-js@3 --save
# or
npm install core-js@2 --save
```

`.babelrc`配置

```json
{
	"presets": [
		[
			"@babel/env",
			{
				"targets": {
					"edge": "17",
					"firefox": "60",
					"chrome": "43",
					"safari": "11.1"
				},
				"useBuiltIns": "usage",
				"corejs": {
					"version": 2
				}
			}
		]
	]
}
```

编译后

```javascript
"use strict";

require("core-js/modules/es7.array.includes");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.set");

var set = new Set();
set.add(1);
console.log([].includes);
```

把`corejs`改成3,再次编译

```javascript
"use strict";

require("core-js/modules/es.array.includes");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.set");

require("core-js/modules/web.dom-collections.iterator");

var set = new Set();
set.add(1);
console.log([].includes)
```

把`useBuiltIns`改成`entry`,同时在要编译的代码头部加入

```javascript
import "core-js";
```

编译后

```javascript
"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

// ...还有很多require

var set = new Set();
set.add(1);
console.log([].includes);
```

##### 结论：

`useBuiltIns: 'entry'` 是按目标环境去 polyfill 的, 不关心代码中是否使用, 可以保证在目标环境一定可用

`useBuiltIns: 'usage'` 目前还是实验性的配置, 它会分析代码调用, 但是对于原型链上的方法仅仅按照方法名去匹配, 可以得到更小的 polyfill 体积. 但是它不会去分析代码依赖的 npm 包的内容, 如果某个 npm 包是需要一些 polyfill 的, 那这些 polyfill 并不会被打包进去

`core-js`3版本和2版本暂未发现有什么区别

### 现在我们接入webpack

安装`webpack,babel-loader`

```
npm install webpack -D
npm install webpack-cli -D
npm install babel-loader -D
```

在`webpack.config.js`中加入

```javascript
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader'
      }
    }
  ]
}
```

编译后的代码太长了，就不贴了，反正就是高版本语法和api都被做处理了，但不会对`node_modules`里的文件做处理。

#### 参考文献

- [一口(很长的)气了解 babel](https://juejin.im/post/5c19c5e0e51d4502a232c1c6)

- [babel能不能分析代码然后按需polyfill](https://juejin.im/post/5c09d6d35188256d9832df9d#heading-6)

  