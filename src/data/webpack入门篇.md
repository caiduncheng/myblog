---
title: 'webpack入门'
template: 'post'
tags: ['webpack']
date: '2020-05-31'
thumbnail: 'webpack.png'
categories: 'FrontPage'
description: '本篇主要研究一下webpack的基础知识，了解各个配置的意义，结合文档，手动搭建一个vue项目，并在搭建的过程中学习并实践。'
---

本篇主要研究一下webpack的基础知识，了解各个配置的意义，结合文档，手动搭建一个vue项目，并在搭建的过程中学习并实践。

### 安装

既然要搭建环境，就必须先把基础的包安装一下。

```javascript
yarn add vue -S
yarn add webpack -D
```

然后在更目录下新建一个**app.js**，执行`webpack app.js`，没成功，提示安装`webpack-cli`，这个好像是webpack4之后新增的，具体原因可以自行度娘。

```
yarn add webpack-cli -D
```

安装完成后，再次`webpack app.js`还是失败，还是提示安装`webpack-cli`，因为再使用`webpack-cli`命令时发现找不到，这时可以使用`./node_modules/.bin/webpack app.js`。但这样太麻烦了，可以在package.json中的script新增

```
"build": "webpack app.js"
```

然后`npm run  build`,可以看下dist下生成了`main.js`

为什么在这边配置了就能用了呢？具体原因可以看我的下一篇文章**webpack与npm包**。

### 起步


在app.js加入以下代码

```javascript
import Vue from 'vue'

new Vue({
    el: '#app',
    render: function (createElement) {
        return createElement('h1', 'welcome webpack')
    }
})
```
在根目录新建一个`index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="app">
    </div>
    <script src="./dist/main.js"></script>
</body>
</html>
```

### 自动打包编译

每次更新代码都要重新打包太麻烦，这里我们可以使用webpack的自动打包，这里可以使用**[webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware)**。与接受`express`类型中间件的服务器一起使用，在这我们直接使用了`express`作为服务器。具体工作原理可以看我的**webpack热更新篇**，会有详细介绍。

在根目录新建一个`server.js`用于处理`webpack-dev-middleware`相关配置

```javascript
const path = require('path')
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const compiler = webpack({
  // webpack options
  entry: './src/app.js',
  mode: "development",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  }
});

const express = require('express');
const app = express();

// 将指定的一个或多个中间件函数安装在指定的路径上：当所请求路径的基数匹配时，将执行中间件函数path。
app.use(
  middleware(compiler, {
    // webpack-dev-middleware options
  })
);

// 设置express访问静态资源,path.resolve(__dirname, 'dist')作为访问的根路径
app.use(express.static(path.resolve(__dirname, 'dist')))

app.listen(3000, () => console.log('start on localhost:3000'));
```

在`package.json`新增`script`

```javascript
"dev": "node server.js"
```

运行后可以发现，每次代码更新后，代码都会重新打包。

### 引入热更新

在此之前，先把webpack的配置单独抽出来，放在`server.js`中不是很合适，在根目录新增`webpack.config.js`,
为了能每次保存都自动页面自动更新，提高开发效率，我们引入热更新[webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware)。

```javascript
yarn add webpack-hot-middleware -D
```

为了看出效果，我们再`dist`目录下，新建一个`index.html`文件

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="app">
    </div>
    <script src="./main.js"></script>
</body>
</html>
```

必须放在`dist`目录下，因为`express`启动的服务只配置了映射`dist`目录，然后要使用`localhost:xxxx`打开，这样`<script src="./main.js"></script>`引入的js才是跑在服务器的js，才能实时更新。

然后在webpack的plugins引入热更新

`webpack.config.js`

```javascript
const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: ['webpack-hot-middleware/client?noInfo=true&reload=true' , './src/app.js'],
    mode: "development",
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ]    
}
```

entry使用一个数组的话，会将数组里的js打包在一起，`webpack-hot-middleware/client`的真实路径是`node_moudule/webpack-hot-middleware/client`，至于为什么要用`webpack-hot-middleware/client?noInfo=true&reload=true`，将在**webpack热更新篇详细讲解**

然后也要在`server.js`里配置下热更新

```javascript
const path = require("path");
const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("./webpack.config.js");
const hotMiddleware = require("webpack-hot-middleware");
const compiler = webpack(webpackConfig);

const express = require("express");
const app = express();

// 将指定的一个或多个中间件函数安装在指定的路径上：当所请求路径的基数匹配时，将执行中间件函数path。
app.use(
  devMiddleware(compiler, {
    // webpack-dev-middleware options
  })
);
app.use(hotMiddleware(compiler));

// 设置express访问静态资源,path.resolve(__dirname, 'dist')作为访问的根路径
app.use(express.static(path.resolve(__dirname, "dist")));

app.listen(3000, () => console.log("Example app listening on port 3000!"));

```

### 配置loader

现在项目能正常跑起来了，也能自动打包编译，热更新。现在我们要做一些页面级的配置了。例如自持`.vue`文件、支持`.scss`文件等。这时就要用到`webpack`一个重要的工具的—[loader](https://www.webpackjs.com/concepts/loaders/)。简单的说就是将一些不是js的文件转成js文件，然后可以在js中直接使用。想详细了解的可以去官网看下对它的解释。

在这边我引入几个必须的loader。

```javascript
yarn add vue-loader css-loader style-loader -D
```

然后配置相应的`rule`，`vue-loader`处理在这里配置之外还有些其他配置，具体看官方文档—[vue-loader](https://vue-loader.vuejs.org/)，写的非常清楚。

```javascript
module: {
  rules: [
    {
      test: /\.vue$/,
      use: "vue-loader"
    },
    {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    },
    {
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"]
    },
    {
      test: /\.(js|vue)$/,
      use: ["eslint-loader"],
      exclude: /node_moudles/,
    }
  ]
}
```

个人比较习惯的css预处理器是`sass`，所以一起引入了，看官可以根据自己的喜好去引入css预处理。为了统一代码风格，我顺便引入`ESLint + Prettier`来规范代码，当然这个不是必须的。这里提供两篇文章，看官自行操作吧，没什么好讲的。[eslint-loader](https://webpack.js.org/loaders/eslint-loader/#root)和[ESLint + Prettier](https://segmentfault.com/a/1190000015315545)。

### 打包
终于到了打包这步了，为了区分线上和线下环境，我们引入了`cross-env`，它可以跨平台的设置和使用环境变量的脚本。 

```
yarn add cross-env -D
```

在`package.json`添加新的`script`

```javascript
"build": "cross-env NODE_ENV=production webpack",
"start": " cross-env NODE_ENV=development node server.js"
```

这样我们在`server.js`通过`process.env.NODE_ENV`拿到是开发环境还是线上环境了，在线下环境的化就不需要使用`webpack-dev-middeleware`和`webpack-hot-middleware`这两个中间件了。同时把`webpack.config.js`中的`entry`中用于热更新的`webpack-hot-middleware/client`移到`server.js`。

```javascript
const env = process.env.NODE_ENV

if (env !== 'production') {
  // 将指定的一个或多个中间件函数安装在指定的路径上：当所请求路径的基数匹配时，将执行中间件函数path。
  app.use(
    devMiddleware(compiler, {
      // webpack-dev-middleware options
    })
  );
  // 将热更新需要的入口文件移到这里
  compiler.options.entry.push("webpack-hot-middleware/client?noInfo=true&reload=true")
  app.use(hotMiddleware(compiler));
}

// 设置express访问静态资源,path.resolve(__dirname, 'dist')作为访问的根路径
app.use(express.static(path.resolve(__dirname, "dist")));
```
同时给`webpack.config.js`添加[mode](https://webpack.js.org/configuration/mode/#root)

```javascript
mode: process.env.NODE_ENV === "production" ? "production" : "development"
```
### 缓存

为了更好的用户体验，我们一般会设置缓存。这样的话上面的代码就会出问题了，`index.html`引用的`script`永远都是`main.js`，这样即使我们修改了代码，访问到的也是之前的代码。

解决方法也很简单，就是每次修改完，给打包后的文件一个与之前都不相同的文件名，然后让`index.html`去引用这个心的文件就不会走缓存了。

那怎么让每次打包后的文件名都不一样呢？用hash，好在webpack已经提供了这么一个功能。修改`webpack.config.js`

```javascript
output: {
  path: path.resolve(__dirname, "dist"),
  filename: "[name].[hash:8].js"
}
```

现在，在`npm run build`可以发现`dist`下生成了一个带有`hash`值的文件。

但会发现之前生成的文件并不会被删除，虽然不影响，但看着不舒服。可以使用[CleanWebpackPlugin]()(https://github.com/johnagan/clean-webpack-plugin)，在每次打包完成后，都会清空先清空`dist`文件夹。

但是这样不是每次都要去新增一个`index.html`， 同时还要修改`script`引入的文件名，明显不合实际。这肯定也有插件帮你做了，[HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin)可以帮你自动去生成一个`index.html`文件，同时帮你把引入的`js`文件名也一并解决。

```javascript
yarn add CleanWebpackPlugin -D
yarn add HtmlWebpackPlugin -D
```

### 最后

最后贴上`webpack.config.js`和`server.js`的完整代码

**webpack.config.js**

```javascript
const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: ["./src/main.js"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[hash:8].js"
  },
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(js|vue)$/,
        use: ["eslint-loader"],
        exclude: /node_moudles/
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ]
};
```
**server.js**

```javascript
const path = require("path");
const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("./webpack.config.js");
const hotMiddleware = require("webpack-hot-middleware");
const compiler = webpack(webpackConfig);
const env = process.env.NODE_ENV

const express = require("express");
const app = express();

console.log('env',env)
if (env !== 'production') {
  // 将指定的一个或多个中间件函数安装在指定的路径上：当所请求路径的基数匹配时，将执行中间件函数path。
  app.use(
    devMiddleware(compiler, {
      // webpack-dev-middleware options
    })
  );
  // 将热更新需要的入口文件移到这里
  compiler.options.entry.push("webpack-hot-middleware/client?noInfo=true&reload=true")
  app.use(hotMiddleware(compiler));
}

// 设置express访问静态资源,path.resolve(__dirname, 'dist')作为访问的根路径
app.use(express.static(path.resolve(__dirname, "dist")));

app.listen(3000, () => console.log("Example app listening on port 3000!"));

```



### 总结

一个用`webpack`搭建的很基础的`vue`项目完工了，虽然能正常跑起来，但还有很多的不足。平常做项目的话，个人还是推荐直接用`vue-cli`，不仅方便功能还齐全。有哪里写错了，欢迎指点。